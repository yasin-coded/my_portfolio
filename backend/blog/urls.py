from django.urls import path, include
from rest_framework.routers import DefaultRouter

from blog.views import (
    CategoryViewSet,
    TagViewSet,
    PostViewSet,
    PostLikeView,
    PostCommentViewSet,
    CommentModerationViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentModerationViewSet, basename='comment-moderation')

urlpatterns = [
    # Custom post sub-endpoints
    path('posts/<slug:slug>/like/', PostLikeView.as_view(), name='post_like_toggle'),
    path('posts/<slug:slug>/comments/', PostCommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='post_comments'),
    # ViewSet CRUD routes
    path('', include(router.urls)),
]
