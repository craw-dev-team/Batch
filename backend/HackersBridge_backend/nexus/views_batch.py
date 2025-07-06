import  os
import json
import uuid
import logging
from pathlib import Path
from django.utils import timezone
from Trainer.models import Trainer, TrainerBatchEndEmail
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
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from Student.serializer import StudentSerializer, StudentCourseSerializer
from nexus.generate_certificate import generate_certificate, get_certificate_path
from .models import (CustomUser ,Batch, BatchStudentAssignment, Attendance,
                      WelcomeEmail, StartBatchEmail, ComplateBatchEmail, 
                      CancelBatchEmail, TerminationBatchEmail, CustomEmail, 
                      ExamAnnouncementEmail, AttendanceWarningEmail, StudentBatchRequest, Chats, ChatMessage)
from .serializer import (BatchSerializer, BatchCreateSerializer, BatchStudentAssignmentSerializer, 
                         LogEntrySerializer, AttendanceSerializer)
from .JWTCookie import JWTAuthFromCookie
from django.db.models import Q, F, Value, When, Case, CharField
from time import sleep
import schedule
import time
import requests



# from rest_framework_simplejwt.authentication import JWTAuthFromCookie
cid = str(uuid.uuid4())
logger = logging.getLogger(__name__)



# 🔹 Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 60



{# # API view to retrieve and update batch status information
# class BatchAPIView(APIView):
#     # Use JWT for authentication
#     authentication_classes = [JWTAuthFromCookie]
#     # Only authenticated users can access this view
#     permission_classes = [IsAuthenticated]

#     # Mapping batch statuses to their equivalent student course statuses
#     STATUS_MAPPING = {
#         'Running': 'Ongoing',
#         'Upcoming': 'Upcoming',
#         'Completed': 'Completed',
#         'Hold': 'Not Started',
#         'Cancelled': 'Denied',
#     }

#     def get(self, request):
#         # Restrict access to only admin and coordinator roles
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         today = now().date()
#         upcoming_threshold = today + timedelta(days=10)  # Used to detect batches ending soon

#         # Optimize query by selecting related fields and only necessary student fields
#         batches = Batch.objects.select_related(
#             'trainer', 'course', 'location', 'batch_time'
#         ).prefetch_related(
#             Prefetch('student', queryset=Batch.student.rel.model.objects.only('id'))
#         )

#         updated_batches = []          # List to keep track of batches whose status needs update
#         student_course_updates = []   # Track updates to be applied to student course statuses

#         # Loop through all batches to calculate and update their status
#         for batch in batches:
#             old_status = batch.status

#             # Skip batches that are already 'Hold' or 'Cancelled'
#             if old_status in ['Hold', 'Cancelled']:
#                 continue

#             # Determine the new status based on current date
#             if batch.start_date <= today < batch.end_date:
#                 new_status = 'Running'
#             elif batch.start_date > today:
#                 new_status = 'Upcoming'
#             else:
#                 new_status = 'Completed'

#             # If the status has changed, prepare to update it
#             if new_status != old_status:
#                 batch.status = new_status
#                 updated_batches.append(batch)

#                 # Collect student IDs from the batch for updating student course status
#                 student_ids = list(batch.student.values_list('id', flat=True))
#                 if student_ids:
#                     student_course_updates.append({
#                         'student_ids': student_ids,
#                         'course_id': batch.course_id,
#                         'status': new_status
#                     })

#         # Bulk update batch statuses in the database
#         if updated_batches:
#             Batch.objects.bulk_update(updated_batches, ['status'])

#         # Update related student course statuses based on batch updates
#         for update in student_course_updates:
#             mapped_status = self.STATUS_MAPPING.get(update['status'])
#             if mapped_status:
#                 StudentCourse.objects.filter(
#                     student_id__in=update['student_ids'],
#                     course_id=update['course_id']
#                 ).update(status=mapped_status)

#         # Prepare categorized batch lists
#         all_batches = []

#         # Serialize all batches for response
#         serializer = BatchSerializer(batches, many=True)
#         batch_data_map = {data['id']: data for data in serializer.data}

#         # Categorize batches based on their status
#         for batch in batches:
#             batch_data = batch_data_map.get(batch.id)
#             if not batch_data:
#                 continue

#             all_batches.append(batch_data)

#         # Return categorized batch data in the response
#         return Response({
#             'All_Type_Batch': {
#                 'batches': all_batches,
#             }
#         }, status=status.HTTP_200_OK)
}



