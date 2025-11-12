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
            return Response({"token": token.key, "username": user.username, "userId": user.id}, status = 200)
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

class ClassesView(APIView):
    def get(self, request):
        date_param = request.query_params.get('date')
        user_id = request.query_params.get('userId')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        try:
            user = MembershipsBought.objects.filter(userId=user_id, expiration_date__gte = date_param).first()
            if not user:
                return Response({"error": "User not found, or membership expires before this date"}, status=status.HTTP_404_NOT_FOUND)

            if date_param:
                date_obj = datetime.strptime(date_param, "%Y-%m-%d").date()
                classes_qs = Classes.objects.filter(class_date=date_obj)
            else:
                classes_qs = Classes.objects.all()

            classes_list = []
            for cls in classes_qs:
                is_booked = BookedClasses.objects.filter(classId=cls, userId=user_id).exists()
                cls_data = ClassSerializer(cls).data
                cls_data['booked'] = is_booked  # add booked status
                classes_list.append(cls_data)

            return Response({"classes": classes_list}, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, class_id):
        user = request.user
        try:
            booking = BookedClasses.objects.get(classId=class_id, userId=user)
            booking.delete()
            return Response({"message": "Booking cancelled successfully"}, status=200)
        except BookedClasses.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)
        
class BookingView(APIView):
    def post(self, request):
        user_id = request.data.get('userId')
        class_id = request.data.get('classId')

        if not user_id or not class_id:
            return Response({"error": "userId and classId are required"}, status=400)

        try:
            # Prevent duplicate booking
            if BookedClasses.objects.filter(userId=user_id, classId=class_id).exists():
                return Response({"error": "Already booked"}, status=400)

            booking = BookedClasses.objects.create(
                userId_id=user_id,  # _id allows direct foreign key assignment
                classId_id=class_id,
                booking_date=datetime.now().date()
            )
            return Response({"message": "Class booked successfully"}, status=201)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
