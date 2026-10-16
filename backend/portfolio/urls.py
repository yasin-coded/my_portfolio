from django.urls import path, include
from rest_framework.routers import DefaultRouter

from portfolio.views import (
    SkillGroupViewSet,
    SkillSectionViewSet,
    SkillViewSet,
    ExperienceViewSet,
    EducationViewSet,
    ProjectViewSet,
)

router = DefaultRouter()
router.register(r'skill-groups', SkillGroupViewSet, basename='skillgroup')
router.register(r'skill-sections', SkillSectionViewSet, basename='skillsection')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'experiences', ExperienceViewSet, basename='experience')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]
