"""
DevFolio Core URL Configuration.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from accounts.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    # SPEC §4 Authentication endpoints
    path('api/auth/', include('accounts.urls')),
    # Aliases for standard JWT endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Profile endpoint
    path('api/profile/', include('user_profile.urls')),
    # Portfolio endpoints (skills, skill-groups, experiences, education, projects)
    path('api/', include('portfolio.urls')),
    # Blog endpoints (posts, likes, comments, categories, tags)
    path('api/', include('blog.urls')),
]

# Serve media files in development (SPEC B-23)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