# 🔹 Paginated BatchAPIView
class BatchAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    STATUS_MAPPING = {
        'Running': 'Ongoing',
        'Upcoming': 'Upcoming',
        'Completed': 'Completed',
        'Hold': 'Not Started',
        'Cancelled': 'Denied',
    }

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # 🔹 Get filters
        status_filter = request.GET.get('status')
        if status_filter == 'Scheduled':
            status_filter = 'Upcoming'
        else:
            status_filter = status_filter

        search_query = request.GET.get('search', '').strip().lower()
        mode_filter = request.GET.get('mode')
        language_filter = request.GET.get('language')
        preferred_week_filter = request.GET.get('preferred_week')
        location_filter = request.GET.get('location')

        today = now().date()
        ten_days_later = today + timedelta(days=10)

        # ✅ Step 1: Update statuses in DB if needed
        batches_to_update = Batch.objects.exclude(status__in=['Hold', 'Cancelled']).annotate(
            computed_status=Case(
                When(start_date__lte=today, end_date__gt=today, then=Value('Running')),
                When(start_date__gt=today, then=Value('Upcoming')),
                default=Value('Completed'),
                output_field=CharField()
            )
        ).filter(~Q(status=F('computed_status')))



        update_data = []
        student_course_updates = []

        for batch in batches_to_update:
            update_data.append(Batch(id=batch.id, status=batch.computed_status))
            student_ids = list(batch.student.values_list('id', flat=True))
            if student_ids:
                student_course_updates.append({
                    'student_ids': student_ids,
                    'course_id': batch.course_id,
                    'status': batch.computed_status
                })

        if update_data:
            Batch.objects.bulk_update(update_data, ['status'])

        for update in student_course_updates:
            mapped_status = self.STATUS_MAPPING.get(update['status'])
            if mapped_status:
                StudentCourse.objects.filter(
                    student_id__in=update['student_ids'],
                    course_id=update['course_id']
                ).update(status=mapped_status)

        # ✅ Step 2: Fetch batches with filtering
        batches = Batch.objects.select_related(
            'trainer', 'course', 'location', 'batch_time'
        ).prefetch_related(
            Prefetch('student', queryset=Batch.student.rel.model.objects.only('id'))
        )

        # Count Batch based on batch status
        all_batch_count = batches.count()
        hold_batch_count = batches.filter(status='Hold').count()
        running_batch_count = batches.filter(status='Running').count()
        upcoming_batch_count = batches.filter(status='Upcoming').count()
        completed_batch_count = batches.filter(status='Completed').count()
        cancelled_batch_count = batches.filter(status='Cancelled').count()

        filters = Q()

        # 🔸 Hand le special status: 'ending soon'
        if status_filter == 'endingsoon':
            filters &= Q(status='Running', end_date__range=(today, ten_days_later))
        elif status_filter:
            filters &= Q(status__iexact=status_filter)

        # 🔸 Apply other filters
        if mode_filter:
            filters &= Q(mode__iexact=mode_filter)
        if language_filter:
            filters &= Q(language__iexact=language_filter)
        if preferred_week_filter:
            filters &= Q(preferred_week__iexact=preferred_week_filter)
        if location_filter:
            filters &= Q(location__locality__icontains=location_filter)

        if search_query:
            filters &= (
                Q(trainer__name__icontains=search_query) |
                Q(course__name__icontains=search_query) |
                Q(batch_id__icontains=search_query) |
                Q(location__locality__icontains=search_query) |
                Q(preferred_week__icontains=search_query)
            )

        batches = batches.filter(filters)
        
        if status_filter == 'Running':
            batches = batches.order_by('-start_date')
        elif status_filter == 'Upcoming':
            batches = batches.order_by('start_date')
        elif status_filter == 'endingsoon':
            batches = batches.order_by('end_date')
        elif status_filter == 'Completed':
            batches = batches.order_by('-end_date')
        else:
            batches = batches.order_by('-gen_time')  # Default ordering


        # ✅ Step 3: Paginate and return
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(batches, request)
        serializer = BatchSerializer(paginated_queryset, many=True)
        print(timezone.now())
        print('hello')

        return paginator.get_paginated_response({'batches': serializer.data,
                                                 'all_batch_count':all_batch_count,
                                                 'running_batch_count':running_batch_count,
                                                 'upcoming_batch_count':upcoming_batch_count,
                                                 'hold_batch_count':hold_batch_count,
                                                 'completed_batch_count':completed_batch_count,
                                                 'cancelled_batch_count':cancelled_batch_count}
                                                 )


# API View to handle creation of new batches
class BatchCreateAPIView(APIView):
    # Require JWT authentication and that user must be authenticated
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthFromCookie]

    def post(self, request):
        # Only users with role 'admin' or 'coordinator' are allowed to create a batch
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Use serializer to validate incoming request data
        serializer = BatchCreateSerializer(data=request.data)

        # If the input data is valid, proceed to save the batch
        if serializer.is_valid():
            try:
                # Save the batch instance
                batch = serializer.save()

                # Create a new chat instance associated with the batch
                chat = Chats.objects.create(batch=batch)

                # Post a welcome message in the chat by the creator (admin/coordinator)
                ChatMessage.objects.create(
                    chat=chat,
                    sender=request.user.role,     # Role name will be used as the sender (e.g., admin/coordinator)
                    send_by=request.user,         # Actual user instance
                    message="Welcome Students"    # Default welcome message
                )

                # Log the creation of the batch in the system logs
                LogEntry.objects.create(
                    content_type=ContentType.objects.get_for_model(Batch),  # The model this log is related to
                    cid=str(uuid.uuid4()),                                  # Unique identifier for the log entry
                    object_pk=batch.id,                                     # Primary key of the created object
                    object_id=batch.id,                                     # Object ID
                    object_repr=f"Batch: {batch.batch_id}",                 # Human-readable representation
                    action=LogEntry.Action.CREATE,                          # Type of action (CREATE)
                    changes=f"Created new batch: {batch.batch_id} by {request.user.username}",  # Short description
                    serialized_data=json.dumps(
                        model_to_dict(batch.trainer) if batch.trainer else {}, default=str
                    ),  # Serialize trainer data (if available) for record
                    changes_text=(
                        f"A new batch (ID: {batch.batch_id}) was successfully created by "
                        f"{request.user.get_full_name() or request.user.username} "
                        f"for the course '{batch.course.name}' at "
                        f"{batch.batch_time.start_time.strftime('%I:%M %p')} - "
                        f"{batch.batch_time.end_time.strftime('%I:%M %p')} "
                        f"({batch.preferred_week}, {batch.mode})"
                    ),  # Human-readable log message
                    additional_data="Batch",  # Optional tag for context
                    actor=request.user,       # User who performed the action
                    timestamp=now()           # Time of action
                )

                # Return the created batch data with HTTP 201 status
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            # Handle serializer-specific validation errors
            except serializers.ValidationError as e:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

            # Handle unexpected server-side errors
            except Exception as e:
                return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # If input data is invalid, return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# API View to handle editing/updating an existing batch
