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

from rest_framework.permissions import BasePermission

#Staff permissions
class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

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
        ).order_by('-start_date')

        membership_serializer = MembershipsBoughtSerializer(active_membership, many = True)

        return Response({
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "booked_classes": booking_serializer.data,
            "active_membership": membership_serializer.data,
            "is_staff": user.is_staff, 
        })

class ClassesView(APIView):
    def get(self, request):
        date_param = request.query_params.get('date')
        user_id = request.query_params.get('userId')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        try:
            user = MembershipsBought.objects.filter(userId=user_id, expiration_date__gte = date_param)
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
            # 1. Fetch the booking
            booking = BookedClasses.objects.get(
                classId_id=class_id,
                userId=user
            )

            # 2. Retrieve the EXACT membership used for booking
            membership = booking.membershipId

            # 3. Check if the membership can have credits refunded
            today = date.today()
            membership_valid = (
                membership.expiration_date is not None and
                membership.expiration_date >= today
            )

            if membership_valid and membership.has_credits():
                membership.return_credits()

            # 4. Delete booking
            booking.delete()

            return Response({"message": "Booking cancelled successfully"}, status=200)

        except BookedClasses.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

        
class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        userId = request.data.get('userId')
        classId = request.data.get('classId')
        membershipId = request.data.get('membershipId')

        if not userId or not classId or not membershipId:
            return Response({"error": "userId, classId, and membershipId are required"}, status=400)

        membership = MembershipsBought.objects.filter(id=membershipId).first()
        if membership is None:
            return Response({"error": "No active membership"}, status=401)

        try:
            if BookedClasses.objects.filter(userId=userId, classId=classId).exists():
                return Response({"error": "Already booked"}, status=400)

            booking = BookedClasses.objects.create(
                userId_id=userId,
                classId_id=classId,
                membershipId_id=membershipId,
                booking_date=datetime.now().date()
            )

            if membership.has_credits():
                membership.use_credits()

            return Response({"message": "Class booked successfully"}, status=201)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


class AdminUserView(APIView): 
    permission_classes = [IsAuthenticated, IsStaffUser]

    def post(self):
        all_users = userModel.allUsers()
        user_serializer = RegisterSerializer(all_users) 
        return Response ({"users" : user_serializer})
        