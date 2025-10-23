from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.

class TestView(APIView):
    def get(self, request, format =None):
        print("API was called")
        return Response("Hello World!", status = 200)

#localhost:8000/api/v1.0/user/test