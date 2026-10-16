from django.contrib import admin
from user_profile.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'headline', 'email', 'phone', 'is_available_for_hire', 'updated_at')
    search_fields = ('full_name', 'email', 'headline', 'bio')
    list_filter = ('is_available_for_hire', 'created_at')

    def has_add_permission(self, request):
        # Enforce singleton in admin: disable add button if profile already exists
        if Profile.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        # Prevent accidental deletion of singleton profile in admin
        return False
