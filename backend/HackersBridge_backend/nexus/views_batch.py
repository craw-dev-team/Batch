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

# from rest_framework_simplejwt.authentication import JWTAuthentication
cid = str(uuid.uuid4())
logger = logging.getLogger(__name__)



# 🔹 Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 200


# THIS IS FOR COOKIE...
{
# class JWTAuthFromCookie(JWTAuthentication):
#     def authenticate(self, request):
#         token = request.COOKIES.get('access_token')

#         if not token:
#             print("No access_token cookie found")
#             return None

#         try:
#             validated_token = self.get_validated_token(token)
#             user = self.get_user(validated_token)
#             return user, validated_token
#         except Exception as e:
#             print("JWT cookie authentication failed:", str(e))
#             raise AuthenticationFailed('Invalid or expired token')
}


# THIS IS FOR GETING BATCH DATA...
class BatchAPIView(APIView):
    authentication_classes = [JWTAuthentication]
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

        today = now().date()
        
        upcoming_threshold = today + timedelta(days=10)

        # Only select needed fields
        batches = Batch.objects.select_related(
            'trainer', 'course', 'location', 'batch_time'
        ).prefetch_related(Prefetch('student', queryset=Batch.student.rel.model.objects.only('id')))

        updated_batches = []
        student_course_updates = []

        # Process batches and track status changes
        for batch in batches:
            old_status = batch.status

            if old_status in ['Hold', 'Cancelled']:
                continue

            # Determine new status
            if batch.start_date <= today < batch.end_date:
                new_status = 'Running'
            elif batch.start_date > today:
                new_status = 'Upcoming'
            else:  # batch.end_date < today
                new_status = 'Completed'

            if new_status != old_status:
                print("Hello every one")
                batch.status = new_status
                updated_batches.append(batch)

                student_ids = list(batch.student.values_list('id', flat=True))
                if student_ids:
                    student_course_updates.append({
                        'student_ids': student_ids,
                        'course_id': batch.course_id,
                        'status': new_status
                    })

        if updated_batches:
            Batch.objects.bulk_update(updated_batches, ['status'])

        for update in student_course_updates:
            mapped_status = self.STATUS_MAPPING.get(update['status'])
            if mapped_status:
                StudentCourse.objects.filter(
                    student_id__in=update['student_ids'],
                    course_id=update['course_id']
                ).update(status=mapped_status)

        # Batch categorization (in one pass)
        all_batches = []
        running, ending_soon, scheduled, completed, hold, cancelled = [], [], [], [], [], []

        batch_data_map = {}
        serializer = BatchSerializer(batches, many=True)
        for data in serializer.data:
            batch_data_map[data['id']] = data

        for batch in batches:
            batch_data = batch_data_map.get(batch.id)
            if not batch_data:
                continue

            all_batches.append(batch_data)

            if batch.status == 'Running':
                # print("Status Running")
                running.append(batch_data)
                if batch.end_date <= upcoming_threshold:
                    ending_soon.append(batch_data)
            elif batch.status == 'Upcoming':
                # print("Status Upcoming")
                scheduled.append(batch_data)
            elif batch.status == 'Completed':
                # print("Status Completed")
                completed.append(batch_data)
            elif batch.status == 'Hold':
                # print("Status Hold")
                hold.append(batch_data)
            elif batch.status == 'Cancelled':
                # print("Status Cancelled")
                cancelled.append(batch_data)

        return Response({
            'All_Type_Batch': {
                'batches': all_batches,
                'running_batch': running,
                'batches_ending_soon': ending_soon,
                'scheduled_batch': scheduled,
                'completed_batch': completed,
                'hold_batch': hold,
                'cancelled_batch': cancelled,
            }
        }, status=status.HTTP_200_OK)
    

