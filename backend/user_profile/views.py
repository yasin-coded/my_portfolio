from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from user_profile.models import Profile
from user_profile.serializers import ProfileSerializer
from accounts.permissions import IsOwnerOrReadOnly


class ProfileView(APIView):
    """
    SPEC B-2 & §4:
    GET /api/profile/ (Public) -> returns single profile object, not a list.
    PATCH /api/profile/ (Owner) -> multipart update for avatar, resume, and profile details.
    """
    permission_classes = [IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            # Return 200 OK with default skeleton if profile has not been populated yet
            default_data = {
                "id": None,
                "full_name": "",
                "headline": "",
                "bio": "",
                "email": "",
                "phone": "",
                "location": "",
                "avatar": None,
                "resume": None,
                "github_url": "",
                "linkedin_url": "",
                "x_url": "",
                "website_url": "",
                "years_of_experience": 0,
                "is_available_for_hire": True,
                "hero_pitch": "",
                "typed_roles": [],
                "logo_text": "DevFolio",
            }
            return Response(default_data, status=status.HTTP_200_OK)
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = Profile.objects.first()
        if not profile:
            # Create the initial singleton if it doesn't exist yet
            serializer = ProfileSerializer(data=request.data, context={'request': request})
        else:
            serializer = ProfileSerializer(
                profile,
                data=request.data,
                partial=True,
                context={'request': request}
            )

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        return self.patch(request)
