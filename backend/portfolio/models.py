from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from core.models import TimeStampedModel


class SkillGroup(TimeStampedModel):
    """
    A 'box' on the Skills section (e.g., Backend, Frontend, Database, Others).
    """
    title = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = "Skill Group"
        verbose_name_plural = "Skill Groups"

    def __str__(self):
        return self.title


class SkillSection(TimeStampedModel):
    """
    Sub-heading inside a skill group box (e.g., Languages Spoken, Tools, Soft Skills).
    """
    group = models.ForeignKey(SkillGroup, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = "Skill Section"
        verbose_name_plural = "Skill Sections"

    def __str__(self):
        return f"{self.group.title} -> {self.title}"


class Skill(TimeStampedModel):
    """
    Individual skill with proficiency level and category.
    """
    CATEGORY_CHOICES = [
        ('FRONTEND', 'Frontend'),
        ('BACKEND', 'Backend'),
        ('DATABASE', 'Database'),
        ('DEVOPS', 'DevOps'),
        ('TOOLS', 'Tools'),
        ('SOFT_SKILL', 'Soft Skill'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    proficiency = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Proficiency rating from 1 to 100"
    )
    icon = models.CharField(max_length=100, blank=True, help_text="Lucide icon name or image path")
    display_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    section = models.ForeignKey(
        SkillSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='skills'
    )

    class Meta:
        ordering = ['display_order', '-proficiency', 'name']
        verbose_name = "Skill"
        verbose_name_plural = "Skills"

    def __str__(self):
        return f"{self.name} ({self.proficiency}%)"


class Experience(TimeStampedModel):
    """
    Work experience entry ordered newest start_date first.
    """
    EMPLOYMENT_CHOICES = [
        ('FULL_TIME', 'Full-time'),
        ('PART_TIME', 'Part-time'),
        ('INTERNSHIP', 'Internship'),
        ('FREELANCE', 'Freelance'),
        ('CONTRACT', 'Contract'),
    ]

    company = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES, default='FULL_TIME')
    location = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField()
    company_url = models.URLField(blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-start_date', 'display_order']
        verbose_name = "Experience"
        verbose_name_plural = "Experiences"

    def __str__(self):
        return f"{self.role} at {self.company}"


class Education(TimeStampedModel):
    """
    Academic credentials and degrees.
    """
    institution = models.CharField(max_length=150)
    degree = models.CharField(max_length=150)
    field_of_study = models.CharField(max_length=150)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_year', 'id']
        verbose_name = "Education"
        verbose_name_plural = "Education"

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Project(TimeStampedModel):
    """
    Showcase projects with tech stack and live/repo links.
    """
    CATEGORY_CHOICES = [
        ('WEB', 'Web'),
        ('MOBILE', 'Mobile'),
        ('API', 'API'),
        ('ML', 'Machine Learning'),
        ('OTHER', 'Other'),
    ]

    title = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    summary = models.CharField(max_length=200, help_text="Short teaser under 200 characters")
    description = models.TextField()
    cover_image = models.ImageField(upload_to='projects/covers/')
    tech_stack = models.ManyToManyField(Skill, related_name='projects', blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='WEB')
    live_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    completed_date = models.DateField(null=True, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', '-completed_date', '-id']
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Project.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
