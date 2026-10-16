from rest_framework import serializers
from contact.models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    SPEC B-12 & B-21:
    Visitor contact submissions and owner message inbox.
    Validation: message 10-2000 chars, name >= 2 chars, valid email.
    """
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value

    def validate_message(self, value):
        length = len(value.strip())
        if length < 10 or length > 2000:
            raise serializers.ValidationError("Message must be between 10 and 2000 characters.")
        return value