# THIS IS FOR CREATING BATCH DATA...
class BatchCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BatchCreateSerializer(data=request.data)

        if serializer.is_valid():
            try:
                batch = serializer.save()

                # Create chat instance
                chat = Chats.objects.create(
                    batch=batch
                )

                # Create welcome message
                ChatMessage.objects.create(
                    chat=chat,
                    sender=request.user.role,  # Should be one of: student, coordinator, admin
                    send_by = request.user,
                    message="Welcome Students"
                )

                # Log the batch creation
                LogEntry.objects.create(
                    content_type=ContentType.objects.get_for_model(Batch),
                    cid=str(uuid.uuid4()),
                    object_pk=batch.id,
                    object_id=batch.id,
                    object_repr=f"Batch: {batch.batch_id}",
                    action=LogEntry.Action.CREATE,
                    changes=f"Created new batch: {batch.batch_id} by {request.user.username}",
                    serialized_data=json.dumps(model_to_dict(batch.trainer) if batch.trainer else {}, default=str),
                    changes_text=(
                        f"A new batch (ID: {batch.batch_id}) was successfully created by "
                        f"{request.user.get_full_name() or request.user.username} "
                        f"for the course '{batch.course.name}' at "
                        f"{batch.batch_time.start_time.strftime('%I:%M %p')} - "
                        f"{batch.batch_time.end_time.strftime('%I:%M %p')} "
                        f"({batch.preferred_week}, {batch.mode})"
                    ),
                    additional_data="Batch",
                    actor=request.user,
                    timestamp=now()
                )

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except serializers.ValidationError as e:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# THIS IS FOR EDIT BATCH DATA...
class BatchEditAPIView(APIView):
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            batch = Batch.objects.get(id=id)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

        # Store old batch data before updating
        old_data = model_to_dict(batch)

        serializer = BatchCreateSerializer(batch, data=request.data, partial=True)
        if serializer.is_valid():
            batch = serializer.save()

            # ✅ Track Changes
            new_data = model_to_dict(batch)
            changes = []
            trainer_changes = ""

            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if new_value != old_value:
                    changes.append(f"{field} changed from '{old_value}' to '{new_value}'")

            # ✅ Check if trainer was updated
            if "trainer" in request.data:
                old_trainer = old_data.get("trainer")
                new_trainer = new_data.get("trainer")

                if old_trainer != new_trainer:
                    old_trainer_name = batch.trainer.name if batch.trainer else "None"
                    trainer_changes = f"Trainer updated from '{old_trainer_name}' to '{new_trainer.name}'"

            # ✅ Log batch update action
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Batch),
                cid=str(uuid.uuid4()),  # Generate unique ID
                object_pk=batch.id,
                object_id=batch.id,
                object_repr=f"Batch: {batch.batch_id}",
                action=LogEntry.Action.UPDATE,
                changes=", ".join(changes) + (". " + trainer_changes if trainer_changes else ""),
                serialized_data=json.dumps(new_data, default=str),  # Store updated data
                changes_text = (f"The batch '{batch.batch_id}' was updated by {request.user.get_full_name() or request.user.username}. "
                                f"Changes made: {', '.join(changes)}"
                                f"{'. ' + trainer_changes if trainer_changes else ''}"),
                additional_data="Batch",
                actor=request.user,
                timestamp=now()
            )

            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# THIS IS FOR DELETING BATCH DATA...
