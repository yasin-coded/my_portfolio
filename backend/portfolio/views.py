from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from portfolio.models import SkillGroup, SkillSection, Skill, Experience, Education, Project
from portfolio.serializers import (
    SkillGroupNestedSerializer,
    SkillGroupSerializer,
    SkillSectionSerializer,
    SkillSerializer,
    ExperienceSerializer,
    EducationSerializer,
    ProjectSerializer,
)
from portfolio.filters import SkillFilter, ProjectFilter
from core.pagination import ProjectPagination
from accounts.permissions import IsOwnerOrReadOnly


class SkillGroupViewSet(viewsets.ModelViewSet):
    """
    SPEC §4: GET /api/skill-groups/
    Public nested tree: groups → sections → skills.
    Owner CRUD on groups.
    """
    queryset = SkillGroup.objects.all().prefetch_related('sections__skills')
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return SkillGroupNestedSerializer
        return SkillGroupSerializer


class SkillSectionViewSet(viewsets.ModelViewSet):
    """
    SPEC §4: Owner CRUD on /api/skill-sections/.
    """
    queryset = SkillSection.objects.all().select_related('group')
    serializer_class = SkillSectionSerializer
    permission_classes = [IsOwnerOrReadOnly]


class SkillViewSet(viewsets.ModelViewSet):
    """
    SPEC §4: GET /api/skills/
    Filter category, is_featured; search name; order display_order, -proficiency.
    """
    queryset = Skill.objects.all().select_related('section', 'section__group')
    serializer_class = SkillSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SkillFilter
    search_fields = ['name']
    ordering_fields = ['display_order', 'proficiency', 'name']
    ordering = ['display_order', '-proficiency']


class ExperienceViewSet(viewsets.ModelViewSet):
    """
    SPEC §4: GET /api/experiences/
    Ordered newest start_date first.
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['start_date', 'display_order']
    ordering = ['-start_date', 'display_order']


class EducationViewSet(viewsets.ModelViewSet):
    """
    SPEC §4: GET /api/education/
    Ordered newest start_year first.
    """
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['start_year']
    ordering = ['-start_year']


class ProjectViewSet(viewsets.ModelViewSet):
    """
    SPEC §4: GET /api/projects/ (9/page) and /api/projects/<slug>/
    Filter category, is_featured, tech; search title/summary/desc; order -completed_date, display_order.
    """
    queryset = Project.objects.all().prefetch_related('tech_stack')
    serializer_class = ProjectSerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = 'slug'
    pagination_class = ProjectPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjectFilter
    search_fields = ['title', 'summary', 'description']
    ordering_fields = ['completed_date', 'display_order', 'title']
    ordering = ['display_order', '-completed_date', '-id']
