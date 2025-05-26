import  os
import json
import uuid
import logging
from pathlib import Path
from django.utils import timezone
from Trainer.models import Trainer
from collections import defaultdict
from datetime import timedelta, date
from auditlog.models import LogEntry
from django.utils.html import escape
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework.views import APIView
from django.core.mail import EmailMessage
from nexus.models import Course, Timeslot
from Coordinator.models import Coordinator
from rest_framework import status, filters
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.forms.models import model_to_dict
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from Trainer.serializer import TrainerSerializer
from Student.models import StudentCourse, Student
from django.db.models import Q, Count, Min, Prefetch
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.contenttypes.models import ContentType
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomUser ,Batch, BatchStudentAssignment, Attendance, WelcomeEmail, StartBatchEmail, ComplateBatchEmail, CancelBatchEmail, TerminationBatchEmail, CustomEmail, ExamAnnouncementEmail, AttendanceWarningEmail
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from Student.serializer import StudentSerializer, StudentCourseSerializer
from nexus.generate_certificate import generate_certificate, get_certificate_path
from .serializer import BatchSerializer, BatchCreateSerializer, BatchStudentAssignmentSerializer, LogEntrySerializer, AttendanceSerializer


# 🔹 Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 200




class LogEntryListAPIView(ListAPIView):
    """Paginated log listing with filters (standard page-based)."""
    serializer_class = LogEntrySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['object_repr', 'additional_data', 'actor__first_name', 'actor__username']

    def get_queryset(self):
        user = self.request.user

        if user.role not in ['admin', 'coordinator']:
            return LogEntry.objects.none()

        queryset = LogEntry.objects.all().order_by('-timestamp')

        # Apply filters
        action = self.request.query_params.get('action')
        actor_username = self.request.query_params.get('actor_username')
        actor_firstname = self.request.query_params.get('actor_firstname')
        object_id = self.request.query_params.get('object_id')

        if action:
            queryset = queryset.filter(action__iexact=action)

        if actor_username:
            queryset = queryset.filter(actor__username__iexact=actor_username)

        if actor_firstname:
            queryset = queryset.filter(actor__first_name__iexact=actor_firstname)

        if object_id:
            queryset = queryset.filter(object_id=object_id)

        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        today = timezone.now().date()
        
        log_counts = (
            LogEntry.objects
            .filter(actor__role='admin', timestamp__date=today)
            .values('actor__id', 'actor__username', 'actor__first_name')
            .annotate(log_count=Count('id'))
            .order_by('-log_count')
        )

        response.data['log_counts_by_coordinator'] = log_counts
        return response


