from rest_framework import serializers
from django.utils import timezone

from blog.models import Category, Tag, Post, PostLike, Comment
from core.utils import validate_image_file


class CategorySerializer(serializers.ModelSerializer):
    """
    SPEC B-7 & §4: Blog categories with published posts_count annotation.
    """
    posts_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'posts_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'posts_count', 'created_at', 'updated_at']


class TagSerializer(serializers.ModelSerializer):
    """
    SPEC B-8 & §4: Blog tags with published posts_count annotation.
    """
    posts_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'posts_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'posts_count', 'created_at', 'updated_at']


class PostSimpleSerializer(serializers.ModelSerializer):
    """Compact serializer for related posts representation."""
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'excerpt', 'cover_image', 'published_at', 'reading_time']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if data.get('cover_image') and request:
            data['cover_image'] = request.build_absolute_uri(instance.cover_image.url)
        elif data.get('cover_image') and not data['cover_image'].startswith('http'):
            data['cover_image'] = f"http://127.0.0.1:8000{instance.cover_image.url}"
        return data


class PostListSerializer(serializers.ModelSerializer):
    """
    SPEC §4: Posts list serializer (6/page).
    Includes likes_count and comments_count annotations.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    tags_details = TagSerializer(source='tags', many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True, default=0)
    comments_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'cover_image',
            'category',
            'category_name',
            'category_slug',
            'tags',
            'tags_details',
            'author',
            'author_name',
            'status',
            'published_at',
            'views_count',
            'reading_time',
            'is_featured',
            'likes_count',
            'comments_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'author',
            'views_count',
            'reading_time',
            'published_at',
            'likes_count',
            'comments_count',
            'created_at',
            'updated_at',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if data.get('cover_image') and request:
            data['cover_image'] = request.build_absolute_uri(instance.cover_image.url)
        elif data.get('cover_image') and not data['cover_image'].startswith('http'):
            data['cover_image'] = f"http://127.0.0.1:8000{instance.cover_image.url}"
        return data


class PostDetailSerializer(serializers.ModelSerializer):
    """
    SPEC B-9, B-16, B-21, B-23:
    Full post detail with markdown content, is_liked (via X-Visitor-Id), and related posts.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    tags_details = TagSerializer(source='tags', many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    related_posts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'cover_image',
            'category',
            'category_name',
            'category_slug',
            'tags',
            'tags_details',
            'author',
            'author_name',
            'status',
            'published_at',
            'views_count',
            'reading_time',
            'is_featured',
            'likes_count',
            'comments_count',
            'is_liked',
            'related_posts',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'author',
            'views_count',
            'reading_time',
            'published_at',
            'likes_count',
            'comments_count',
            'is_liked',
            'related_posts',
            'created_at',
            'updated_at',
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        visitor_id = request.headers.get('X-Visitor-Id')
        if not visitor_id:
            return False
        return obj.likes.filter(visitor_id=visitor_id).exists()

    def get_related_posts(self, obj):
        """Up to 3 published posts in same category, excluding current post."""
        qs = Post.objects.filter(
            category=obj.category,
            status='PUBLISHED'
        ).exclude(pk=obj.pk).order_by('-published_at')[:3]
        return PostSimpleSerializer(qs, many=True, context=self.context).data

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Post title must be at least 5 characters long.")
        return value

    def validate_cover_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate(self, attrs):
        status_val = attrs.get('status', getattr(self.instance, 'status', 'DRAFT'))
        content = attrs.get('content', getattr(self.instance, 'content', ''))
        category = attrs.get('category', getattr(self.instance, 'category', None))

        # SPEC B-21: Cannot PUBLISH with content < 100 chars or no category
        if status_val == 'PUBLISHED':
            if not category:
                raise serializers.ValidationError({"category": "A category is required to publish a post."})
            if len(content.strip()) < 100:
                raise serializers.ValidationError({"content": "Content must be at least 100 characters to publish."})

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if data.get('cover_image') and request:
            data['cover_image'] = request.build_absolute_uri(instance.cover_image.url)
        elif data.get('cover_image') and not data['cover_image'].startswith('http'):
            data['cover_image'] = f"http://127.0.0.1:8000{instance.cover_image.url}"
        return data


class CommentReplySerializer(serializers.ModelSerializer):
    """Nested 1-level reply for public comment thread (SPEC S-8: no email)."""
    class Meta:
        model = Comment
        fields = ['id', 'name', 'website', 'content', 'parent', 'created_at']


class PublicCommentSerializer(serializers.ModelSerializer):
    """
    SPEC B-11, S-8 & §4: Public threaded comments.
    Approved only; emails strictly omitted.
    """
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'name', 'website', 'content', 'parent', 'replies', 'created_at']

    def get_replies(self, obj):
        # Only return approved replies
        replies_qs = obj.replies.filter(is_approved=True).order_by('created_at')
        return CommentReplySerializer(replies_qs, many=True).data


class CommentCreateSerializer(serializers.ModelSerializer):
    """
    SPEC B-11, B-21:
    Visitor comment submission.
    Validation: content 5-1000 chars, name >= 2 chars, valid email.
    Saves with is_approved=False.
    """
    website = serializers.URLField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'name', 'email', 'website', 'content', 'parent']
        read_only_fields = ['id', 'post']

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value

    def validate_website(self, value):
        return value or ""

    def validate_content(self, value):
        length = len(value.strip())
        if length < 5 or length > 1000:
            raise serializers.ValidationError("Comment content must be between 5 and 1000 characters.")
        return value

    def validate_parent(self, value):
        if value:
            # Enforce max 1 level of nesting: if replying to a reply, attach to its root parent
            if value.parent is not None:
                return value.parent
        return value

    def create(self, validated_data):
        validated_data['is_approved'] = False
        return super().create(validated_data)


class AdminCommentSerializer(serializers.ModelSerializer):
    """
    SPEC §4: Owner comment moderation serializer (includes private email).
    """
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_slug = serializers.CharField(source='post.slug', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'post_title',
            'post_slug',
            'name',
            'email',
            'website',
            'content',
            'parent',
            'is_approved',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
