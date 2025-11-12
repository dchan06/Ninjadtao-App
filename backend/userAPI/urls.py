from django.urls import path

from .views import *


urlpatterns = [
    path('test/', TestView.as_view()),
    path('login/', EmailTokenObtainPairView.as_view(), name='email_login'),
    path('auth/', AuthView.as_view()),
    path('classes/', ClassesView.as_view()),
    path('cancel-booking/<int:class_id>/', CancelBookingView.as_view(), name='cancel-booking'),
    path("book-class/", BookingView.as_view(), name="book-class"),
]


#localhost:8000/api/v1.0/user/test/
#localhost:8000/api/v1.0/user/login/
#localhost:8000/api/v1.0/user/profile/