from rest_framework import serializers
from user_profile.models import Profile
from core.utils import validate_image_file, validate_pdf_file


class ProfileSerializer(serializers.ModelSerializer):
    """
    SPEC B-2: Public single-object profile serializer.
    Includes avatar, resume (with absolute URLs B-23), social links, hero configs.
    Validates file sizes/formats per SPEC B-21.
    """
    class Meta:
        model = Profile
        fields = [
            'id',
            'full_name',
            'headline',
            'bio',
            'email',
            'phone',
            'location',
            'avatar',
            'resume',
            'github_url',
            'linkedin_url',
            'x_url',
            'website_url',
            'years_of_experience',
            'is_available_for_hire',
            'hero_pitch',
            'typed_roles',
            'logo_text',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_avatar(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate_resume(self, value):
        if value:
            validate_pdf_file(value)
        return value

    def to_representation(self, instance):
        """
        Ensure avatar and resume URLs are absolute (SPEC B-23).
        """
        data = super().to_representation(instance)
        request = self.context.get('request')

        if data.get('avatar') and request:
            data['avatar'] = request.build_absolute_uri(instance.avatar.url)
        elif data.get('avatar') and not data['avatar'].startswith('http'):
            # Fallback if request is not in context
            data['avatar'] = f"http://127.0.0.1:8000{instance.avatar.url}"

        if data.get('resume') and request:
            data['resume'] = request.build_absolute_uri(instance.resume.url)
        elif data.get('resume') and not data['resume'].startswith('http'):
            data['resume'] = f"http://127.0.0.1:8000{instance.resume.url}"

        return data
