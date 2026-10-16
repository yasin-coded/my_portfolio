from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    SPEC §4: {username, password} → {access, refresh, user: {id, username, email}}.
    Generic 401 error message without username enumeration.
    Enforces that only superuser can log in as owner.
    """
    default_error_messages = {
        'no_active_account': 'Invalid username or password.'
    }

    def validate(self, attrs):
        data = super().validate(attrs)

        # Enforce that only the superuser owner can obtain an owner session
        if not self.user.is_superuser:
            raise AuthenticationFailed('Invalid username or password.')

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    Serializes owner information for session restoration via /api/auth/me/.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_superuser')
        read_only_fields = fields


class ChangePasswordSerializer(serializers.Serializer):
    """
    SPEC §4: Owner change password endpoint.
    Verifies old password and validates new password strength.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect current password.")
        return value

    def validate_new_password(self, value):
        user = self.context['request'].user
        validate_password(value, user=user)
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
