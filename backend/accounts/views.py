from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.permissions import IsOwner
from accounts.serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    SPEC §4: POST /api/auth/login/
    Returns access, refresh tokens and user profile.
    """
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    """
    SPEC §4: GET /api/auth/me/
    Restore session state for owner.
    """
    permission_classes = [IsOwner]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    SPEC §4: POST /api/auth/change-password/
    Owner password change with old password verification.
    """
    permission_classes = [IsOwner]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK
        )


class RegisterNotFoundView(APIView):
    """
    SPEC B-14 & S-2: No registration endpoint.
    POST /api/auth/register/ must return 404.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        raise NotFound("Registration is disabled on this server.")

    def get(self, request, *args, **kwargs):
        raise NotFound("Registration is disabled on this server.")
