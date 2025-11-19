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
            "userId": user.id,
        }

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = userModel
        fields = '__all__'

class ClassesNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classes
        fields = ['classId', 'class_name', 'class_date', 'start_time', 'end_time', 'instructor_name']

class BookingSerializer(serializers.ModelSerializer):
    classId = ClassesNestedSerializer(read_only=True)  # nested instead of just PK

    class Meta:
        model = BookedClasses
        fields = ['id', 'booking_date', 'classId']

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classes
        fields = '__all__'

class MembershipsBoughtSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipsBought
        fields = ['id', 'membership', 'purchase_date', 'start_date', 'expiration_date', 'credits_remaining']