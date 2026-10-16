from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenBlacklistView,
)

from accounts.views import (
    CustomTokenObtainPairView,
    MeView,
    ChangePasswordView,
    RegisterNotFoundView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='auth_logout'),
    path('me/', MeView.as_view(), name='auth_me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('register/', RegisterNotFoundView.as_view(), name='auth_register'),
]
