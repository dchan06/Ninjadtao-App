#from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from . models import *
from . serializer import * 

from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class TestView(APIView):
    def get(self, request):
        print("API was called")
        return Response("Hello World!", status=200)
#localhost:8000/api/v1.0/user/test/

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(username=email, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "username": user.username, "userID": user.id}, status = 200)
        else:
            return Response({f"error": "Invalid credentials. email: {email}"}, status=400)
#localhost:8000/api/v1.0/user/login

class AuthView(APIView): 
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user

        # Get all booked classes for this user
        booked_classes = BookedClasses.objects.filter(userId=user)

        # Serialize them
        serializer = BookingSerializer(booked_classes, many=True)

        # Return user info + booked classes
        return Response({
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "membership_name": user.get_membershipName_display(),
            "booked_classes": serializer.data, 
        })

class BookingView(APIView): 
    def post(self, request): 
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)

class ClassesView(APIView):
    def get(self, request):
        date_param = request.query_params.get('date')

        if date_param:
            try:
                classes = Classes.objects.filter(class_date=date_param)
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            classes = Classes.objects.all()

        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
