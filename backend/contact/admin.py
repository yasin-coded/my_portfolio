from django.contrib import admin
from contact.models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    list_filter = ('is_read', 'created_at')
    list_editable = ('is_read',)
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
