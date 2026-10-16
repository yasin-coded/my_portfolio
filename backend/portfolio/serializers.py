from django.utils import timezone
from rest_framework import serializers

from portfolio.models import SkillGroup, SkillSection, Skill, Experience, Education, Project
from core.utils import validate_image_file


class SkillSerializer(serializers.ModelSerializer):
    """
    SPEC B-3 & B-21:
    Individual skill with 1-100 proficiency validation and section relation.
    """
    section_title = serializers.CharField(source='section.title', read_only=True)
    group_title = serializers.CharField(source='section.group.title', read_only=True)

    class Meta:
        model = Skill
        fields = [
            'id',
            'name',
            'category',
            'proficiency',
            'icon',
            'display_order',
            'is_featured',
            'section',
            'section_title',
            'group_title',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_proficiency(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Proficiency must be an integer between 1 and 100.")
        return value


class SkillSectionNestedSerializer(serializers.ModelSerializer):
    """
    Nested section serializer including its skills.
    """
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = SkillSection
        fields = ['id', 'group', 'title', 'display_order', 'skills']


class SkillGroupNestedSerializer(serializers.ModelSerializer):
    """
    SPEC §4: GET /api/skill-groups/
    Nested groups → sections → skills.
    """
    sections = SkillSectionNestedSerializer(many=True, read_only=True)

    class Meta:
        model = SkillGroup
        fields = ['id', 'title', 'display_order', 'sections']


class SkillGroupSerializer(serializers.ModelSerializer):
    """
    Owner CRUD serializer for SkillGroup boxes.
    """
    class Meta:
        model = SkillGroup
        fields = ['id', 'title', 'display_order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SkillSectionSerializer(serializers.ModelSerializer):
    """
    Owner CRUD serializer for SkillSection sub-headings.
    """
    class Meta:
        model = SkillSection
        fields = ['id', 'group', 'title', 'display_order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExperienceSerializer(serializers.ModelSerializer):
    """
    SPEC B-4 & B-21:
    Work experience with date validations:
    - start_date not in future
    - is_current -> no end_date
    - not is_current -> end_date required and after start_date
    """
    class Meta:
        model = Experience
        fields = [
            'id',
            'company',
            'role',
            'employment_type',
            'location',
            'start_date',
            'end_date',
            'is_current',
            'description',
            'company_url',
            'display_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        is_current = attrs.get('is_current', getattr(self.instance, 'is_current', False))

        today = timezone.now().date()

        if start_date and start_date > today:
            raise serializers.ValidationError({"start_date": "Start date cannot be in the future."})

        if is_current:
            if end_date is not None:
                raise serializers.ValidationError({"end_date": "Current experience must not have an end date."})
        else:
            if not end_date:
                raise serializers.ValidationError({"end_date": "End date is required for past experience."})
            if start_date and end_date and end_date < start_date:
                raise serializers.ValidationError({"end_date": "End date must be on or after start date."})

        return attrs


class EducationSerializer(serializers.ModelSerializer):
    """
    SPEC B-5: Academic credentials and degrees.
    """
    class Meta:
        model = Education
        fields = [
            'id',
            'institution',
            'degree',
            'field_of_study',
            'start_year',
            'end_year',
            'grade',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        start_year = attrs.get('start_year', getattr(self.instance, 'start_year', None))
        end_year = attrs.get('end_year', getattr(self.instance, 'end_year', None))

        if start_year and end_year and end_year < start_year:
            raise serializers.ValidationError({"end_year": "End year cannot be earlier than start year."})

        return attrs


class SkillSimpleSerializer(serializers.ModelSerializer):
    """Compact skill representation for project tech stack chips."""
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'icon']


class ProjectSerializer(serializers.ModelSerializer):
    """
    SPEC B-6, B-21, B-23:
    Project serializer with M2M tech stack, absolute cover image, and link validation.
    """
    tech_stack_details = SkillSimpleSerializer(source='tech_stack', many=True, read_only=True)
    tech_stack = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        required=False
    )

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'description',
            'cover_image',
            'tech_stack',
            'tech_stack_details',
            'category',
            'live_url',
            'github_url',
            'is_featured',
            'completed_date',
            'display_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def validate_summary(self, value):
        if len(value) > 200:
            raise serializers.ValidationError("Summary must be 200 characters or fewer.")
        return value

    def validate_cover_image(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate(self, attrs):
        live_url = attrs.get('live_url', getattr(self.instance, 'live_url', ''))
        github_url = attrs.get('github_url', getattr(self.instance, 'github_url', ''))

        if not live_url and not github_url:
            raise serializers.ValidationError(
                "At least one of Live URL or GitHub URL must be provided."
            )

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        if data.get('cover_image') and request:
            data['cover_image'] = request.build_absolute_uri(instance.cover_image.url)
        elif data.get('cover_image') and not data['cover_image'].startswith('http'):
            data['cover_image'] = f"http://127.0.0.1:8000{instance.cover_image.url}"

        return data
