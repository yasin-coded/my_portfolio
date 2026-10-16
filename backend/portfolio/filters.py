import django_filters
from portfolio.models import Skill, Project


class SkillFilter(django_filters.FilterSet):
    """
    SPEC §4: Filter skills by category and featured status.
    """
    class Meta:
        model = Skill
        fields = ['category', 'is_featured']


class ProjectFilter(django_filters.FilterSet):
    """
    SPEC §4: Filter projects by category, is_featured, and tech (skill id or name).
    """
    tech = django_filters.CharFilter(method='filter_by_tech')

    class Meta:
        model = Project
        fields = ['category', 'is_featured']

    def filter_by_tech(self, queryset, name, value):
        if not value:
            return queryset
        if value.isdigit():
            return queryset.filter(tech_stack__id=int(value)).distinct()
        return queryset.filter(tech_stack__name__iexact=value).distinct()
