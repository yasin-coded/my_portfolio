import math
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from core.models import TimeStampedModel


class Category(TimeStampedModel):
    """
    Blog post category.
    Protected from deletion if posts are assigned (B-21).
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(TimeStampedModel):
    """
    Blog post tag.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True, blank=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Tag"
        verbose_name_plural = "Tags"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Post(TimeStampedModel):
    """
    Blog article with markdown body, auto reading time, views count, and publish tracking.
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=270, unique=True, blank=True)
    excerpt = models.CharField(max_length=300, help_text="Short excerpt under 300 characters")
    content = models.TextField(help_text="Markdown format content")
    cover_image = models.ImageField(upload_to='blog/covers/', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='posts')
    tags = models.ManyToManyField(Tag, related_name='posts', blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    published_at = models.DateTimeField(null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    reading_time = models.PositiveIntegerField(default=1, help_text="Estimated minutes at ~200 wpm")
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def calculate_reading_time(self):
        words = len(self.content.split()) if self.content else 0
        minutes = math.ceil(words / 200)
        return max(1, minutes)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Calculate reading time automatically
        self.reading_time = self.calculate_reading_time()

        # Set published_at on first transition to PUBLISHED
        if self.status == 'PUBLISHED' and not self.published_at:
            self.published_at = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} [{self.status}]"


class PostLike(models.Model):
    """
    Like recorded per visitor UUID token (X-Visitor-Id).
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    visitor_id = models.CharField(max_length=64, help_text="Client generated UUID")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'visitor_id')
        ordering = ['-created_at']
        verbose_name = "Post Like"
        verbose_name_plural = "Post Likes"

    def __str__(self):
        return f"Like by {self.visitor_id} on {self.post.title}"


class Comment(TimeStampedModel):
    """
    Threaded visitor comments (max 1 level reply nesting).
    Approved comments only appear on the public API (B-11).
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=100)
    email = models.EmailField(help_text="Private, never exposed in public API")
    website = models.URLField(blank=True)
    content = models.TextField()
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    is_approved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        status = "Approved" if self.is_approved else "Pending"
        return f"Comment by {self.name} on {self.post.title} [{status}]"
