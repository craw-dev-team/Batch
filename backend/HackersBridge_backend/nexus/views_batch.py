import  os
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from .models import Batch, BatchStudentAssignment
from .serializer import BatchSerializer, BatchCreateSerializer, BatchStudentAssignmentSerializer, LogEntrySerializer
from Trainer.serializer import TrainerSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Q, Count, Min, Prefetch
from Student.models import StudentCourse, Student
from Student.serializer import StudentSerializer, StudentCourseSerializer
from Trainer.models import Trainer
from Coordinator.models import Coordinator
from rest_framework.authentication import TokenAuthentication
from nexus.models import Course, Timeslot
from rest_framework import serializers
from nexus.generate_certificate import generate_certificate, get_certificate_path
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.utils.timezone import now
import json
import uuid
from pathlib import Path
from django.utils.dateparse import parse_date
from collections import defaultdict
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
cid = str(uuid.uuid4())




# 🔹 Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 200





# class BatchAPIView(APIView):
#     """
#     API View for fetching batch details with filtering and trainer availability.
#     """
#     authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         batches = Batch.objects.prefetch_related('student').select_related('trainer', 'course', 'location', 'batch_time')
#         now = timezone.now()
#         today = date.today()

#         # Update batch statuses
#         for batch in batches:
#             students = batch.student.all()
#             if batch.status not in ['Hold', 'Cancelled']:
#                 if batch.start_date <= today < batch.end_date:
#                     batch.status = 'Running'
#                     batch.save()
#                     StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Ongoing')
#                 elif batch.start_date >= today and batch.end_date >= today:
#                     batch.status = 'Upcoming'
#                     batch.save()
#                     StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Upcoming')
#                 elif batch.end_date < today:
#                     batch.status = 'Completed'
#                     batch.save()
#                     StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Completed')

#         seven_days_later = now + timedelta(days=10)
#         batches_ending_soon = Batch.objects.filter(end_date__lte=seven_days_later, end_date__gte=now, status='Running').order_by('end_date')
#         # for batch in batches_ending_soon:
#         #     print(batch.end_date, batch.id)
#         #     print(" ")
#         running_batch = Batch.objects.filter(status='Running').order_by('-gen_time')
#         scheduled_batch = Batch.objects.filter(status='Upcoming')
#         completed_batch = Batch.objects.filter(status='Completed')
#         hold_batch = Batch.objects.filter(status='Hold')
#         cancelled_batch = Batch.objects.filter(status='Cancelled')

#         # Serialize the batches using the updated BatchSerializer
#         all_batches_data = {
#             'batches': BatchSerializer(batches, many=True).data,
#             'running_batch': BatchSerializer(running_batch, many=True).data,
#             'batches_ending_soon': BatchSerializer(batches_ending_soon, many=True).data,
#             'scheduled_batch': BatchSerializer(scheduled_batch, many=True).data,
#             'completed_batch': BatchSerializer(completed_batch, many=True).data,
#             'hold_batch': BatchSerializer(hold_batch, many=True).data,
#             'cancelled_batch': BatchSerializer(cancelled_batch, many=True).data,
#         }

#         return Response({'All_Type_Batch': all_batches_data}, status=200)




class BatchAPIView(APIView):
    authentication_classes = [TokenAuthentication]
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
                print("H1")
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
                print("Hello")
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
                running.append(batch_data)
                if batch.end_date <= upcoming_threshold:
                    ending_soon.append(batch_data)
            elif batch.status == 'Upcoming':
                scheduled.append(batch_data)
            elif batch.status == 'Completed':
                completed.append(batch_data)
            elif batch.status == 'Hold':
                hold.append(batch_data)
            elif batch.status == 'Cancelled':
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



class BatchCreateAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BatchCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                batch = serializer.save()
                
                # ✅ Log batch creation action
                LogEntry.objects.create(
                    content_type=ContentType.objects.get_for_model(Batch),
                    cid=str(uuid.uuid4()),  # Generate unique ID
                    object_pk=batch.id,
                    object_id=batch.id,
                    object_repr=f"Batch: {batch.batch_id}",
                    action=LogEntry.Action.CREATE,
                    changes=f"Created new batch: {batch.batch_id} by {request.user.username}",
                    serialized_data=json.dumps(model_to_dict(batch.trainer) if batch.trainer else {}, default=str),
                    changes_text=f"A new batch (ID: {batch.batch_id}) was successfully created by {request.user.get_full_name() or request.user.username} for the course '{batch.course.name}' at {batch.batch_time.start_time.strftime('%I:%M %p')} - {batch.batch_time.end_time.strftime('%I:%M %p')} ({batch.preferred_week}, {batch.mode})",
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
    


class BatchEditAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
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


class BatchDeleteAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
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


class AvailableStudentsAPIView(APIView):
    authentication_classes = [TokenAuthentication]
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






# class AvailableStudentsAPIView(APIView):
#     """API to get available students for a batch."""
#     authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
#     permission_classes = [IsAuthenticated]

#     def get(self, request, batch_id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


#         batch = get_object_or_404(Batch, id=batch_id)

#         # Base filter for active students in the same course
#         filters = Q(courses__id=batch.course.id, status='Active')

#         # Language filter
#         if batch.language != "Both":
#             filters &= Q(language__in=[batch.language, "Both"])

#         # Week filter
#         if batch.preferred_week != "Both":
#             filters &= Q(preferred_week__in=[batch.preferred_week, "Both"])

#         # Mode filter
#         if batch.mode != "Hybrid":
#             filters &= Q(mode__in=[batch.mode, "Hybrid"])

#         # Location filter (Ensure location comparison is valid)
#         if hasattr(batch.location, 'locality') and batch.location.locality != "Both":
#             filters &= Q(location__locality__in=[batch.location.locality, "Both"])


#         # Exclude students who are in a Running or Upcoming batch of the same course
#         ongoing_batches = Batch.objects.filter(course=batch.course, status__in=['Running', 'Upcoming'])
#         ongoing_students = Student.objects.filter(batch__in=ongoing_batches).values_list('id', flat=True)
#         filters &= ~Q(id__in=ongoing_students)


#         # ✅ Exclude students who have completed the course
#         completed_batches = Batch.objects.filter(course=batch.course, status='Completed')
#         completed_students = Student.objects.filter(batch__in=completed_batches).values_list('id', flat=True)
#         filters &= ~Q(id__in=completed_students)

        
#         # ❌ Exclude students whose course status is completed in StudentCourse model
#         completed_course_students = StudentCourse.objects.filter(
#             course=batch.course,
#             status='Completed'
#         ).values_list('student_id', flat=True)
#         filters &= ~Q(id__in=completed_course_students)

#         # Query the filtered students
#         students = Student.objects.filter(filters)

#         # ✅ Apply Ethical Hacking required pre-requisite check

#         prerequisites = {
#             "Ethical Hacking": ['Basic Networking', 'Linux Essentials'],
#             "AWS Associate": ['Basic Networking', 'Linux Essentials'],
#             "AWS Security": ['AWS Associate'],
#             "Advanced Penetration Testing": ['Ethical Hacking'],
#             "Web Application Security":['Advanced Penetration Testing'],
#             "Mobile Application Security": ['Web Application Security'],
#             "Cyber Forensics Investigation": ['Ethical Hacking'],
#         }

#         required_courses = prerequisites.get(batch.course.name)

#         if required_courses:
#             course_statuses = StudentCourse.objects.filter(
#                 student__in=students,
#                 course__name__in=required_courses
#             ).values('student_id', 'course__name', 'status')

#             student_course_map = defaultdict(dict)
#             for entry in course_statuses:
#                 student_course_map[entry['student_id']][entry['course__name']] = entry['status']

#             eligible_ids = []
#             for student in students:
#                 sid = student.id
#                 course_data = student_course_map.get(sid, {})

#                 # ✅ Case 1: Has both and both completed
#                 if all(course_data.get(course) == 'Completed' for course in required_courses):
#                     eligible_ids.append(sid)

#                 # ✅ Case 2: Missing one or both courses (not enrolled)
#                 elif len(course_data) < len(required_courses):
#                     eligible_ids.append(sid)

#             students = students.filter(id__in=eligible_ids)
#         else:
#             print("No prerequisites. Skipping filter.")

#         serialized_students = StudentSerializer(students, many=True).data
#         return Response({"available_students": serialized_students}, status=status.HTTP_200_OK)  





# Exclude students who are already in the batch
# enrolled_students = batch.student.values_list('id', flat=True)  # Get IDs of enrolled students
# filters &= ~Q(id__in=enrolled_students)  # Exclude them from the queryset




class AvailableTrainersAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
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




class BatchAddStudentAPIView(APIView):
    """API to add students to a batch."""
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        """Add students to a batch and update their course status accordingly."""
        
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=batch_id)

        if batch.status == 'Completed':
            return Response({"error": "Cannot add students to a completed batch."}, status=status.HTTP_400_BAD_REQUEST)

        student_ids = request.data.get('students', [])  # Expecting a list of student IDs

        if not isinstance(student_ids, list) or not student_ids:
            return Response({"error": "Invalid input format, expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(id__in=student_ids)

        if not students.exists():
            return Response({"error": "No valid students found."}, status=status.HTTP_400_BAD_REQUEST)

        course = batch.course
        added_students = []
        already_enrolled = []

        for student in students:
            # Check if student is already assigned to this batch
            if not BatchStudentAssignment.objects.filter(batch=batch, student=student).exists():
                BatchStudentAssignment.objects.create(batch=batch, student=student)
                added_students.append(student)
            else:
                already_enrolled.append(student.id)

        # ✅ Update course status based on batch status (only for newly added students)
        student_update_status = None
        if batch.status == 'Running':
            student_update_status = 'Ongoing'
        elif batch.status == 'Upcoming':
            student_update_status = 'Not Started'

        if student_update_status and added_students:
            StudentCourse.objects.filter(student__in=[s.id for s in added_students], course=course).update(status=student_update_status)

        # ✅ Log student additions
        if added_students:
            student_names = [student.enrollment_no for student in added_students]  # Fetch student enrollment numbers
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(BatchStudentAssignment),
                cid=str(uuid.uuid4()),  # Generate unique ID
                object_pk=batch.id,
                object_id=batch.id,
                object_repr=f"Batch: {batch.batch_id}",
                action=LogEntry.Action.UPDATE,
                changes=f"Added students {', '.join(student_names)} to batch {batch.batch_id} by {request.user.username}",
                serialized_data=json.dumps({"added_students": student_names, "batch": batch.batch_id}, default=str),
               changes_text=(f"{request.user.get_full_name() or request.user.username} added {len(student_names)} student(s) "
                                f"({', '.join(student_names)}) to batch '{batch.batch_id}'."
                                + (
                                    f" Updated their course status to \"{student_update_status}\" based on batch status."
                                    if student_update_status else "")),
                additional_data="Batch",
                actor=request.user,
                timestamp=now()
            )

        return Response({
            "message": "Students processed successfully",
            "added_students": [s.id for s in added_students],
            "already_enrolled": already_enrolled
        }, status=status.HTTP_200_OK)




class BatchRemoveStudentAPIView(APIView):
    """API to remove students from a batch and update course status."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        """Remove students from a batch and update their course status accordingly."""

        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=batch_id)
        student_ids = request.data.get('students', [])  # Expecting a list of student IDs

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

                # Update only the course associated with this batch
                student_course = StudentCourse.objects.filter(student=student, course=batch.course).first()
                if student_course:
                    if batch.status == 'Running':
                        student_course.status = 'Denied'
                    elif batch.status == 'Upcoming':
                        student_course.status = 'Not Started'
                    student_courses_to_update.append(student_course)

        # ✅ Bulk update StudentCourse status for better performance
        if student_courses_to_update:
            StudentCourse.objects.bulk_update(student_courses_to_update, ['status'])

        # ✅ Log student removals
        if removed_students:
            student_names = [student.enrollment_no for student in removed_students]  # Fetch student enrollment numbers
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(BatchStudentAssignment),
                cid=str(uuid.uuid4()),  # Generate unique ID
                object_pk=batch.id,
                object_id=batch.id,
                object_repr=f"Batch: {batch.batch_id}",
                action=LogEntry.Action.UPDATE,
                changes=f"Removed students {', '.join(student_names)} from batch {batch.batch_id} by {request.user.username}",
                serialized_data=json.dumps({"removed_students": student_names, "batch": batch.batch_id}, default=str),
                changes_text=(f"{request.user.get_full_name() or request.user.username} removed {len(student_names)} student(s) "
                            f"({', '.join(student_names)}) from batch '{batch.batch_id}'. "
                            f"Updated their course status based on batch state: "
                            f"{'Running → Denied' if batch.status == 'Running' else 'Upcoming → Not Started'}."
                        ),
                additional_data="Batch",
                actor=request.user,
                timestamp=now()
            )

        return Response({
            "message": "Students removed successfully, and course status updated.",
            "removed_students": [s.id for s in removed_students]
        }, status=status.HTTP_200_OK)




class BatchInfoAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=id)

        # Fetch students from BatchStudentAssignment (ensuring correct batch-student mapping)
        student_assignments = BatchStudentAssignment.objects.filter(batch=batch)

        batch_serializer = BatchSerializer(batch)  # Serialize batch details
        student_serializer = BatchStudentAssignmentSerializer(student_assignments, many=True)  # Serialize students with status

        # Fetch logs for this Batch
        batch_ct = ContentType.objects.get_for_model(Batch)
        batch_logs = LogEntry.objects.filter(content_type=batch_ct, object_id=batch.id).order_by('-timestamp')
        serialized_logs = LogEntrySerializer(batch_logs, many=True).data

        return Response({
            'batch': batch_serializer.data,
            'students': student_serializer.data,
            'batch_logs': serialized_logs,
        }, status=status.HTTP_200_OK)
    

class BatchStudentAssignmentUpdateAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
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


# class GenerateBatchCertificateAPIView(APIView):
#     def post(self, request, id, *args, **kwargs):
#         issue_date = request.data.get("issue_date")
#         student_ids = request.data.get("student_id", [])

#         if not issue_date:
#             return Response({"error": "Issue date is required"}, status=status.HTTP_400_BAD_REQUEST)

#         # Get the batch and course
#         batch = get_object_or_404(Batch, id=id)
#         course = batch.course.name

#         # Fetch all completed student courses for the given student IDs
#         student_courses = StudentCourse.objects.filter(
#             student__id__in=student_ids, course=batch.course, status="Completed"
#         )

#         if not student_courses.exists():
#             return Response({"error": "No completed student courses found for this batch"}, status=status.HTTP_400_BAD_REQUEST)

#         certificate_paths = []
#         errors = []

#         for student_course in student_courses:
#             student = student_course.student
#             student_course.certificate_date = issue_date
#             student_course.save(update_fields=["certificate_date"])

#             # Generate certificate
#             file_path = generate_certificate(course, student.name, student.enrollment_no, issue_date)
            
#             if os.path.exists(file_path):
#                 student_course.student_certificate_allotment = True
#                 student_course.save(update_fields=["student_certificate_allotment"])
#                 certificate_paths.append({
#                     "student_id": student.id,
#                     "certificate_path": file_path
#                 })
#             else:
#                 errors.append({
#                     "student_id": student.id,
#                     "error": "Certificate generation failed"
#                 })

#         response_data = {"certificates": certificate_paths}
#         if errors:
#             response_data["errors"] = errors

#         return Response(response_data, status=status.HTTP_200_OK)



class GenerateBatchCertificateAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id, *args, **kwargs):
        """Generate and assign certificates to students in a batch."""

        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        issue_date = request.data.get("issue_date")
        student_ids = request.data.get("students", [])  # ✅ Changed key to "students" for clarity

        # ✅ Validate issue_date format
        if not issue_date or not parse_date(issue_date):
            return Response({"error": "Invalid or missing issue date."}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(student_ids, list) or not student_ids:
            return Response({"error": "Invalid input format, expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Get batch and course
        batch = get_object_or_404(Batch, id=id)
        course = batch.course.name

        # ✅ Fetch only students with completed courses
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
            student_course.certificate_date = issue_date

            # ✅ Generate certificate
            file_path = generate_certificate(course, student.name, student.enrollment_no, issue_date)

            if Path(file_path).exists():  # ✅ Using Path for safer file existence check
                student_course.student_certificate_allotment = True
                updated_student_courses.append(student_course)  # Add to bulk update list
                certificate_paths.append({
                    "student_id": student.id,
                    "certificate_path": file_path
                })
            else:
                errors.append({
                    "student_id": student.id,
                    "error": "Certificate generation failed"
                })

        # ✅ Bulk update student certificates for efficiency
        if updated_student_courses:
            StudentCourse.objects.bulk_update(updated_student_courses, ["certificate_date", "student_certificate_allotment"])

        # ✅ Log Certificate Generation
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
            cid=str(uuid.uuid4()),  # Unique log ID
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

        return Response(response_data, status=status.HTTP_200_OK)
    

class BatchLogListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error':'Unauthorized' }, status=status.HTTP_403_FORBIDDEN)

        batch_ct = ContentType.objects.get_for_model(Batch)
        logs = LogEntry.objects.filter(content_type=batch_ct).order_by('-timestamp')
        serializer = LogEntrySerializer(logs, many=True)
        return Response(serializer.data)




# 🔹 List API View
# class LogEntryListAPIView(ListAPIView):
#     """Paginated log listing with filters (standard page-based)."""
#     serializer_class = LogEntrySerializer
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardResultsSetPagination
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['object_repr', 'additional_data', 'actor__first_name', 'actor__username']

#     def get_queryset(self):
#         user = self.request.user

#         if user.role not in ['admin', 'coordinator']:
#             return LogEntry.objects.none()

#         queryset = LogEntry.objects.all().order_by('-timestamp')

#         # Apply filters
#         action = self.request.query_params.get('action')
#         actor_username = self.request.query_params.get('actor_username')
#         actor_firstname = self.request.query_params.get('actor_firstname')
#         object_id = self.request.query_params.get('object_id')

#         if action:
#             queryset = queryset.filter(action__iexact=action)

#         if actor_username:
#             queryset = queryset.filter(actor__username__iexact=actor_username)

#         if actor_firstname:
#             queryset = queryset.filter(actor__first_name__iexact=actor_firstname)

#         if object_id:
#             queryset = queryset.filter(object_id=object_id)

#         log_counts = (
#             LogEntry.objects
#             .filter(actor__role='coordinator')
#             .values('actor__id', 'actor__username', 'actor__first_name')
#             .annotate(log_count=Count('id'))
#             .order_by('-log_count')
#         )

#         info = {
#                     'queryset':queryset,
#                     'log_counts':log_counts
#                 }

#         return info



# from rest_framework.response import Response
# from django.db.models import Count

class LogEntryListAPIView(ListAPIView):
    """Paginated log listing with filters (standard page-based)."""
    serializer_class = LogEntrySerializer
    authentication_classes = [TokenAuthentication]
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
            .filter(actor__role='coordinator', timestamp__date=today)
            .values('actor__id', 'actor__username', 'actor__first_name')
            .annotate(log_count=Count('id'))
            .order_by('-log_count')
        )

        response.data['log_counts_by_coordinator'] = log_counts
        return response
