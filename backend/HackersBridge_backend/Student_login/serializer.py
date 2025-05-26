from rest_framework import serializers
from Student.models import Student, Installment , StudentCourse, StudentNotes, BookAllotment
from django.core.mail import send_mail
from rest_framework.response import Response
from django.utils.crypto import get_random_string
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from nexus.models import Course, Book, Ticket
from datetime import date
from functools import lru_cache
from django.db.models import Q


User = get_user_model()  # ✅ Dynamically fetch the User model


# # **User Login Serializer**
# class StudentLoginSerializer(serializers.Serializer):
#     username = serializers.CharField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, data):
#         username = data.get('username')
#         password = data.get('password')

#         user = authenticate(username=username, password=password)
#         if not user:
#             raise serializers.ValidationError("Invalid username or password")

#         # Check if it's the first login
#         if user.first_login:
#             return {'user': user}
#         return {'user': user}



# class StudentTicketSerializer(serializers.Serializer):
#     class meta:
#         model = Ticket
#         fields = '__all__'
    

