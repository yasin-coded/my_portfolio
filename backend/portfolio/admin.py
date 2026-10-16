from django.contrib import admin
from portfolio.models import SkillGroup, SkillSection, Skill, Experience, Education, Project


@admin.register(SkillGroup)
class SkillGroupAdmin(admin.ModelAdmin):
    list_display = ('title', 'display_order', 'created_at')
    search_fields = ('title',)
    list_filter = ('created_at',)


@admin.register(SkillSection)
class SkillSectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'group', 'display_order', 'created_at')
    search_fields = ('title', 'group__title')
    list_filter = ('group', 'created_at')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'proficiency', 'section', 'is_featured', 'display_order')
    search_fields = ('name', 'section__title')
    list_filter = ('category', 'is_featured', 'section__group')
    list_editable = ('proficiency', 'display_order', 'is_featured')


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'company', 'employment_type', 'start_date', 'end_date', 'is_current', 'display_order')
    search_fields = ('role', 'company', 'location', 'description')
    list_filter = ('employment_type', 'is_current', 'start_date')


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'institution', 'field_of_study', 'start_year', 'end_year', 'grade')
    search_fields = ('degree', 'institution', 'field_of_study')
    list_filter = ('start_year', 'end_year')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_featured', 'completed_date', 'display_order', 'created_at')
    search_fields = ('title', 'summary', 'description', 'tech_stack__name')
    list_filter = ('category', 'is_featured', 'completed_date')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tech_stack',)
