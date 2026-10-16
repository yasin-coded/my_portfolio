from django.db.models import Count, Q, F
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from blog.models import Category, Tag, Post, PostLike, Comment
from blog.serializers import (
    CategorySerializer,
    TagSerializer,
    PostListSerializer,
    PostDetailSerializer,
    PublicCommentSerializer,
    CommentCreateSerializer,
    AdminCommentSerializer,
)
from blog.filters import PostFilter, CommentFilter
from core.pagination import PostPagination, TenPerPagePagination
from core.throttles import CommentCreateThrottle, LikeToggleThrottle
from accounts.permissions import IsOwnerOrReadOnly, IsOwner


class CategoryViewSet(viewsets.ModelViewSet):
    """
    SPEC B-7, B-21 & §4: Categories with published posts_count annotation.
    Protected deletion returns 400 with friendly message if posts are assigned.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        return Category.objects.annotate(
            posts_count=Count('posts', filter=Q(posts__status='PUBLISHED'))
        ).order_by('name')

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        post_count = category.posts.count()
        if post_count > 0:
            return Response(
                {"detail": f"Cannot delete category '{category.name}' because it is used by {post_count} post(s)."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class TagViewSet(viewsets.ModelViewSet):
    """
    SPEC B-8 & §4: Tags with published posts_count annotation.
    """
    serializer_class = TagSerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        return Tag.objects.annotate(
            posts_count=Count('posts', filter=Q(posts__status='PUBLISHED'))
        ).order_by('name')


class PostViewSet(viewsets.ModelViewSet):
    """
    SPEC B-9, B-15, B-16 & §4: Posts list and detail.
    - 6/page with count, next, previous, results
    - Visitors see PUBLISHED only; draft slug returns 404 for visitors
    - Owner can view and filter drafts via ?status=DRAFT / ?status=all
    - View counter guarded by X-Visitor-Id + cache cooldown + F() update
    """
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = 'slug'
    pagination_class = PostPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PostFilter
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'views_count', 'title']
    ordering = ['-published_at', '-created_at']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return PostDetailSerializer
        return PostListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Post.objects.select_related('category', 'author').prefetch_related('tags')

        # Annotate counts for list views
        qs = qs.annotate(
            likes_count=Count('likes', distinct=True),
            comments_count=Count('comments', filter=Q(comments__is_approved=True), distinct=True)
        )

        # Access control: visitors see PUBLISHED only
        if not (user.is_authenticated and user.is_superuser):
            return qs.filter(status='PUBLISHED')

        # Owner status filter support
        status_param = self.request.query_params.get('status')
        if status_param == 'DRAFT':
            return qs.filter(status='DRAFT')
        elif status_param == 'PUBLISHED':
            return qs.filter(status='PUBLISHED')

        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # SPEC B-16: View counter guarded by X-Visitor-Id + 30-min cache cooldown + F() update
        visitor_id = request.headers.get('X-Visitor-Id') or request.META.get('REMOTE_ADDR')
        if visitor_id:
            cache_key = f"post_view:{instance.slug}:{visitor_id}"
            if not cache.get(cache_key):
                Post.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
                cache.set(cache_key, True, timeout=1800)  # 30-minute cooldown
                instance.refresh_from_db(fields=['views_count'])

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostLikeView(APIView):
    """
    SPEC B-10, B-17 & Acceptance Test 6:
    POST /api/posts/<slug>/like/
    - Requires X-Visitor-Id (400 if missing)
    - Toggles like record
    - Returns {"liked": bool, "likes_count": int}
    """
    permission_classes = [AllowAny]
    throttle_classes = [LikeToggleThrottle]

    def post(self, request, slug):
        visitor_id = request.headers.get('X-Visitor-Id')
        if not visitor_id or not visitor_id.strip():
            return Response(
                {"detail": "X-Visitor-Id header is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        post = get_object_or_404(Post, slug=slug)
        ip_addr = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
        if ip_addr and ',' in ip_addr:
            ip_addr = ip_addr.split(',')[0].strip()

        like, created = PostLike.objects.get_or_create(
            post=post,
            visitor_id=visitor_id.strip(),
            defaults={'ip_address': ip_addr}
        )

        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        return Response(
            {"liked": liked, "likes_count": post.likes.count()},
            status=status.HTTP_200_OK
        )


class PostCommentViewSet(viewsets.GenericViewSet):
    """
    SPEC B-11, B-17, S-8 & Acceptance Test 5:
    GET /api/posts/<slug>/comments/ -> approved only, threaded, 10/page, no emails.
    POST /api/posts/<slug>/comments/ -> throttled, created unapproved (201).
    """
    lookup_field = 'slug'
    pagination_class = TenPerPagePagination

    def get_permissions(self):
        return [AllowAny()]

    def get_throttles(self):
        if self.action == 'create':
            return [CommentCreateThrottle()]
        return []

    def list(self, request, slug):
        post = get_object_or_404(Post, slug=slug)
        # Only top-level approved comments; replies nested via serializer
        qs = Comment.objects.filter(
            post=post,
            is_approved=True,
            parent__isnull=True
        ).order_by('-created_at')

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = PublicCommentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PublicCommentSerializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, slug):
        post = get_object_or_404(Post, slug=slug)
        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(post=post, is_approved=False)
        return Response(
            {"detail": "Your comment is awaiting approval."},
            status=status.HTTP_201_CREATED
        )


class CommentModerationViewSet(viewsets.ModelViewSet):
    """
    SPEC §4: Owner comment moderation (/api/comments/).
    Filter by is_approved, post slug. Pending comments first.
    """
    permission_classes = [IsOwner]
    serializer_class = AdminCommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CommentFilter
    pagination_class = TenPerPagePagination

    def get_queryset(self):
        return Comment.objects.select_related('post').order_by('is_approved', '-created_at')
