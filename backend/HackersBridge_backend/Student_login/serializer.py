from rest_framework import serializers
from Student.models import Student, Installment , StudentCourse, StudentNotes, BookAllotment
from django.core.mail import send_mail
from rest_framework.response import Response
from django.utils.crypto import get_random_string
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from nexus.models import Course, Book, Ticket, TicketChat
from datetime import date
from functools import lru_cache
from django.db.models import Q


User = get_user_model()  # ✅ Dynamically fetch the User model

class TicketChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketChat
        fields = '__all__'


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'


