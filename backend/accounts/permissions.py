from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    """
    SPEC B-13:
    - SAFE_METHODS (GET, HEAD, OPTIONS) permitted for any visitor.
    - Any write operation permitted only if request.user is authenticated and is a superuser.
    - Rejects non-superusers with 403 and unauthenticated users with 401.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class IsOwner(BasePermission):
    """
    SPEC B-13:
    Owner-only access for sensitive endpoints (e.g., auth/me, dashboard stats,
    comment moderation, contact inbox).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)
