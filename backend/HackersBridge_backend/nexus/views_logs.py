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
from nexus.JWTCookie import JWTAuthFromCookie

# 🔹 Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 200


class LogEntryListAPIView(ListAPIView):
    serializer_class = LogEntrySerializer
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['object_repr', 'additional_data', 'actor__first_name', 'actor__username']

    def get_queryset(self):
        user = self.request.user
        if user.role not in ['admin', 'coordinator']:
            return LogEntry.objects.none()

        queryset = LogEntry.objects.all().order_by('-timestamp')

        # Filter params
        action = self.request.query_params.get('action')
        actor_username = self.request.query_params.get('actor_username')
        actor_firstname = self.request.query_params.get('actor_firstname')
        object_id = self.request.query_params.get('object_id')
        filter_type = self.request.query_params.get('filter_type')

        today = now().date()
        start_date = None

        if filter_type:
            match filter_type:
                case "today":
                    start_date = today
                case "yesterday":
                    start_date = today - timedelta(days=1)
                case "last_7_days":
                    start_date = today - timedelta(days=7)
                case "last_30_days":
                    start_date = today - timedelta(days=30)

        if start_date:
            queryset = queryset.filter(timestamp__date__gte=start_date)

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
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        # Get log counts for today
        today = now()
        start_datetime = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end_datetime = start_datetime + timedelta(days=1)

        log_counts = (
            LogEntry.objects
            .filter(actor__role='coordinator', timestamp__range=(start_datetime, end_datetime))
            .values('actor__id', 'actor__username', 'actor__first_name')
            .annotate(log_count=Count('id'))
            .order_by('-log_count')
        )

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response({
                'results': serializer.data,
                'count': self.paginator.page.paginator.count,
                'next': self.paginator.get_next_link(),
                'previous': self.paginator.get_previous_link(),
                'log_counts_by_coordinator': log_counts
            })

        # If pagination is disabled or page is None
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'log_counts_by_coordinator': log_counts
        })

  
  
  
{
      # def list(self, request, *args, **kwargs):
    #     if request.user.role not in ['admin', 'coordinator']:
    #         return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    #     queryset = self.filter_queryset(self.get_queryset())
    #     page = self.paginate_queryset(queryset)

    #     # Get log counts for today
    #     today = now()
    #     start_datetime = today.replace(hour=0, minute=0, second=0, microsecond=0)
    #     end_datetime = start_datetime + timedelta(days=1)

    #     log_counts = (
    #         LogEntry.objects
    #         .filter(actor__role='coordinator', timestamp__range=(start_datetime, end_datetime))
    #         .values('actor__id', 'actor__username', 'actor__first_name')
    #         .annotate(log_count=Count('id'))
    #         .order_by('-log_count')
    #     )

    #     if page is not None:
    #         serializer = self.get_serializer(page, many=True)
    #         return Response({
    #             'results': serializer.data,
    #             'count': self.paginator.page.paginator.count,
    #             'next': self.paginator.get_next_link(),
    #             'previous': self.paginator.get_previous_link(),
    #             'log_counts_by_coordinator': log_counts
    #         })

    #     # If pagination is disabled or page is None
    #     serializer = self.get_serializer(queryset, many=True)
    #     return Response({
    #         'results': serializer.data,
    #         'log_counts_by_coordinator': log_counts
    #     })
    }