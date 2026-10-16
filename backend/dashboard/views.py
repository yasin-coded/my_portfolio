from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Q, F
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from blog.models import Post, PostLike, Comment
from portfolio.models import Project, Skill
from contact.models import ContactMessage
from accounts.permissions import IsOwner


class DashboardStatsView(APIView):
    """
    SPEC §4: GET /api/dashboard/stats/
    Returns all aggregated statistics for the owner dashboard in a single payload.
    Uses ORM aggregation (Count, Sum, annotate) without row-iterating loops.
    """
    permission_classes = [IsOwner]

    def get(self, request):
        # 1. Post metrics
        posts_aggs = Post.objects.aggregate(
            total_posts=Count('id'),
            published_posts=Count('id', filter=Q(status='PUBLISHED')),
            draft_posts=Count('id', filter=Q(status='DRAFT')),
            total_views=Sum('views_count'),
        )
        total_posts = posts_aggs['total_posts'] or 0
        published_posts = posts_aggs['published_posts'] or 0
        draft_posts = posts_aggs['draft_posts'] or 0
        total_views = posts_aggs['total_views'] or 0

        # 2. Portfolio metrics
        total_projects = Project.objects.count()
        total_skills = Skill.objects.count()

        # 3. Comment metrics
        comments_aggs = Comment.objects.aggregate(
            total_comments=Count('id'),
            pending_comments=Count('id', filter=Q(is_approved=False)),
        )
        total_comments = comments_aggs['total_comments'] or 0
        pending_comments = comments_aggs['pending_comments'] or 0

        # 4. Likes and messages
        total_likes = PostLike.objects.count()
        unread_messages = ContactMessage.objects.filter(is_read=False).count()

        # 5. Top 5 posts by views
        top_posts_qs = (
            Post.objects.annotate(likes_count=Count('likes'))
            .order_by('-views_count', '-id')[:5]
            .values('title', 'slug', 'views_count', 'likes_count')
        )
        top_posts = list(top_posts_qs)

        # 6. Latest 5 comments
        recent_comments_qs = (
            Comment.objects.select_related('post')
            .order_by('-created_at')[:5]
            .values(
                'id',
                'name',
                'content',
                'is_approved',
                'created_at',
                post_title=F('post__title'),
                post_slug=F('post__slug')
            )
        )
        recent_comments = list(recent_comments_qs)

        # 7. Posts per month (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_qs = (
            Post.objects.filter(published_at__gte=six_months_ago, status='PUBLISHED')
            .annotate(month=TruncMonth('published_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        posts_per_month = [
            {
                'month': entry['month'].strftime('%Y-%m') if entry['month'] else '',
                'count': entry['count']
            }
            for entry in monthly_qs
        ]

        payload = {
            'total_posts': total_posts,
            'published_posts': published_posts,
            'draft_posts': draft_posts,
            'total_projects': total_projects,
            'total_skills': total_skills,
            'total_comments': total_comments,
            'pending_comments': pending_comments,
            'total_likes': total_likes,
            'total_views': total_views,
            'unread_messages': unread_messages,
            'top_posts': top_posts,
            'recent_comments': recent_comments,
            'posts_per_month': posts_per_month,
        }

        return Response(payload, status=status.HTTP_200_OK)
