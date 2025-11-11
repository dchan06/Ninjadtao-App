from django.urls import path

from .views import TestView
from .views import EmailTokenObtainPairView
from .views import AuthView
from .views import ClassesView


urlpatterns = [
    path('test/', TestView.as_view()),
    path('login/', EmailTokenObtainPairView.as_view(), name='email_login'),
    path('auth/', AuthView.as_view()),
    path('classes/', ClassesView.as_view()),
]


#localhost:8000/api/v1.0/user/test/
#localhost:8000/api/v1.0/user/login/
#localhost:8000/api/v1.0/user/profile/