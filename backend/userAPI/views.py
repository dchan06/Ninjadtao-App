from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from datetime import datetime, date

from .models import *
from .serializer import *

# ----------------------------
# Auth Views
# ----------------------------

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class TestView(APIView):
    def get(self, request):
        print("API was called")
        return Response("Hello World!", status=200)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(username=email, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "username": user.username, "userId": user.id}, status=200)
        else:
            return Response({"error": f"Invalid credentials. email: {email}"}, status=400)


class AuthView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        today = date.today()

        # Booked classes
        booked_classes = BookedClasses.objects.filter(userId=user, booking_date__gte=today)
        booking_serializer = BookingSerializer(booked_classes, many=True)

        # Active membership
        active_membership = MembershipsBought.objects.filter(
            userId=user,
            start_date__lte=today,
            expiration_date__gte=today
        ).order_by('-start_date').first()

        membership_serializer = MembershipsBoughtSerializer(active_membership) if active_membership else None

        return Response({
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "booked_classes": booking_serializer.data,
            "active_membership": membership_serializer.data if membership_serializer else None,
        })


# ----------------------------
# Classes Views
# ----------------------------

class ClassesView(APIView):
    def get(self, request):
        date_param = request.query_params.get('date')
        user_id = request.query_params.get('userId')

        if not user_id:
            return Response({"error": "user_id required"}, status=400)

        try:
            user_membership = MembershipsBought.objects.filter(userId=user_id, expiration_date__gte=date_param).first()
            if not user_membership:
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
                cls_data['booked'] = is_booked
                classes_list.append(cls_data)

            return Response({"classes": classes_list}, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BookingView(APIView):
    def post(self, request):
        user_id = request.data.get('userId')
        class_id = request.data.get('classId')

        if not user_id or not class_id:
            return Response({"error": "userId and classId are required"}, status=400)

        try:
            if BookedClasses.objects.filter(userId=user_id, classId=class_id).exists():
                return Response({"error": "Already booked"}, status=400)

            BookedClasses.objects.create(
                userId_id=user_id,
                classId_id=class_id,
                booking_date=datetime.now().date()
            )
            return Response({"message": "Class booked successfully"}, status=201)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


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


# ----------------------------
# Events Views
# ----------------------------

class EventsView(APIView):
    def get(self, request):
        date_param = request.query_params.get("date")
        try:
            if date_param:
                date_obj = datetime.strptime(date_param, "%Y-%m-%d").date()
                events_qs = Event.objects.filter(date=date_obj)
            else:
                events_qs = Event.objects.all().order_by("date", "start_time")

            serializer = EventSerializer(events_qs, many=True)
            # Return list directly so frontend can use data.map
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class EventDetailView(APIView):
    def get(self, request, event_id):
        try:
            event = Events.objects.get(id=event_id)
            serializer = EventSerializer(event)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Events.DoesNotExist:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)


class EventBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        event_id = request.data.get("eventId")

        if not event_id:
            return Response({"error": "eventId is required"}, status=400)

        try:
            event = Events.objects.get(id=event_id)

            # Create booking only if not already booked
            if event.attendees.filter(user=user).exists():
                return Response({"error": "Already booked"}, status=400)

            event.attendees.create(user=user)
            return Response({"message": "Event booked successfully"}, status=201)

        except Events.DoesNotExist:
            return Response({"error": "Event not found"}, status=404)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
