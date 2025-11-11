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
from datetime import datetime

from datetime import date

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
        today = date.today()

        # Get booked classes
        booked_classes = BookedClasses.objects.filter(userId=user, booking_date__gte=today)
        booking_serializer = BookingSerializer(booked_classes, many=True)

        # Get active membership (latest one that’s still valid)
        active_membership = MembershipsBought.objects.filter(
            userId=user,
            start_date__lte=today,
            expiration_date__gte=today
        ).order_by('-start_date').first()

        membership_serializer = (
            MembershipsBoughtSerializer(active_membership)
            if active_membership
            else None
        )

        return Response({
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "booked_classes": booking_serializer.data,
            "active_membership": (
                membership_serializer.data if membership_serializer else None
            ),
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
        print("Incoming date:", date_param)

        try:
            if date_param:
                date_obj = datetime.strptime(date_param, "%Y-%m-%d").date()
                classes = Classes.objects.filter(class_date=date_obj)
            else:
                classes = Classes.objects.all()

            serializer = ClassSerializer(classes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

