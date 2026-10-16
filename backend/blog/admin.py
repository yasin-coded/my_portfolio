from django.contrib import admin
from blog.models import Category, Tag, Post, PostLike, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'published_at', 'views_count', 'reading_time', 'is_featured')
    search_fields = ('title', 'excerpt', 'content')
    list_filter = ('status', 'category', 'is_featured', 'published_at')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    readonly_fields = ('views_count', 'reading_time', 'published_at')


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('post', 'visitor_id', 'ip_address', 'created_at')
    search_fields = ('post__title', 'visitor_id', 'ip_address')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('name', 'post', 'email', 'is_approved', 'parent', 'created_at')
    search_fields = ('name', 'email', 'content', 'post__title')
    list_filter = ('is_approved', 'created_at')
    list_editable = ('is_approved',)