class BatchEditAPIView(APIView):
    # Ensure only authenticated users with a valid JWT token can access
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        # Allow only users with 'admin' or 'coordinator' roles to update a batch
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch the batch instance using the provided ID
        try:
            batch = Batch.objects.get(id=id)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

        # Store old batch data before making any updates (for comparison)
        old_data = model_to_dict(batch)

        # Deserialize and validate the new data; allow partial updates
        serializer = BatchCreateSerializer(batch, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            # Save the updated batch instance
            batch = serializer.save()

            # Track changes between old and new data
            new_data = model_to_dict(batch)
            changes = []           # List to store field-wise changes
            trainer_changes = ""   # Separate log for trainer change

            # Loop through fields to compare old vs new values
            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if new_value != old_value:
                    changes.append(f"{field} changed from '{old_value}' to '{new_value}'")

            # Check if the trainer was updated in the request
            if "trainer" in request.data:
                old_trainer = old_data.get("trainer")
                new_trainer = new_data.get("trainer")

                if old_trainer != new_trainer:
                    old_trainer_name = "None"
                    new_trainer_name = "None"

                    # Get readable names for logging
                    if old_trainer:
                        try:
                            old_trainer_obj = Trainer.objects.get(id=old_trainer)
                            old_trainer_name = old_trainer_obj.name
                        except Trainer.DoesNotExist:
                            pass

                    if new_trainer:
                        try:
                            new_trainer_obj = Trainer.objects.get(id=new_trainer)
                            new_trainer_name = new_trainer_obj.name
                        except Trainer.DoesNotExist:
                            pass

                    trainer_changes = f"Trainer updated from '{old_trainer_name}' to '{new_trainer_name}'"

            # Create a log entry to track this batch update
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Batch),
                cid=str(uuid.uuid4()),  # Unique ID for the log
                object_pk=batch.id,
                object_id=batch.id,
                object_repr=f"Batch: {batch.batch_id}",
                action=LogEntry.Action.UPDATE,
                changes=", ".join(changes) + (". " + trainer_changes if trainer_changes else ""),
                serialized_data=json.dumps(new_data, default=str),  # Full updated data in JSON
                changes_text=(
                    f"The batch '{batch.batch_id}' was updated by {request.user.get_full_name() or request.user.username}. "
                    f"Changes made: {', '.join(changes)}"
                    f"{'. ' + trainer_changes if trainer_changes else ''}"
                ),
                additional_data="Batch",
                actor=request.user,
                timestamp=now()
            )

            # Return updated batch data
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Return validation errors if input data is invalid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# API View to handle deletion of a batch
class BatchDeleteAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Ensure user is authenticated via JWT
    permission_classes = [IsAuthenticated]        # Only allow authenticated users

    def delete(self, request, id):
        """
        DELETE method to remove a batch and update related student course statuses.
        Only accessible by users with 'admin' or 'coordinator' roles.
        """
        
        # ✅ Check user role
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Attempt to retrieve the batch by ID with related student records
        try:
            batch = Batch.objects.prefetch_related('student').get(id=id)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Get related data before deleting
        course = batch.course                        # The course associated with the batch
        students = list(batch.student.all())         # List of students enrolled in the batch
        batch_status = batch.status                  # Save current batch status before deletion

        # ✅ Log the batch deletion for audit purposes
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Batch),  # Content type of the model being deleted
            cid=str(uuid.uuid4()),                                  # Unique ID for the log entry
            object_pk=batch.id,                                     # Primary key of the batch
            object_id=batch.id,
            object_repr=f"Batch: {batch.batch_id}",                 # Readable batch name/ID
            action=LogEntry.Action.DELETE,                          # Action type: DELETE
            changes=f"Deleted batch: {batch.batch_id} by {request.user.username}",  # Summary of the change
            serialized_data=json.dumps({
                'batch_id': batch.batch_id,
                'status': batch_status,
                'students_count': len(students)
            }, default=str),                                        # Store relevant batch info as JSON
            changes_text=f"Batch '{batch.batch_id}' deleted by {request.user.username}.",  # Human-readable log
            additional_data="Batch",                                # Optional context tag
            actor=request.user,                                     # The user who deleted the batch
            timestamp=now()                                         # Log time
        )

        # ✅ Delete the batch
        batch.delete()

        # ✅ Decide what student course status should be updated to
        student_update_status = None
        if batch_status == 'Running':
            student_update_status = 'Denied'
        elif batch_status == 'Upcoming':
            student_update_status = 'Not Started'
        elif batch_status == 'Completed':
            student_update_status = 'Completed'

        # ✅ If applicable, update the statuses of the students in the deleted batch
        if student_update_status:
            StudentCourse.objects.filter(
                student__in=students,
                course=course
            ).update(status=student_update_status)

        # ✅ Return success response
        return Response({'detail': 'Batch deleted successfully'}, status=status.HTTP_204_NO_CONTENT)



