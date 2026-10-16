from django.urls import path
from user_profile.views import ProfileView

urlpatterns = [
    path('', ProfileView.as_view(), name='profile_detail'),
]
