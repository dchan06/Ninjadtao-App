from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import *

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Django uses USERNAME_FIELD

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = userModel
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookedClasses
        fields = '__all__'

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classes
        fields = '__all__'