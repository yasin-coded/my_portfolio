from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from contact.models import ContactMessage
from contact.serializers import ContactMessageSerializer
from core.pagination import TenPerPagePagination
from core.throttles import ContactCreateThrottle
from accounts.permissions import IsOwner


class ContactViewSet(viewsets.ModelViewSet):
    """
    SPEC B-12, B-17 & §4:
    - POST /api/contact/ (Public): Throttled (3/hr per IP), message 10-2000 chars.
    - GET /api/contact/ (Owner): 10/page, filterable by is_read.
    - PATCH / DELETE /api/contact/<id>/ (Owner): Mark as read or delete message.
    """
    serializer_class = ContactMessageSerializer
    pagination_class = TenPerPagePagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_read']

    def get_queryset(self):
        return ContactMessage.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsOwner()]

    def get_throttles(self):
        if self.action == 'create':
            return [ContactCreateThrottle()]
        return []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "detail": "Thank you! Your message has been sent successfully.",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
