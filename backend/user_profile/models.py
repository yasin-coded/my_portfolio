from django.db import models
from django.core.exceptions import ValidationError
from core.models import TimeStampedModel


class Profile(TimeStampedModel):
    """
    Singleton profile model representing the portfolio owner.
    SPEC B-2: exactly one row, enforced in save() or clean().
    """
    full_name = models.CharField(max_length=150)
    headline = models.CharField(max_length=255)
    bio = models.TextField()
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    location = models.CharField(max_length=150)
    avatar = models.ImageField(upload_to='profiles/avatars/', blank=True, null=True)
    resume = models.FileField(upload_to='profiles/resumes/', blank=True, null=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    x_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    is_available_for_hire = models.BooleanField(default=True)
    hero_pitch = models.CharField(max_length=255, blank=True)
    typed_roles = models.JSONField(default=list, blank=True, help_text="List of strings for typing effect in hero")
    logo_text = models.CharField(max_length=50, default="yasin")

    def clean(self):
        super().clean()
        if Profile.objects.exclude(pk=self.pk).exists():
            raise ValidationError("A Profile instance already exists. Only one singleton profile is permitted.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Profile ({self.full_name})"

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profile"
