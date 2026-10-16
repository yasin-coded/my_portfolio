import django_filters
from blog.models import Post, Comment


class PostFilter(django_filters.FilterSet):
    """
    SPEC §4: Filter posts by category slug, tag slug, and is_featured.
    """
    category = django_filters.CharFilter(field_name='category__slug')
    tag = django_filters.CharFilter(field_name='tags__slug')
    status = django_filters.CharFilter(method='filter_status')

    class Meta:
        model = Post
        fields = ['category', 'tag', 'is_featured', 'status']

    def filter_status(self, queryset, name, value):
        # Status filtering is only accessible to superuser owner; handled in view get_queryset()
        return queryset


class CommentFilter(django_filters.FilterSet):
    """
    SPEC §4: Filter comments for moderation by approval status and post slug.
    """
    post = django_filters.CharFilter(field_name='post__slug')

    class Meta:
        model = Comment
        fields = ['is_approved', 'post']