class BatchDeleteAPIView(APIView):
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        """Delete a batch and update student course statuses."""
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            batch = Batch.objects.prefetch_related('student').get(id=id)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

        course = batch.course
        students = list(batch.student.all())  # Fetch students before deleting batch
        batch_status = batch.status  # Store batch status before deletion

        # ✅ Log batch deletion before actually deleting it
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Batch),
            cid=str(uuid.uuid4()),  # Generate unique ID
            object_pk=batch.id,
            object_id=batch.id,
            object_repr=f"Batch: {batch.batch_id}",
            action=LogEntry.Action.DELETE,
            changes=f"Deleted batch: {batch.batch_id} by {request.user.username}",
            serialized_data=json.dumps({'batch_id': batch.batch_id, 'status': batch_status, 'students_count': len(students)}, default=str),
            changes_text=f"Batch '{batch.batch_id}' deleted by {request.user.username}.",
            additional_data="Batch",
            actor=request.user,
            timestamp=now()
        )

        # Delete the batch
        batch.delete()

        # ✅ Update student course statuses based on batch status
        student_update_status = None
        if batch_status == 'Running':
            student_update_status = 'Denied'
        elif batch_status == 'Upcoming':
            student_update_status = 'Not Started'
        elif batch_status == 'Completed':
            student_update_status = 'Completed'

        if student_update_status:
            StudentCourse.objects.filter(student__in=students, course=course).update(status=student_update_status)

        return Response({'detail': 'Batch deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# THIS IS FOR ADDING BATCH LINK...
class BatchOnlinelink(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        batch_link = request.data.get('batch_link')

        if batch_link:
            batch = get_object_or_404(Batch.objects.select_related('course', 'location'), id=id)
            batch.batch_link = batch_link
            batch.save()
            return Response({'message': 'Batch link added successfully'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Batch link not provided'}, status=status.HTTP_400_BAD_REQUEST)


# THIS IS FOR GETING AVAILABLE STUDENT LIST FOR SELECTED BATCH...
class AvailableStudentsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, batch_id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch.objects.select_related('course', 'location'), id=batch_id)
        course = batch.course

        filters = Q(courses__id=course.id, status='Active')

        if batch.language != "Both":
            filters &= Q(language__in=[batch.language, "Both"])
        if batch.preferred_week != "Both":
            filters &= Q(preferred_week__in=[batch.preferred_week, "Both"])
        if batch.mode != "Hybrid":
            filters &= Q(mode__in=[batch.mode, "Hybrid"])
        if batch.location and batch.location.locality != "Both":
            filters &= Q(location__locality__in=[batch.location.locality, "Both"])

        # Disqualified students (already in batches or completed course)
        disqualified_ids = set(
            Student.objects.filter(
                Q(batch__course=course, batch__status__in=['Running', 'Upcoming', 'Completed']) |
                Q(studentcourse__course=course, studentcourse__status='Completed')
            ).values_list('id', flat=True)
        )

        students = Student.objects.filter(filters).exclude(id__in=disqualified_ids)

        # Prerequisite course checks
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

        required_courses = prerequisites.get(course.name)

        if required_courses:
            student_courses = StudentCourse.objects.filter(
                student__in=students, course__name__in=required_courses
            ).values('student_id', 'course__name', 'status')

            course_status_map = defaultdict(dict)
            for entry in student_courses:
                course_status_map[entry['student_id']][entry['course__name']] = entry['status']

            eligible_ids = [
                sid for sid, course_map in course_status_map.items()
                if all(course_map.get(course) == 'Completed' for course in required_courses)
            ]

            # Also include students who have no record of these prerequisites
            # (to avoid unfair exclusion)
            all_student_ids = set(students.values_list('id', flat=True))
            students_with_prereqs = set(course_status_map.keys())
            students_without_prereqs = all_student_ids - students_with_prereqs
            eligible_ids.extend(students_without_prereqs)

            students = students.filter(id__in=eligible_ids)

        serialized_students = StudentSerializer(students, many=True).data
        return Response({"available_students": serialized_students}, status=status.HTTP_200_OK)


# THIS IS FOR GETING AVAILABLE TRAINER LIST FOR SELECTED BATCH...
class AvailableTrainersAPIView(APIView):
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]
    
    def get(self, request, batch_id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        batch = get_object_or_404(Batch, id=batch_id)
        
        language_filter = [batch.language, "Both"]
        location_filter = batch.location
        # print(location_filter)
        
        trainers = Trainer.objects.filter(
            course__id=batch.course.id,  # Use .id to get the integer value
            languages__in=language_filter,
            location_id=location_filter,  # Fix incorrect `location___id`
            status='Active'
        )
        # print("here is this")
        # for ru in trainers:
        #     print(ru)
        
        # Get unavailable trainers, excluding canceled batches
        unavailable_trainers = Batch.objects.filter(
            trainer__in=trainers,
            start_date__lt=batch.end_date,
            end_date__gt=batch.start_date,
            preferred_week=batch.preferred_week,
            batch_time=batch.batch_time,
        ).exclude(status="Cancelled").values_list("trainer_id", flat=True)
        # for tu in unavailable_trainers:
        #     print(tu)

        # Exclude unavailable trainers
        available_trainers = trainers.exclude(id__in=unavailable_trainers)

        # Serialize and return response
        serialized_trainers = TrainerSerializer(available_trainers, many=True).data
        return Response({"available_trainers": serialized_trainers}, status=status.HTTP_200_OK)


# THIS IS FOR ADD STUDENT IN SELECTED BATCH...
class BatchAddStudentAPIView(APIView):
    """API to add students to a batch."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        """Add students to a batch and update their course status accordingly."""
        
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=batch_id)

        if batch.status == 'Completed':
            return Response({"error": "Cannot add students to a completed batch."}, status=status.HTTP_400_BAD_REQUEST)

        student_ids = request.data.get('students', [])

        if not isinstance(student_ids, list) or not student_ids:
            return Response({"error": "Invalid input format. Expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(id__in=student_ids)
        if not students.exists():
            return Response({"error": "No valid students found."}, status=status.HTTP_400_BAD_REQUEST)

        course = batch.course
        added_students = []
        already_enrolled = []

        for student in students:
            assigned = BatchStudentAssignment.objects.filter(batch=batch, student=student).exists()
            if not assigned:
                # Add student to batch
                BatchStudentAssignment.objects.create(batch=batch, student=student)
                added_students.append(student)
            else:
                already_enrolled.append(student.id)

            # Update their batch request (if exists)
            StudentBatchRequest.objects.filter(batch=batch, student=student).update(request_status='Approved')

        # Update their StudentCourse status
        if added_students:
            if batch.status == 'Running':
                status_to_set = 'Ongoing'
            elif batch.status == 'Upcoming':
                status_to_set = 'Not Started'
            else:
                status_to_set = None

            if status_to_set:
                StudentCourse.objects.filter(student__in=added_students, course=course).update(status=status_to_set)

        # Log entry for audit trail
        if added_students:
            student_enrollments = [student.enrollment_no for student in added_students]
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(BatchStudentAssignment),
                cid=str(uuid.uuid4()),
                object_pk=batch.id,
                object_id=batch.id,
                object_repr=f"Batch: {batch.batch_id}",
                action=LogEntry.Action.UPDATE,
                changes=f"Added students {', '.join(student_enrollments)} to batch {batch.batch_id} by {request.user.username}",
                serialized_data=json.dumps({"added_students": student_enrollments, "batch": batch.batch_id}, default=str),
                changes_text=(
                    f"{request.user.get_full_name() or request.user.username} added {len(student_enrollments)} student(s) "
                    f"({', '.join(student_enrollments)}) to batch '{batch.batch_id}'."
                    + (
                        f" Updated their course status to \"{status_to_set}\" based on batch status."
                        if status_to_set else ""
                    )
                ),
                additional_data="Batch",
                actor=request.user,
                timestamp=now()
            )

        return Response({
            "message": "Students processed successfully",
            "added_students": [s.id for s in added_students],
            "already_enrolled": already_enrolled
        }, status=status.HTTP_200_OK)


            # if StudentBatchRequest.objects.filter(batch=batch, student=student).exists():
            #     # batch_request = StudentBatchRequest.objects.filter(batch=batch, student=student)
            #     # batch_request.request_status = 'Approved'
            #     # batch_request.save()


# THIS IS FOR REMOVING STUDENT FROM BATCH ALSO SENDING THE EMAIL TO STUDENT...
class BatchRemoveStudentAPIView(APIView):
    authentication_classes = [JWTAuthentication]
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
            for student in removed_students:
                subject = f"You have been removed from {batch.course} ({batch.batch_id})"
                html_message = f"""<html>
        <head>
        <meta charset="UTF-8">
        <title>Removed from Batch</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; color: #000;">
            <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
            </div>
            <div style="padding: 30px; font-size: 16px; color: #000;">
                <h2 style="text-align: center; font-size: 22px; color: #000;">📢 Batch Update Notice</h2>
                <p style="color: #000;">Dear <strong>{ student.name }</strong>,</p>
                <p style="color: #000;">We would like to inform you that you have been removed from the <strong>{ batch.course }</strong> course batch <strong>{ batch.batch_id }</strong>.</p>
                <p style="color: #000;">If this was unexpected or if you believe this was a mistake, please contact your batch coordinator or Craw Security support immediately.</p>
                <p style="margin-top: 30px; color: #000;">
                    📍 <strong>Our Address:</strong><br>
                    1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                    Behind Saket Metro Station, New Delhi 110030
                </p>
                <p style="color: #000;">
                    📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
                    📧 <strong>Email:</strong> training@craw.in<br>
                    🌐 <strong>Website:</strong> 
                    <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
                </p>
                <p style="color: #000;">
                    Warm regards,<br>
                    <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
                </p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
                <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
                <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
            </div>
        </div>
        </body>
        </html>"""
                from_email = "CRAW SECURITY BATCH <training@craw.in>"
                try:
                    email = EmailMessage(subject, html_message, from_email, [student.email])
                    email.content_subtype = "html"
                    email.send()
                except Exception as e:
                    print(f"Failed to send removal email to {student.email}: {str(e)}")

        return Response({
            "message": "Students removed successfully, and course status updated.",
            "removed_students": [s.id for s in removed_students]
        }, status=status.HTTP_200_OK)



# THIS IS FOR GETING BATCH INFORMATION...
class BatchInfoAPIView(APIView):
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
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


# Generate and assign certificates to students in a batch...
class GenerateBatchCertificateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
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

                # Send Email
                try:
                    subject = f"🎉 Congratulations, {student.name}! Your {course} Certificate is Here!"

                    # html_message = f"""
                    # <!DOCTYPE html>
                    # <html>
                    # <head>
                    #     <meta charset="UTF-8">
                    #     <title>Certificate Issued</title>
                    # </head>
                    # <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    #     <p>Dear <strong>{student.name}</strong>,</p>

                    #     <p>We’re thrilled to congratulate you on successfully completing the <strong>{course}</strong> course at <strong>Craw Cyber Security</strong>!</p>

                    #     <p>Your dedication and hard work have paid off, and we are delighted to issue your official certificate.</p>

                    #     <p>
                    #         <strong>🏷️ Student Enrollment Number:</strong> {student.enrollment_no}<br>
                    #         <strong>📅 Date of Issue:</strong> {issue_date}
                    #     </p>

                    #     <p>Your certificate is attached to this email—feel free to showcase it in your portfolio, LinkedIn profile, or anywhere that highlights your achievements.</p>

                    #     <p>This milestone is just the beginning of your journey in cybersecurity, and we’re excited to see where your skills take you next!</p>

                    #     <p>If you have any questions or need further assistance, don’t hesitate to reach out.</p>

                    #     <p>🚀 Keep learning, keep growing, and keep securing the digital world!</p>

                    #     <p>Best regards,<br>
                    #     🚀 Craw Cyber Security Team<br>
                    #     📧 <a href="mailto:training@craw.in">training@craw.in</a><br>
                    #     📞 +91 9513805401<br>
                    #     🌐 <a href="https://www.craw.in/">https://www.craw.in/</a>
                    #     </p>
                    # </body>
                    # </html>
                    # """

                    html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Certificate Issued</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header with Logo -->
            <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
            <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
            </div>

            <!-- Body -->
            <div style="padding: 30px; color: #000;">
            <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px;">🎓 Certificate of Achievement</h2>

            <p style="font-size: 16px; line-height: 1.6;">
                Dear <strong style="font-weight: bold;">{student.name}</strong>,
            </p>

            <p style="font-size: 16px; line-height: 1.6;">
                Congratulations on successfully completing the <strong style="font-weight: bold;">{course}</strong> course at <strong>Craw Cyber Security</strong>! 🎉
            </p>

            <p style="font-size: 16px; line-height: 1.6;">
                Your hard work and commitment have paid off, and we are excited to issue your official certificate.
            </p>

                <p style="font-size: 16px; line-height: 1.6;">
                    Share your achievement on LinkedIn and tag <strong>@Craw Cyber Security</strong> to inspire others! Don’t forget to use <strong>#crawsec</strong> and <strong>#lifeatcraw</strong> 🚀
                </p>

            <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="font-size: 15px; margin: 6px 0;"><strong>🏷️ Enrollment Number:</strong> {student.enrollment_no}</p>
                <p style="font-size: 15px; margin: 6px 0;"><strong>📅 Date of Issue:</strong> {issue_date}</p>
                <p style="font-size: 15px; margin: 6px 0;"><strong>📎 Certificate:</strong> Attached as PDF</p>
                <ifream src = "file_path" />
            </div>

            <p style="font-size: 16px; line-height: 1.6;">
                Your certificate is attached to this email. Feel free to showcase it in your portfolio, LinkedIn profile, or wherever you wish to highlight your accomplishments.
            </p>

            <p style="font-size: 16px; line-height: 1.6;">
                This is a great milestone in your cybersecurity journey, and we’re confident you’ll achieve even more in the future!
            </p>

            <p style="font-size: 16px; line-height: 1.6;">
                🔐 Stay passionate, stay curious, and keep securing the digital world!
            </p>

            <p style="font-size: 16px; line-height: 1.6;">
                Warm regards,<br>
                <strong style="font-weight: bold;">Craw Cyber Security Team</strong> 🚀<br>
                📧 <a href="mailto:training@craw.in" style="text-decoration: underline;">training@craw.in</a><br>
                📞 +91 9513805401<br>
                🌐 <a href="https://www.craw.in/" style="text-decoration: underline;">www.craw.in</a>
            </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
            <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
            <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
            </div>
        </div>
        </body>
        </html>
        """

                    from_email = "CRAW SECURITY CERTIFICATE <training@craw.in>"
                    email_obj = EmailMessage(subject, html_message, from_email, [student.email])
                    email_obj.content_subtype = "html"
                    email_obj.attach_file(file_path)
                    email_obj.send()

                except Exception as e:
                    errors.append({
                        "student_id": student.id,
                        "student_email":student.email,
                        "error": f"Email failed: {str(e)}"
                    })


                certificate_paths.append({
                    "student_id": student.id,
                    "certificate_path": file_path
                })
            else:
                errors.append({
                    "student_id": student.id,
                    "error": "Certificate generation failed"
                })

        if updated_student_courses:
            StudentCourse.objects.bulk_update(
                updated_student_courses, ["certificate_date", "student_certificate_allotment"]
            )

        # Log entry
        success_students = [sc.student.enrollment_no for sc in updated_student_courses]
        failed_students = [e["student_id"] for e in errors]

        log_data = {
            "batch_id": batch.batch_id,
            "generated": success_students,
            "failed": failed_students,
            "by": request.user.username
        }

        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(StudentCourse),
            cid=str(uuid.uuid4()),
            object_pk=batch.id,
            object_id=batch.id,
            object_repr=f"Batch: {batch.batch_id}",
            action=LogEntry.Action.UPDATE,
            changes=f"Certificates generated for {len(success_students)} students in batch {batch.batch_id}.",
            serialized_data=json.dumps(log_data, default=str),
            changes_text=f"Certificates generated for {len(success_students)} students in batch '{batch.batch_id}' by {request.user.username}.",
            additional_data="Batch",
            actor=request.user,
            timestamp=now()
        )

        response_data = {"certificates": certificate_paths}
        if errors:
           response_data["errors"] = errors
           print(response_data)

        return Response(response_data, status=status.HTTP_200_OK)


# THIS IS FOR GETTING BATCH LOGS...
class BatchLogListView(APIView):
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]

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
        html_message = f"""
        <!DOCTYPE html> 
        <html>
        <head><meta charset="UTF-8"><title>CRAW SECURITY</title></head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                    <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
                </div>
                <div style="padding: 20px; color: #000;">
                    {email_html}
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
            email_message = EmailMessage(
                subject=subject,
                body=html_message,
                from_email=from_email,
                to=email_send_to,  # no processing here
                cc=cc_list,
                bcc=bcc_list
            )
            email_message.content_subtype = "html"
            email_message.send()
            sent_to = email_send_to + bcc_list

            # ✅ Add log after email send
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(EmailModel),
                cid=str(uuid.uuid4()),
                object_pk=str(uuid.uuid4()),  # No specific model instance; using UUID
                object_id=None,
                object_repr=f"Email: {subject}",
                action=LogEntry.Action.CREATE,
                changes=f"Email sent to: {', '.join(email_send_to)}",
                serialized_data=json.dumps({
                    "subject": subject,
                    "to": email_send_to,
                    "cc": cc_list,
                    "bcc": bcc_list,
                    "email_type": email_type,
                    "by": request.user.username
                }, default=str),
                changes_text=f"{request.user.username} sent an email to {', '.join(email_send_to)} with subject '{subject}'.",
                additional_data="Email",
                actor=request.user,
                timestamp=now()
            )


        except Exception as e:
            errors.append(f"Failed to send email: {str(e)}")

        return Response({
            "message": "Email processing complete.",
            "sent_to": sent_to,
            "errors": errors
        }, status=status.HTTP_200_OK)


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