# API View to Add or Update Online Link for a Specific Batch
class BatchOnlinelink(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Requires JWT authentication
    permission_classes = [IsAuthenticated]        # Only authenticated users can access

    def patch(self, request, id):
        """
        PATCH method to add or update the online batch link.
        Accessible only to users with 'admin' or 'coordinator' roles.
        """

        # ✅ Restrict access to admin and coordinator roles only
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Extract batch_link from the request body
        batch_link = request.data.get('batch_link')

        # ✅ Proceed only if a link is provided
        if batch_link:
            # ✅ Retrieve the batch or return 404 if not found
            batch = get_object_or_404(
                Batch.objects.select_related('course', 'location'),  # Optimize related lookups
                id=id
            )

            # ✅ Save the new or updated batch link
            batch.batch_link = batch_link
            batch.save()

            return Response({'message': 'Batch link added successfully'}, status=status.HTTP_200_OK)

        # ❌ If no batch_link was provided in request
        return Response({'error': 'Batch link not provided'}, status=status.HTTP_400_BAD_REQUEST)



# API View to Get Available Students for a Given Batch
class AvailableStudentsAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Require JWT token
    permission_classes = [IsAuthenticated]        # Require authentication

    def get(self, request, batch_id):
        """
        Get a list of eligible students for a given batch.
        Only 'admin' or 'coordinator' roles are allowed.
        Filters students based on batch requirements and course prerequisites.
        """

        # ✅ Authorization check
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Fetch the batch or return 404
        batch = get_object_or_404(
            Batch.objects.select_related('course', 'location'),
            id=batch_id
        )
        course = batch.course

        # ✅ Initial filter: must be enrolled in the batch's course and 'Active'
        filters = Q(courses__id=course.id, status='Active')

        # ✅ Match language preference (accept "Both" or exact match)
        if batch.language != "Both":
            filters &= Q(language__in=[batch.language, "Both"])

        # ✅ Match preferred week (accept "Both" or exact match)
        if batch.preferred_week != "Both":
            filters &= Q(preferred_week__in=[batch.preferred_week, "Both"])

        # ✅ Match learning mode (accept "Hybrid" or exact match)
        if batch.mode != "Hybrid":
            filters &= Q(mode__in=[batch.mode, "Hybrid"])

        # ✅ Match location locality (accept "Both" or exact match)
        if batch.location and batch.location.locality != "Both":
            filters &= Q(location__locality__in=[batch.location.locality, "Both"])

        # ✅ Get disqualified students (already enrolled in a batch or completed the course)
        disqualified_ids = set(
            Student.objects.filter(
                Q(batch__course=course, batch__status__in=['Running', 'Upcoming', 'Completed']) |
                Q(studentcourse__course=course, studentcourse__status='Completed')
            ).values_list('id', flat=True)
        )

        # ✅ Filter students based on eligibility and remove disqualified ones
        students = Student.objects.filter(filters).exclude(id__in=disqualified_ids)

        # ✅ Define course prerequisites for some advanced courses
        prerequisites = {
            "Ethical Hacking": ['Basic Networking', 'Linux Essentials'],
            "AWS Associate": ['Basic Networking', 'Linux Essentials'],
            "AWS Security": ['AWS Associate'],
            "Advanced Penetration Testing": ['Ethical Hacking'],
            "Web Application Security": ['Advanced Penetration Testing'],
            "Mobile Application Security": ['Web Application Security'],
            "Cyber Forensics Investigation": ['Ethical Hacking'],
            "End Point Security": [
                'Python Programming', 'Basic Networking', 'Linux Essentials',
                'Ethical Hacking', 'Advanced Penetration Testing',
                'Cyber Forensics Investigation', 'Web Application Security',
                'Mobile Application Security'
            ],
            "Internet of Things Pentesting": [
                'Python Programming', 'Basic Networking', 'Linux Essentials',
                'Ethical Hacking', 'Advanced Penetration Testing',
                'Cyber Forensics Investigation', 'Web Application Security',
                'Mobile Application Security'
            ],
        }

        # ✅ Get prerequisites for current course
        required_courses = prerequisites.get(course.name)

        if required_courses:
            # ✅ Get student course statuses for the prerequisites
            student_courses = StudentCourse.objects.filter(
                student__in=students,
                course__name__in=required_courses
            ).values('student_id', 'course__name', 'status')

            # ✅ Map of student_id → course_name → status
            course_status_map = defaultdict(dict)
            for entry in student_courses:
                course_status_map[entry['student_id']][entry['course__name']] = entry['status']

            # ✅ Identify students who have completed all prerequisite courses
            eligible_ids = [
                sid for sid, course_map in course_status_map.items()
                if all(course_map.get(course) == 'Completed' for course in required_courses)
            ]

            # ✅ Also include students with no record of prerequisite courses
            all_student_ids = set(students.values_list('id', flat=True))
            students_with_prereqs = set(course_status_map.keys())
            students_without_prereqs = all_student_ids - students_with_prereqs
            eligible_ids.extend(students_without_prereqs)

            # ✅ Final filtering based on eligibility
            students = students.filter(id__in=eligible_ids)

        # ✅ Serialize and return available students
        serialized_students = StudentSerializer(students, many=True).data
        return Response({"available_students": serialized_students}, status=status.HTTP_200_OK)



# API View to Get Available Trainers for a Given Batch
class AvailableTrainersAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Require JWT token for access
    permission_classes = [IsAuthenticated]        # Only authenticated users allowed

    def get(self, request, batch_id):
        """
        Return a list of available trainers for the selected batch.
        Filters trainers based on language, location, course match,
        and excludes those already assigned to overlapping batches.
        Accessible by 'admin' and 'coordinator' roles only.
        """

        # ✅ Authorization check
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Fetch the batch or return 404 if not found
        batch = get_object_or_404(Batch, id=batch_id)

        # ✅ Language match: trainer must speak batch language or "Both"
        language_filter = [batch.language, "Both"]

        # ✅ Location match: trainer must be from same location as the batch
        location_filter = batch.location

        # ✅ Get all trainers who:
        # - Are assigned to the same course
        # - Match language preference
        # - Are located at the same location
        # - Are currently active
        trainers = Trainer.objects.filter(
            course__id=batch.course.id,
            languages__in=language_filter,
            location_id=location_filter,
            status='Active'
        )

        # ✅ Identify trainers who are already assigned to another batch
        # with overlapping schedule (excluding cancelled batches)
        unavailable_trainers = Batch.objects.filter(
            trainer__in=trainers,
            start_date__lt=batch.end_date,    # Overlaps with current batch
            end_date__gt=batch.start_date,    # Overlaps with current batch
            preferred_week=batch.preferred_week,
            batch_time=batch.batch_time
        ).exclude(status="Cancelled").values_list("trainer_id", flat=True)

        # ✅ Final list of trainers excluding those unavailable due to schedule conflicts
        available_trainers = trainers.exclude(id__in=unavailable_trainers)

        # ✅ Serialize the available trainers and return the response
        serialized_trainers = TrainerSerializer(available_trainers, many=True).data
        return Response({"available_trainers": serialized_trainers}, status=status.HTTP_200_OK)



# API to Add Students into a Selected Batch
class BatchAddStudentAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Requires JWT token
    permission_classes = [IsAuthenticated]        # User must be authenticated

    def post(self, request, batch_id):
        """
        Adds a list of students to a batch.
        Also updates their course status based on the batch's current state.
        Logs the action for audit.
        """

        # ✅ Check user role authorization
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Get the batch or return 404
        batch = get_object_or_404(Batch, id=batch_id)

        # ✅ Do not allow adding students to a completed batch
        if batch.status == 'Completed':
            return Response({"error": "Cannot add students to a completed batch."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Expect a list of student IDs in the request body
        student_ids = request.data.get('students', [])
        if not isinstance(student_ids, list) or not student_ids:
            return Response({"error": "Invalid input format. Expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Fetch valid students by IDs
        students = Student.objects.filter(id__in=student_ids)
        if not students.exists():
            return Response({"error": "No valid students found."}, status=status.HTTP_400_BAD_REQUEST)

        course = batch.course
        added_students = []         # Students successfully added
        already_enrolled = []       # Students who were already in the batch

        # ✅ Process each student
        for student in students:
            assigned = BatchStudentAssignment.objects.filter(batch=batch, student=student).exists()
            if not assigned:
                # Add student to the batch
                BatchStudentAssignment.objects.create(batch=batch, student=student)
                added_students.append(student)
            else:
                # Already part of the batch
                already_enrolled.append(student.id)

            # ✅ Approve the batch request if it exists
            StudentBatchRequest.objects.filter(batch=batch, student=student).update(request_status='Approved')

        # ✅ Update student course status based on batch status
        if added_students:
            if batch.status == 'Running':
                status_to_set = 'Ongoing'
            elif batch.status == 'Upcoming':
                status_to_set = 'Not Started'
            else:
                status_to_set = None

            # Apply the course status to related student-course entries
            if status_to_set:
                StudentCourse.objects.filter(student__in=added_students, course=course).update(status=status_to_set)

        # ✅ Log the action for audit purposes
        if added_students:
            student_enrollments = [student.enrollment_no for student in added_students]

            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(BatchStudentAssignment),
                cid=str(uuid.uuid4()),  # Unique ID for the log
                object_pk=batch.id,
                object_id=batch.id,
                object_repr=f"Batch: {batch.batch_id}",
                action=LogEntry.Action.UPDATE,
                changes=f"Added students {', '.join(student_enrollments)} to batch {batch.batch_id} by {request.user.username}",
                serialized_data=json.dumps({
                    "added_students": student_enrollments,
                    "batch": batch.batch_id
                }, default=str),
                changes_text=(
                    f"{request.user.get_full_name() or request.user.username} added {len(student_enrollments)} student(s) "
                    f"({', '.join(student_enrollments)}) to batch '{batch.batch_id}'."
                    + (f" Updated their course status to \"{status_to_set}\"." if status_to_set else "")
                ),
                additional_data="Batch",
                actor=request.user,
                timestamp=now()
            )

        # ✅ Final response
        return Response({
            "message": "Students processed successfully",
            "added_students": [s.id for s in added_students],
            "already_enrolled": already_enrolled
        }, status=status.HTTP_200_OK)



# This id for Reject Student Batch Request...
class BatchRequestRejectedAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, batch_id):
        # Check user role
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        # Get the batch or return 404
        batch = get_object_or_404(Batch, id=batch_id)

        # Validate batch status
        if batch.status == 'Completed':
            return Response({"error": "Cannot modify a completed batch."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate student input
        student_ids = request.data.get('students', [])
        if not isinstance(student_ids, list) or not student_ids:
            return Response({"error": "Invalid input format. Expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        # Filter valid students
        students = Student.objects.filter(id__in=student_ids)
        if not students.exists():
            return Response({"error": "No valid students found."}, status=status.HTTP_400_BAD_REQUEST)

        # Reject all matching requests
        updated_count = StudentBatchRequest.objects.filter(
            batch=batch,
            student__in=students
        ).update(request_status='Rejected')

        return Response({
            "message": f"{updated_count} student batch request(s) marked as Rejected successfully."
        }, status=status.HTTP_200_OK)
    
    



# THIS IS FOR REMOVING STUDENT FROM BATCH ALSO SENDING THE EMAIL TO STUDENT...
class BatchRemoveStudentAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=batch_id)
        student_ids = request.data.get('students', [])

        if not isinstance(student_ids, list) or not student_ids:
            return Response({"error": "Invalid input format, expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(id__in=student_ids)

        if not students.exists():
            return Response({"error": "No valid students found."}, status=status.HTTP_400_BAD_REQUEST)

        removed_students = []
        student_courses_to_update = []

        for student in students:
            assignment = BatchStudentAssignment.objects.filter(batch=batch, student=student)
            if assignment.exists():
                assignment.delete()
                removed_students.append(student)

                 # Update their batch request (if exists)
                StudentBatchRequest.objects.filter(batch=batch, student=student).update(request_status='Removed')
                
                student_course = StudentCourse.objects.filter(student=student, course=batch.course).first()
                if student_course:
                    if batch.status == 'Running':
                        student_course.status = 'Denied'
                    elif batch.status == 'Upcoming':
                        student_course.status = 'Not Started'
                    student_courses_to_update.append(student_course)

        if student_courses_to_update:
            StudentCourse.objects.bulk_update(student_courses_to_update, ['status'])

        if removed_students:
            student_names = [s.enrollment_no for s in removed_students]
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(BatchStudentAssignment),
                cid=str(uuid.uuid4()),
                object_pk=batch.id,
                object_id=batch.id,
                object_repr=f"Batch: {batch.batch_id}",
                action=LogEntry.Action.UPDATE,
                changes=f"Removed students {', '.join(student_names)} from batch {batch.batch_id} by {request.user.username}",
                serialized_data=json.dumps({"removed_students": student_names, "batch": batch.batch_id}, default=str),
                changes_text=(f"{request.user.get_full_name() or request.user.username} removed {len(student_names)} student(s) "
                              f"({', '.join(student_names)}) from batch '{batch.batch_id}'. "
                              f"Updated their course status."),
                additional_data="Batch",
                actor=request.user,
                timestamp=now()
            )


            # ✅ Send email notification
            # for student in removed_students:
        #         subject = f"You have been removed from {batch.course} ({batch.batch_id})"
        #         html_message = f"""<html>
        # <head>
        # <meta charset="UTF-8">
        # <title>Removed from Batch</title>
        # </head>
        # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        # <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; color: #000;">
        #     <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
        #         <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
        #     </div>
        #     <div style="padding: 30px; font-size: 16px; color: #000;">
        #         <h2 style="text-align: center; font-size: 22px; color: #000;">📢 Batch Update Notice</h2>
        #         <p style="color: #000;">Dear <strong>{ student.name }</strong>,</p>
        #         <p style="color: #000;">We would like to inform you that you have been removed from the <strong>{ batch.course }</strong> course batch <strong>{ batch.batch_id }</strong>.</p>
        #         <p style="color: #000;">If this was unexpected or if you believe this was a mistake, please contact your batch coordinator or Craw Security support immediately.</p>
        #         <p style="margin-top: 30px; color: #000;">
        #             📍 <strong>Our Address:</strong><br>
        #             1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
        #             Behind Saket Metro Station, New Delhi 110030
        #         </p>
        #         <p style="color: #000;">
        #             📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
        #             📧 <strong>Email:</strong> training@craw.in<br>
        #             🌐 <strong>Website:</strong> 
        #             <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
        #         </p>
        #         <p style="color: #000;">
        #             Warm regards,<br>
        #             <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
        #         </p>
        #     </div>
        #     <!-- Footer -->
        #     <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
        #         <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
        #         <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
        #     </div>
        # </div>
        # </body>
        # </html>"""
        #         from_email = "CRAW SECURITY BATCH <training@craw.in>"
        #         try:
        #             email = EmailMessage(subject, html_message, from_email, [student.email])
        #             email.content_subtype = "html"
        #             email.send()
        #         except Exception as e:
        #             print(f"Failed to send removal email to {student.email}: {str(e)}")

        return Response({
            "message": "Students removed successfully, and course status updated.",
            "removed_students": [s.id for s in removed_students]
        }, status=status.HTTP_200_OK)



# THIS IS FOR GETING BATCH INFORMATION...
class BatchInfoAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=id) 

        student_assignments = BatchStudentAssignment.objects.filter(batch=batch)
            

        batch_serializer = BatchSerializer(batch)
        student_serializer = BatchStudentAssignmentSerializer(student_assignments, many=True)

        # Fetch logs for this Batch
        batch_ct = ContentType.objects.get_for_model(Batch)
        batch_logs = LogEntry.objects.filter(content_type=batch_ct, object_id=batch.id).order_by('-timestamp')
        serialized_logs = LogEntrySerializer(batch_logs, many=True).data

        student_batch_requests = StudentBatchRequest.objects.filter(batch=batch)
        request_students = Student.objects.filter(id__in=student_batch_requests.values_list('student_id', flat=True))

        # Create a map of student_id -> request_status
        request_status_map = {
            req.student_id: req.request_status
            for req in student_batch_requests
        }

        # Serialize students normally
        student_data = StudentSerializer(request_students, many=True).data

        # Add request_status to each student
        for student in student_data:
            student['request_status'] = request_status_map.get(student['id'])

        return Response({
            'batch': batch_serializer.data,
            'students': student_serializer.data,
            'batch_logs': serialized_logs,
            'batch_requests': student_data 
        }, status=status.HTTP_200_OK)




# THIS IS FOR UPDATING DATA IN STUDENT BATCH LIST...
class BatchStudentAssignmentUpdateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def patch(self, request, assignment_id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        assignment = get_object_or_404(BatchStudentAssignment, id=assignment_id)
        
        serializer = BatchStudentAssignmentSerializer(assignment, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Student batch status updated successfully",
                "updated_data": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# This is for active or inactive student for student for batch...
class BatchStudentStatusChangerAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        status_value = request.data.get('status')
        if not status_value:
            return Response({'error': 'Status value is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student_assignment = BatchStudentAssignment.objects.get(id=id)
        except BatchStudentAssignment.DoesNotExist:
            return Response({'error': 'No student is assigned with this ID in the batch.'}, status=status.HTTP_404_NOT_FOUND)

        student_assignment.student_batch_status = status_value
        student_assignment.save()

        return Response({'message': f'Student batch status updated to "{status_value}".'}, status=status.HTTP_200_OK)


        

# Generate and assign certificates to students in a batch...
class GenerateBatchCertificateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request, id, *args, **kwargs):

        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        issue_date = request.data.get("issue_date")
        student_ids = request.data.get("students", [])

        if not issue_date or not parse_date(issue_date):
            return Response({"error": "Invalid or missing issue date."}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(student_ids, list) or not student_ids:
            return Response({"error": "Invalid input format, expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        batch = get_object_or_404(Batch, id=id)
        course = batch.course.name

        student_courses = StudentCourse.objects.filter(
            student__id__in=student_ids, course=batch.course, status="Completed"
        ).select_related("student")

        if not student_courses.exists():
            return Response({"error": "No completed student courses found for this batch."}, status=status.HTTP_400_BAD_REQUEST)

        certificate_paths = []
        errors = []
        updated_student_courses = []

        for student_course in student_courses:
            student = student_course.student
            print(student_course)

            # # Check for marks
            if not hasattr(student_course, "marks") or student_course.marks < 75:
                errors.append({
                    "student_id": student.id,
                    "error": "Marks below 75% or missing"
                })
                continue

            # Generate certificate
            file_path = generate_certificate(
                course, student.name, student.enrollment_no, issue_date
            )

            if Path(file_path).exists():
                student_course.student_certificate_allotment = True
                student_course.certificate_date = issue_date
                updated_student_courses.append(student_course)

        #         # Send Email
        #         try:
        #             subject = f"🎉 Congratulations, {student.name}! Your {course} Certificate is Here!"

        #             # html_message = f"""
        #             # <!DOCTYPE html>
        #             # <html>
        #             # <head>
        #             #     <meta charset="UTF-8">
        #             #     <title>Certificate Issued</title>
        #             # </head>
        #             # <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        #             #     <p>Dear <strong>{student.name}</strong>,</p>

        #             #     <p>We’re thrilled to congratulate you on successfully completing the <strong>{course}</strong> course at <strong>Craw Cyber Security</strong>!</p>

        #             #     <p>Your dedication and hard work have paid off, and we are delighted to issue your official certificate.</p>

        #             #     <p>
        #             #         <strong>🏷️ Student Enrollment Number:</strong> {student.enrollment_no}<br>
        #             #         <strong>📅 Date of Issue:</strong> {issue_date}
        #             #     </p>

        #             #     <p>Your certificate is attached to this email—feel free to showcase it in your portfolio, LinkedIn profile, or anywhere that highlights your achievements.</p>

        #             #     <p>This milestone is just the beginning of your journey in cybersecurity, and we’re excited to see where your skills take you next!</p>

        #             #     <p>If you have any questions or need further assistance, don’t hesitate to reach out.</p>

        #             #     <p>🚀 Keep learning, keep growing, and keep securing the digital world!</p>

        #             #     <p>Best regards,<br>
        #             #     🚀 Craw Cyber Security Team<br>
        #             #     📧 <a href="mailto:training@craw.in">training@craw.in</a><br>
        #             #     📞 +91 9513805401<br>
        #             #     🌐 <a href="https://www.craw.in/">https://www.craw.in/</a>
        #             #     </p>
        #             # </body>
        #             # </html>
        #             # """

        #             html_message = f"""
        # <!DOCTYPE html>
        # <html>
        # <head>
        # <meta charset="UTF-8">
        # <title>Certificate Issued</title>
        # </head>
        # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
        # <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
            
        #     <!-- Header with Logo -->
        #     <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
        #     <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
        #     </div>

        #     <!-- Body -->
        #     <div style="padding: 30px; color: #000;">
        #     <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px;">🎓 Certificate of Achievement</h2>

        #     <p style="font-size: 16px; line-height: 1.6;">
        #         Dear <strong style="font-weight: bold;">{student.name}</strong>,
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6;">
        #         Congratulations on successfully completing the <strong style="font-weight: bold;">{course}</strong> course at <strong>Craw Cyber Security</strong>! 🎉
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6;">
        #         Your hard work and commitment have paid off, and we are excited to issue your official certificate.
        #     </p>

                # <p style="font-size: 16px; line-height: 1.6;">
                #     Share your achievement on LinkedIn and tag <strong>@Craw Cyber Security</strong> to inspire others! Don’t forget to use <strong>#crawsec</strong> and <strong>#lifeatcraw</strong> 🚀
                # </p>

        #     <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
        #         <p style="font-size: 15px; margin: 6px 0;"><strong>🏷️ Enrollment Number:</strong> {student.enrollment_no}</p>
        #         <p style="font-size: 15px; margin: 6px 0;"><strong>📅 Date of Issue:</strong> {issue_date}</p>
        #         <p style="font-size: 15px; margin: 6px 0;"><strong>📎 Certificate:</strong> Attached as PDF</p>
        #         <ifream src = "file_path" />
        #     </div>

        #     <p style="font-size: 16px; line-height: 1.6;">
        #         Your certificate is attached to this email. Feel free to showcase it in your portfolio, LinkedIn profile, or wherever you wish to highlight your accomplishments.
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6;">
        #         This is a great milestone in your cybersecurity journey, and we’re confident you’ll achieve even more in the future!
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6;">
        #         🔐 Stay passionate, stay curious, and keep securing the digital world!
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6;">
        #         Warm regards,<br>
        #         <strong style="font-weight: bold;">Craw Cyber Security Team</strong> 🚀<br>
        #         📧 <a href="mailto:training@craw.in" style="text-decoration: underline;">training@craw.in</a><br>
        #         📞 +91 9513805401<br>
        #         🌐 <a href="https://www.craw.in/" style="text-decoration: underline;">www.craw.in</a>
        #     </p>
        #     </div>

        #     <!-- Footer -->
        #     <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
        #     <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
        #     <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
        #     </div>
        # </div>
        # </body>
        # </html>
        # """

        #             from_email = "CRAW SECURITY CERTIFICATE <training@craw.in>"
        #             email_obj = EmailMessage(subject, html_message, from_email, [student.email])
        #             email_obj.content_subtype = "html"
        #             email_obj.attach_file(file_path)
        #             email_obj.send()

        #         except Exception as e:
        #             errors.append({
        #                 "student_id": student.id,
        #                 "student_email":student.email,
        #                 "error": f"Email failed: {str(e)}"
        #             })


        #         certificate_paths.append({
        #             "student_id": student.id,
        #             "certificate_path": file_path
        #         })
        #     else:
        #         errors.append({
        #             "student_id": student.id,
        #             "error": "Certificate generation failed"
        #         })

        # if updated_student_courses:
        #     StudentCourse.objects.bulk_update(
        #         updated_student_courses, ["certificate_date", "student_certificate_allotment"]
        #     )

        # # Log entry
        # success_students = [sc.student.enrollment_no for sc in updated_student_courses]
        # failed_students = [e["student_id"] for e in errors]

        # log_data = {
        #     "batch_id": batch.batch_id,
        #     "generated": success_students,
        #     "failed": failed_students,
        #     "by": request.user.username
        # }

        # LogEntry.objects.create(
        #     content_type=ContentType.objects.get_for_model(StudentCourse),
        #     cid=str(uuid.uuid4()),
        #     object_pk=batch.id,
        #     object_id=batch.id,
        #     object_repr=f"Batch: {batch.batch_id}",
        #     action=LogEntry.Action.UPDATE,
        #     changes=f"Certificates generated for {len(success_students)} students in batch {batch.batch_id}.",
        #     serialized_data=json.dumps(log_data, default=str),
        #     changes_text=f"Certificates generated for {len(success_students)} students in batch '{batch.batch_id}' by {request.user.username}.",
        #     additional_data="Batch",
        #     actor=request.user,
        #     timestamp=now()
        # )

        # response_data = {"certificates": certificate_paths}
        # if errors:
        #    response_data["errors"] = errors
        #    print(response_data)

        # return Response(response_data, status=status.HTTP_200_OK)


# THIS IS FOR GETTING BATCH LOGS...
class BatchLogListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error':'Unauthorized' }, status=status.HTTP_403_FORBIDDEN)

        batch_ct = ContentType.objects.get_for_model(Batch)
        logs = LogEntry.objects.filter(content_type=batch_ct).order_by('-timestamp')
        serializer = LogEntrySerializer(logs, many=True)
        return Response(serializer.data)


# THIS IS FOR BATCH ATTENDANCE...
class BatchAttendanceView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]


    def post(self, request, id):
        attendance_date = request.data.get('Attendance_date')

        if not attendance_date:
            return Response({'error': 'Attendance_date is required.'}, status=status.HTTP_400_BAD_REQUEST)

        batch_attendance = Attendance.objects.filter(batch__id=id, date=attendance_date)

        if not batch_attendance.exists():
            return Response({'error': 'There is no batch attendance on the provided date.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AttendanceSerializer(batch_attendance, many=True)
        return Response({'attendance': serializer.data}, status=status.HTTP_200_OK)


# THIS IS FOR SENDING EMAIL AND ALSO SAVE IN DATABASE...
EMAIL_TYPE_MODEL_MAP = {
    "Welcome": WelcomeEmail,
    "Batch Start": StartBatchEmail,
    "Batch Complete": ComplateBatchEmail,
    "Batch Cancel": CancelBatchEmail,
    "Attendance Warning": AttendanceWarningEmail,
    "Batch Termination": TerminationBatchEmail,
    "Exam Announcement": ExamAnnouncementEmail,
    "Custom Template": CustomEmail,
}


class EmailSenderAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthFromCookie]

    def post(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        email_send_to = request.data.get('email_send_to')
        email_send_cc = request.data.get('email_send_cc')
        email_send_bcc = request.data.get('email_send_bcc')
        print('email_send_to', " = " ,email_send_to)
        print('email_send_cc', " = ", email_send_cc)
        print('email_send_bcc', " = ", email_send_bcc)
        email_type = request.data.get('email_type')
        email_subject = request.data.get('email_subject')
        email_html = request.data.get('email_html', '')

        if not email_send_to or not isinstance(email_send_to, list):
            return Response({"error": "Invalid or missing email_send_to"}, status=status.HTTP_400_BAD_REQUEST)

        EmailModel = EMAIL_TYPE_MODEL_MAP.get(email_type)
        if not EmailModel:
            return Response({"error": f"Invalid email_type: {email_type}"}, status=status.HTTP_400_BAD_REQUEST)

        subject = f"{email_subject}"
        from_email = "CRAW SECURITY <training@craw.in>"

        def validate_email_list(emails):
            if isinstance(emails, list):
                return emails
            elif isinstance(emails, str):
                return [emails]
            return []

        cc_list = validate_email_list(email_send_cc)
        bcc_input = validate_email_list(email_send_bcc)

        bcc_list = []
        sent_to = []
        errors = []

        for item in bcc_input:
            try:
                student = None
                email = None

                # Check if item is student ID or email
                
                try:
                    student_id = int(item)
                    student = Student.objects.filter(id=student_id).first()
                    if student:
                        email = student.email
                except (ValueError, TypeError):
                    email = item
                    student = Student.objects.filter(email=email).first()

                if not email:
                    errors.append(f"No valid email for BCC entry: {item}")
                    continue

                # Create email model
                email_instance = EmailModel.objects.create(
                    email_opened=False,
                    email_send_date=timezone.now(),
                    email_subject=email_subject,
                    send_by=request.user
                )

                if student:
                    email_instance.student.add(student)

                email_instance.save()
                bcc_list.append(email)

            except Exception as e:
                errors.append(f"Failed to process BCC entry {item}: {str(e)}")

        # Prepare the HTML email
        # html_message = f"""
        # <!DOCTYPE html> 
        # <html>
        # <head><meta charset="UTF-8"><title>CRAW SECURITY</title></head>
        # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        #     <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
        #         <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
        #             <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
        #         </div>
        #         <div style="padding: 20px; color: #000;">
        #             {email_html}
        #         </div>
        #         <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
        #             <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
        #             <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
        #         </div>
        #     </div>
        # </body>
        # </html>
        # """

        # try:
        #     email_message = EmailMessage(
        #         subject=subject,
        #         body=html_message,
        #         from_email=from_email,
        #         to=email_send_to,  # no processing here
        #         cc=cc_list,
        #         bcc=bcc_list
        #     )
        #     email_message.content_subtype = "html"
        #     email_message.send()
        #     sent_to = email_send_to + bcc_list

        #     # ✅ Add log after email send
        #     LogEntry.objects.create(
        #         content_type=ContentType.objects.get_for_model(EmailModel),
        #         cid=str(uuid.uuid4()),
        #         object_pk=str(uuid.uuid4()),  # No specific model instance; using UUID
        #         object_id=None,
        #         object_repr=f"Email: {subject}",
        #         action=LogEntry.Action.CREATE,
        #         changes=f"Email sent to: {', '.join(email_send_to)}",
        #         serialized_data=json.dumps({
        #             "subject": subject,
        #             "to": email_send_to,
        #             "cc": cc_list,
        #             "bcc": bcc_list,
        #             "email_type": email_type,
        #             "by": request.user.username
        #         }, default=str),
        #         changes_text=f"{request.user.username} sent an email to {', '.join(email_send_to)} with subject '{subject}'.",
        #         additional_data="Email",
        #         actor=request.user,
        #         timestamp=now()
        #     )


        # except Exception as e:
        #     errors.append(f"Failed to send email: {str(e)}")

        return Response({
            "message": "Email processing complete.",
            "sent_to": sent_to,
            "errors": errors
        }, status=status.HTTP_200_OK)

{
# class BatchChatsTesting(APIView):
#     permission_classes = [IsAuthenticated]  # Optional but recommended

#     def get(self, request):
#         # Only use model instances, not .values()
#         batches = Batch.objects.all()

#         for batch in batches:
#             # Create chat instance if not already exists
#             chat, created = Chats.objects.get_or_create(
#                 batch=batch
#             )

#             # Optional: prevent duplicate welcome messages
#             if created:
#                 ChatMessage.objects.create(
#                     chat=chat,
#                     sender=request.user.role,  # Should be one of: student, coordinator, admin
#                     send_by = request.user,
#                     message="Welcome Students"
#                 )

#         return Response("Chats and welcome messages created successfully.")
}


def BatchEndingEmail(request=None):
    today = now().date() +  timedelta(days=1)
    five_days_later = today + timedelta(days=5)

    print("Today:", today)
    print("Five days later:", five_days_later)

    batches = Batch.objects.filter(status='Running', end_date__range=(today, five_days_later))
    coordinators = list(Coordinator.objects.values_list('email', flat=True))

    for batch in batches:
        trainer = batch.trainer
        if not trainer or not trainer.email:
            continue

        # Check if email was already sent today for this trainer
        trainer_email_logs = TrainerBatchEndEmail.objects.filter(trainers=trainer, batch=batch)

        already_sent_today = any(
            log.email_send_date.date() == today for log in trainer_email_logs
        )

        if already_sent_today:
            print(f"Email already sent to {trainer.name} today. Skipping.")
            continue

        # Extract fields
        subject = f"📅 Batch Ending Reminder ({batch.batch_time.start_time.strftime('%I:%M %p')} - {batch.batch_time.end_time.strftime('%I:%M %p')})"
        batch_id = batch.batch_id
        batch_course = batch.course.name
        batch_start_date = batch.start_date
        batch_end_date = batch.end_date
        batch_start_time = batch.batch_time.start_time
        batch_end_time = batch.batch_time.end_time

        html_message = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; color: #000;">
            <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
            </div>
            <div style="padding: 30px; font-size: 16px; color: #000;">
                <h2 style="text-align: center; font-size: 22px; color: #000;">📅 Batch Ending Notification</h2>
                <p>Dear <strong>{batch.trainer.name}</strong>,</p>
                <p>This is a kind reminder that your batch <strong>{batch_id}</strong> for the course <strong>{batch_course}</strong> is scheduled to end on <strong>{batch_end_date}</strong>.</p>
                
                <div style="background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">📘 Batch Details</h3>
                    <p><strong>Batch ID:</strong> {batch_id}</p>
                    <p><strong>Course Name:</strong> {batch_course}</p>
                    <p><strong>Start Date:</strong> {batch_start_date}</p>
                    <p><strong>End Date:</strong> {batch_end_date}</p>
                    <p><strong>Timings:</strong> {batch_start_time.strftime('%I:%M %p')} to {batch_end_time.strftime('%I:%M %p')}</p>
                </div>

                <p>Please review the progress of your batch and let us know if you need more time to complete the course. If everything is on track, we truly appreciate your effort and would be grateful if you could complete the batch on time.</p>
                <p>Feel free to get in touch in case of any issues or clarifications.</p>

                <p style="margin-top: 30px;">
                    📍 <strong>Our Address:</strong><br>
                    1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                    Behind Saket Metro Station, New Delhi 110030
                </p>
                <p>
                    📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
                    📧 <strong>Email:</strong> training@craw.in<br>
                    🌐 <strong>Website:</strong> 
                    <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
                </p>
                <p>
                    Best regards,<br>
                    <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
                </p>
            </div>
            <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
                <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
                <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
            </div>
        </div>
        </body>
        </html>
        """

        try:
            # Log email send
            email_log = TrainerBatchEndEmail.objects.create(
                email_subject=f"Batch Ending Reminder ({batch.batch_time.start_time.strftime('%I:%M %p')} - {batch.batch_time.end_time.strftime('%I:%M %p')})"
            )
            email_log.trainers.add(trainer)
            email_log.batch.add(batch)

            # Prepare CCs
            cc_email = coordinators + ['mohit@craw.in']
            if hasattr(trainer, 'teamleader') and trainer.teamleader and trainer.teamleader.email:
                cc_email.append(trainer.teamleader.email)

            # Send email
            email = EmailMessage(
                subject=subject,
                body=html_message,
                from_email="CRAW SECURITY BATCH <training@craw.in>",
                to=[trainer.email],
                cc=cc_email,
            )
            email.content_subtype = "html"
            email.send(fail_silently=False)
            sleep(0.1)

            print(f"Email sent to {trainer.email} for batch {batch_id}")

        except Exception as e:
            error_msg = f"Failed to send email for batch {batch_id}: {str(e)}"
            if request:
                return Response({'error': error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print(error_msg)

    if request:
        return Response({'message': "Batch ending soon emails processed."}, status=status.HTTP_200_OK)
    



# ✅ Django API View (on your server)
class TestAPIFake(APIView):
    def get(self, request):
        result = BatchEndingEmail(request=request)
        return result if isinstance(result, Response) else Response({'message': 'Batch email processing done.'}, status=status.HTTP_200_OK)
