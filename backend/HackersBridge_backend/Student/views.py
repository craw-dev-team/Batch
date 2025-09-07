import os
import json
import uuid
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Student, Installment, FeesRecords, StudentCourse, StudentNotes, BookAllotment, StudentTags, Tags
from .serializer import StudentSerializer, StudentNoteSerializer, StudentCourseSerializer, StudentBookAllotmentSerializer, SimpleStudentSerializer, TagsSerializer
from django_filters.rest_framework import DjangoFilterBackend, DateFromToRangeFilter, FilterSet
from nexus.models import Batch, Timeslot, Course, Attendance, Book
from django.db.models import Count, Q, Exists, OuterRef
from rest_framework.authtoken.models import Token
from nexus.serializer import BatchStudentAssignment, LogEntrySerializer
from django.utils.timezone import now
from django.http import FileResponse
from nexus.generate_certificate import generate_certificate, get_certificate_path
from django.core.mail import EmailMessage
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict
from django.utils.timezone import now
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Prefetch
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.authentication import JWTAuthentication
# from django.contrib.auth.models import User
from datetime import date
from django.utils.html import escape
from django.utils import timezone
from datetime import date, datetime
User = get_user_model()
from nexus.JWTCookie import JWTAuthFromCookie
from django.db import transaction


# This is student list pagination 
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 50



# ✅ Student List API (Only for Batch List)
class ALLStudentListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Only fetch basic student data needed for SimpleStudentSerializer
        students = Student.objects.only('id', 'name', 'email', 'phone', 'enrollment_no')

        serializer = SimpleStudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



# ✅ Custom Filter for range filtering on date_of_joining
class StudentFilter(FilterSet):
    date_of_joining = DateFromToRangeFilter()

    class Meta:
        model = Student
        fields = ['mode', 'preferred_week', 'language', 'location', 'status', 'date_of_joining']


# ✅ Student List API with pagination + filters
class StudentListView(ListAPIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]
    serializer_class = StudentSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = [
        'name', 'phone', 'alternate_phone', 
        'guardian_no', 'email', 'enrollment_no', 
        'mode', 'preferred_week', 'language', 
        'support_coordinator__name', 'course_counsellor__name', 'date_of_joining'
    ]
    filterset_class = StudentFilter  # ✅ Corrected this line

    def get_queryset(self):
        if self.request.user.role not in ['admin', 'coordinator']:
            return Student.objects.none()
        
        completed_courses_prefetch = Prefetch(
            'studentcourse_set', 
            queryset=StudentCourse.objects.select_related('course').filter(status='Completed'),
            to_attr='completed_courses'
        )

        notes_prefetch = Prefetch(
            'notes',
            queryset=StudentNotes.objects.select_related('create_by')
        )

        student_data = Student.objects.select_related(
            'course_counsellor', 'support_coordinator', 'location'
        ).prefetch_related(
            'courses',
            completed_courses_prefetch,
            notes_prefetch
        ).order_by('date_of_joining')
        
        return student_data

{


# class StudentListView(ListAPIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#     serializer_class = StudentSerializer
#     pagination_class = StandardResultsSetPagination
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['name', 'phone', 'alternate_phone', 'guardian_no', 'email', 'enrollment_no']

#     def get_queryset(self):
#         if self.request.user.role not in ['admin', 'coordinator']:
#             return Student.objects.none()
        
#         completed_courses_prefetch = Prefetch(
#             'studentcourse_set', 
#             queryset=StudentCourse.objects.select_related('course').filter(status='Completed'),
#             to_attr='completed_courses'
#         )

#         notes_prefetch = Prefetch(
#             'notes',
#             queryset=StudentNotes.objects.select_related('create_by')
#         )

#         student_data = Student.objects.select_related(
#                         'course_counsellor', 'support_coordinator', 'location'
#                     ).only(
#                         'id', 'name', 'email', 'phone',  'enrollment_no',
#                         'course_counsellor__name', 'support_coordinator__name', 'location__locality',
#                         'dob', 'preferred_week',
#                         'language', 'mode', 'status', 'date_of_joining'
#                     ).prefetch_related(
#                         'courses',
#                         completed_courses_prefetch,
#                         notes_prefetch
#                     ).order_by('-last_update_datetime')
#         return student_data
}

{
# # class StudentCrawListView(APIView):
# #     authentication_classes = [JWTAuthFromCookie]
# #     permission_classes = [IsAuthenticated]

# #     def get(self, request, *args, **kwargs):
# #         if request.user.role not in ['admin', 'coordinator']:
# #             return Response({'error': 'Unauthorized'}, status=403)

# #         today = now().date()

# #         # 1. Subquery to check enrollment
# #         enrolled_subquery = BatchStudentAssignment.objects.filter(
# #             student=OuterRef('pk')
# #         )

# #         # 2. Prefetch student course status (just IDs & status)
# #         course_prefetch = Prefetch(
# #             'studentcourse_set',
# #             queryset=StudentCourse.objects.only('student_id', 'status'),
# #             to_attr='prefetched_courses'
# #         )

# #         # 3. Only required fields & relations
# #         students_qs = Student.objects.select_related(
# #             'course_counsellor', 'support_coordinator', 'location'
# #         ).only(
# #             'id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'date_of_joining',
# #             'course_counsellor_id', 'support_coordinator_id', 'location_id'
# #         ).annotate(
# #             is_enrolled=Exists(enrolled_subquery)
# #         ).prefetch_related(course_prefetch)

# #         # 4. Use iterator() to stream rows instead of loading all in memory
# #         active_students, inactive_students = [], []
# #         enrolled_students, today_students, free_students = [], [], []

# #         for student in students_qs.iterator(chunk_size=500):
# #             # Pre-checks
# #             if student.status == 'Active':
# #                 active_students.append(student)
# #             else:
# #                 inactive_students.append(student)

# #             if student.is_enrolled:
# #                 enrolled_students.append(student)

# #             if student.date_of_joining == today:
# #                 today_students.append(student)

# #             # Free student logic (from prefetched courses)
# #             if hasattr(student, 'prefetched_courses'):
# #                 statuses = {s.status for s in student.prefetched_courses}
# #                 if 'Not Started' in statuses and not statuses.intersection({'Ongoing', 'Upcoming'}):
# #                     if student.status == 'Active':
# #                         free_students.append(student)

# #         # 5. Fast serialization — only serialize top 100 per list to avoid overload
# #         def fast_serialize(students):
# #             return StudentSerializer(students[:100], many=True).data

# #         return Response({
# #             "total_student": students_qs.count(),
# #             "active_student_count": len(active_students),
# #             "inactive_student_count": len(inactive_students),
# #             "enrolled_student_count": len(enrolled_students),
# #             "not_enrolled_student_count": len(free_students),
# #             "today_added_student_count": len(today_students),

# #             "active_students": fast_serialize(active_students),
# #             "inactive_students": fast_serialize(inactive_students),
# #             "enrolled_students": fast_serialize(enrolled_students),
# #             "not_enrolled_students": fast_serialize(free_students),
# #             "today_added_students": fast_serialize(today_students),
#         })
}

{
# class FreeStudentListView(APIView):
#     def get(self, request):

#         # Fetching those student id how have any Not-start course
#         students_ids = StudentCourse.objects.filter(status="Not Started").values_list('student', flat=True).distinct()

#         # Fetching student list using student id
#         students = Student.objects.filter(id__in=students_ids)

#         # Filter for removing dose student who have any ongoing course
#         student_ongoing = StudentCourse.objects.filter(student__in=students, status="Ongoing").values_list('student', flat=True).distinct()

#         student = Student.objects.filter(id__in=students_ids).exclude(id__in=student_ongoing)

#         serializer = StudentSerializer(student, many=True)

#         return Response(serializer.data)
}

class StudentCrawListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=403)

        today = now().date()

        enrolled_subquery = BatchStudentAssignment.objects.filter(
            student=OuterRef('pk')
        )

        course_prefetch = Prefetch(
            'studentcourse_set',
            queryset=StudentCourse.objects.only('student_id', 'status'),
            to_attr='prefetched_courses'
        )

        students_qs = Student.objects.select_related(
            'course_counsellor', 'support_coordinator', 'location'
        ).only(
            'id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'date_of_joining',
            'course_counsellor_id', 'support_coordinator_id', 'location_id'
        ).annotate(
            is_enrolled=Exists(enrolled_subquery)
        ).prefetch_related(course_prefetch)

        active_students, inactive_students = [], []
        enrolled_students, today_students, free_students = [], [], []

        for student in students_qs.iterator(chunk_size=500):
            if student.status == 'Active':
                active_students.append(student)
            else:
                inactive_students.append(student)

            if student.is_enrolled:
                enrolled_students.append(student)

            if student.date_of_joining == today:
                today_students.append(student)

            if hasattr(student, 'prefetched_courses'):
                statuses = {s.status for s in student.prefetched_courses}
                if 'Not Started' in statuses and not statuses.intersection({'Ongoing', 'Upcoming'}):
                    if student.status == 'Active':
                        free_students.append(student)

        def paginate_list(data_list):
            try:
                page = int(request.query_params.get('page', 1))
                page_size = int(request.query_params.get('page_size', 50))
            except ValueError:
                page, page_size = 1, 50

            start = (page - 1) * page_size
            end = start + page_size
            return {
                "total": len(data_list),
                "page": page,
                "page_size": page_size,
                "results": StudentSerializer(data_list[start:end], many=True).data
            }

        requested_type = request.query_params.get('type', '').strip()

        response_data = {
            "total_student": students_qs.count(),
            "active_students_count": len(active_students),
            "inactive_students_count": len(inactive_students),
            "enrolled_students_count": len(enrolled_students),
            "not_enrolled_students_count": len(free_students),
            "today_added_students_count": len(today_students),
        }

        if requested_type == "active_students":
            response_data["active_students"] = paginate_list(active_students)
        elif requested_type == "inactive_students":
            response_data["inactive_students"] = paginate_list(inactive_students)
        elif requested_type == "enrolled_students":
            response_data["enrolled_students"] = paginate_list(enrolled_students)
        elif requested_type == "not_enrolled_students":
            response_data["not_enrolled_students"] = paginate_list(free_students)
        elif requested_type == "today_added_students":
            response_data["today_added_students"] = paginate_list(today_students)
        else:
            response_data["all_students"] = paginate_list(list(students_qs))

        # Else: No list, only counts are sent

        return Response(response_data)

class AddStudentView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # ✅ Check user role (Only Admin & Coordinator can add students)
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentSerializer(data=request.data, context={'request': request})  # ✅ Pass request context
        if serializer.is_valid():
            student = serializer.save()
            
            # ✅ Store student details
            student_data = {field.name: getattr(student, field.name, None) for field in Student._meta.fields}   
            changes_text = [f"Created field {field}: {value}" for field, value in student_data.items()]
            
            # ✅ Log entry for student creation
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Student),
                cid=str(uuid.uuid4()),  # ✅ Generate a unique correlation ID
                object_pk=student.id,
                object_id=student.id,
                object_repr=f"Student ID: {student.enrollment_no} | Name: {student.name}",
                action=LogEntry.Action.CREATE,
                changes=f"Created Student: {student_data} by {request.user.username}",
                serialized_data=json.dumps(model_to_dict(student), default=str),  # ✅ JSON serialized student data
                changes_text=" ".join(changes_text),
                additional_data="Student",
                actor=request.user,
                timestamp=now()
            )
            
            return Response({'message': 'Student added successfully', 'student_id': student.id}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


{

# ✅ Edit Student API with email update handling
# class EditStudentView(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def put(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         print(request.data)
#         student = get_object_or_404(Student, id=id)
#         old_student_data = model_to_dict(student)  # Get all old field values
#         old_email = student.email  # Store old email before update

#         # ✅ Pass request context for proper handling in serializer
#         serializer = StudentSerializer(student, data=request.data, partial=True, context={'request': request})

#         if serializer.is_valid():
#             student = serializer.save()
#             new_student_data = model_to_dict(student)  # Get new field values
            
#             # ✅ Generate a unique correlation ID for logging
#             cid = str(uuid.uuid4())

#             # ✅ Update User email if changed
#             new_email = serializer.validated_data.get('email')
#             if old_email and new_email and old_email != new_email:
#                 user = User.objects.filter(email=old_email).first()
#                 if user:
#                     user.email = new_email
#                     user.save()

#             # ✅ Track what changed
#             changes = {}
#             for field, old_value in old_student_data.items():
#                 new_value = new_student_data.get(field)
#                 if old_value != new_value:  # Only log changes
#                     changes[field] = {
#                         "old": str(old_value) if old_value else "None",
#                         "new": str(new_value) if new_value else "None"
#                     }

#             changes_text = []
#             for field, change in changes.items():
#                 if change["old"] != "None" and change["new"] != "None":
#                     changes_text.append(f"Updated {field} from {change['old']} to {change['new']}.")
#                 elif change["new"] != "None":
#                     changes_text.append(f"Added {field}: {change['new']}.")
#                 elif change["old"] != "None":
#                     changes_text.append(f"Removed {field}: {change['old']}.")

#             # ✅ Log detailed update action
#             LogEntry.objects.create(
#                 content_type=ContentType.objects.get_for_model(Student),
#                 cid=cid,
#                 object_pk=student.id,
#                 object_id=student.id,
#                 object_repr=f"Student ID: {student.enrollment_no} | Name: {student.name}",
#                 action=LogEntry.Action.UPDATE,
#                 changes=f"Updated student: {student.name} by {request.user.username}. Changes: {changes}",
#                 serialized_data=json.dumps(model_to_dict(student), default=str),
#                 changes_text=" ".join(changes_text),
#                 additional_data="Student",
#                 actor=request.user,
#                 timestamp=now()
#             )

#             return Response({
#                 'message': 'Student updated successfully',
#                 'student_id': student.id
#             }, status=status.HTTP_200_OK)
}
class EditStudentView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        # Only admins/coordinators may edit
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = get_object_or_404(Student, id=id)
        old_data = model_to_dict(student)
        old_email = student.email

        # Make a mutable copy of request.data
        data = request.data.copy()

        # Remove empty string for list fields
        for list_field in ('tags', 'complete_course', 'courses'):
            if list_field in data and data[list_field] == '':
                data.pop(list_field)

        serializer = StudentSerializer(
            student,
            data=data,
            partial=True,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save updates to Student
        with transaction.atomic():
            student = serializer.save()

            # Handle email change on the associated User
            new_email = serializer.validated_data.get('email')
            if old_email and new_email and old_email != new_email:
                # Normalize email (lowercase, strip)
                new_email = new_email.strip().lower()

                # First, find User by student.enrollment_no (if that's how you map)
                u = User.objects.filter(username=student.enrollment_no).first()
                if not u:
                    # Fallback: find by old_email if User exists
                    u = User.objects.filter(email=old_email).first()
                if u:
                    # Prevent duplicate emails
                    if User.objects.filter(email=new_email).exclude(pk=u.pk).exists():
                        return Response({'error': 'This email is already taken by another user.'}, status=400)
                    u.email = new_email
                    u.save()

        # Write an audit log
        new_data = model_to_dict(student)
        changes = {}
        for f, old in old_data.items():
            new = new_data.get(f)
            if old != new:
                changes[f] = {'old': old, 'new': new}

        change_texts = []
        for f, ch in changes.items():
            change_texts.append(f"{f}: {ch['old']} → {ch['new']}")

        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Student),
            cid=str(uuid.uuid4()),
            object_pk=student.id,
            object_id=student.id,
            object_repr=f"{student.name} ({student.enrollment_no})",
            action=LogEntry.Action.UPDATE,
            changes=json.dumps(changes),
            serialized_data=json.dumps(new_data, default=str),
            changes_text="; ".join(change_texts),
            additional_data="Student",
            actor=request.user,
            timestamp=now()
        )

        return Response({
            'message': 'Student updated successfully',
            'student_id': student.id
        }, status=status.HTTP_200_OK)
    


# ✅ Add Fees API
class AddFeesView(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def post(self, request, student_id):
    
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = get_object_or_404(Student, id=student_id)
        data = request.data
        payment = float(data['payment'])

        student.installment.paid_fees += payment
        student.installment.due_fees -= payment
        student.installment.ins_paid += 1
        student.installment.ins_rem -= 1
        if student.installment.paid_fees >= student.installment.total_fee:
            student.installment.is_completed = True
            student.installment.ins_rem = 0
        student.installment.save()

        FeesRecords.objects.create(
            student=student,
            installments=student.installment,
            counsellor_id=data['counsellor'],
            payment_date=data['payment_date'],
            payment=payment,
            pay_mode=data['pay_mode'],
            transition_id=data['transition_id']
        )

        return Response({'message': 'Fees added successfully'}, status=status.HTTP_201_CREATED)
        


{
# class StudentInfoAPIView(APIView):
#     authentication_classes = [JWTAuthFromCookie]  # Ensures user must provide a valid token
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         # Get the student by ID
#         student = get_object_or_404(Student, id=id)

#         # Fetch student's enrolled courses
#         student_courses = StudentCourse.objects.filter(student=student).select_related('course')
        
#         student_course_list = [
#             {
#                 'id': course.id,
#                 'course_name': course.course.name,
#                 'course_taken': Batch.objects.filter(student=student, course=course.course).count(),
#                 'course_status': course.status,
#                 'course_certificate_date': course.certificate_date,
#                 'certificate_issued_at':course.certificate_issued_at,
#                 'student_book_allotment':course.student_book_allotment,
#             }
#             for course in student_courses
#         ]

#         # Fetch batches based on status
#         batch_statuses = ['Upcoming', 'Completed', 'Running', 'Hold']
#         student_batches = {
#             status: Batch.objects.filter(student=student, status=status).select_related('course', 'trainer', 'batch_time')
#             for status in batch_statuses
#         }

#         # Get all upcoming batches for the student's courses
#         student_course_ids = student_courses.values_list("course_id", flat=True)
#         all_upcoming_batches = Batch.objects.filter(course_id__in=student_course_ids, status='Upcoming')

#         # Get completed and ongoing course IDs to exclude from upcoming batches
#         student_completed_course_ids = student_courses.filter(status__in=['Completed', 'Ongoing']).values_list('course_id', flat=True)

#         # Exclude already assigned upcoming batches
#         filtered_upcoming_batches = all_upcoming_batches.exclude(
#             course_id__in=student_completed_course_ids
#         ).exclude(id__in=student_batches['Upcoming'].values_list("id", flat=True))

#         # Update student course status based on batch status
#         StudentCourse.objects.filter(student=student, course__in=student_batches['Upcoming'].values_list("course_id", flat=True)).update(status='Upcoming')

#         # Get total student count
#         student_count = Student.objects.count()

#         # ✅ Fetch logs for this student
#         student_ct = ContentType.objects.get_for_model(Student)
#         student_logs = LogEntry.objects.filter(content_type=student_ct, object_id=student.id).order_by('-timestamp')
#         serialized_logs = LogEntrySerializer(student_logs, many=True).data

#         # Build response data
#         response_data = {
#             "All_in_One": {
#                 'student_count': student_count,
#                 'student': StudentSerializer(student).data,
#                 'student_courses': student_course_list,
#                 'student_batch_upcoming': list(student_batches['Upcoming'].values(
#                     *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
#                 )),
#                 'student_batch_hold': list(student_batches['Hold'].values(
#                     *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
#                 )),
#                 'student_batch_ongoing': list(student_batches['Running'].values(
#                     *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
#                 )),
#                 'student_batch_completed': list(student_batches['Completed'].values(
#                     *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
#                 )),
#                 'all_upcoming_batch': list(filtered_upcoming_batches.values(
#                     *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
#                 )),
#                 'student_logs': serialized_logs,
#             }
#         }

#         return Response(response_data, status=status.HTTP_200_OK)
}


{

# class StudentInfoAPIView(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         student = get_object_or_404(Student, id=id)

#         # Fetch related student courses with course data
#         student_courses = StudentCourse.objects.filter(student=student).select_related('course')
#         student_course_ids = list(student_courses.values_list('id', flat=True))

#         student_course_list = []
#         for sc in student_courses:
#             # Get book issue dates
#             book_issues = BookAllotment.objects.filter(
#                 book__course=sc.course,
#                 student=student
#             ).values('allotment_datetime')

#             student_course_list.append({
#                 'id': sc.id,
#                 'course_name': sc.course.name,
#                 'course_taken': Batch.objects.filter(student=student, course=sc.course).count(),
#                 'course_status': sc.status,
#                 'course_certificate_date': sc.certificate_date,
#                 'certificate_issued_at': sc.certificate_issued_at,
#                 'student_book_allotment': sc.student_book_allotment,
#                 'student_old_book_allotment': sc.student_old_book_allotment,
#                 'student_book_issue_date': list(book_issues),
#                 'student_marks': sc.marks,
#                 'student_exam_date': sc.marks_update_date,
#             })

#         # Get batches grouped by status
#         batch_statuses = ['Upcoming', 'Completed', 'Running', 'Hold']
#         student_batches = {
#             status: Batch.objects.filter(student=student, status=status).select_related('course', 'trainer', 'batch_time')
#             for status in batch_statuses
#         }

#         # Identify upcoming batches not already in student's completed/ongoing courses
#         completed_or_ongoing_course_ids = student_courses.filter(
#             status__in=['Completed', 'Ongoing']
#         ).values_list('course_id', flat=True)

#         all_upcoming_batches = Batch.objects.filter(
#             course__in=student_courses.values_list('course_id', flat=True),
#             status='Upcoming'
#         )

#         filtered_upcoming_batches = all_upcoming_batches.exclude(
#             course_id__in=completed_or_ongoing_course_ids
#         ).exclude(
#             id__in=student_batches['Upcoming'].values_list('id', flat=True)
#         )

#         # Update status to 'Upcoming' for related StudentCourse entries
#         StudentCourse.objects.filter(
#             student=student,
#             course__in=student_batches['Upcoming'].values_list('course_id', flat=True)
#         ).update(status='Upcoming')

#         # Fetch logs
#         content_types = ContentType.objects.get_for_models(Student, StudentCourse, StudentNotes)
#         student_logs = LogEntry.objects.filter(
#             content_type__in=content_types.values()
#         ).filter(
#             Q(object_id=student.id) | Q(object_id__in=student_course_ids)
#         ).order_by('-timestamp')

#         serialized_logs = LogEntrySerializer(student_logs, many=True).data

#         # Notes
#         note_fields = [
#             'id', 'note', 'create_at', 'last_update_datetime',
#             'create_by__first_name', 'create_by__role'
#         ]
#         student_notes = StudentNotes.objects.filter(student=student).values(*note_fields).order_by('-create_at')

#         # Prepare batch fields
#         batch_fields = [field.name for field in Batch._meta.fields]
#         batch_extra_fields = ['course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time']

#         response_data = {
#             "All_in_One": {
#                 'student_count': Student.objects.count(),
#                 'student': StudentSerializer(student).data,
#                 'student_courses': student_course_list,
#                 'student_notes': student_notes,
#                 'student_batch_upcoming': list(student_batches['Upcoming'].values(*batch_fields, *batch_extra_fields)),
#                 'student_batch_hold': list(student_batches['Hold'].values(*batch_fields, *batch_extra_fields)),
#                 'student_batch_ongoing': list(student_batches['Running'].values(*batch_fields, *batch_extra_fields)),
#                 'student_batch_completed': list(student_batches['Completed'].values(*batch_fields, *batch_extra_fields)),
#                 'all_upcoming_batch': list(filtered_upcoming_batches.values(*batch_fields, *batch_extra_fields)),
#                 'student_logs': serialized_logs,
#             }
#         }

#         return Response(response_data, status=status.HTTP_200_OK)
}

class StudentInfoAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student = get_object_or_404(Student, id=id)

        student_courses = StudentCourse.objects.filter(student=student).select_related('course')
        student_course_ids = list(student_courses.values_list('id', flat=True))

        student_course_list = []
        for sc in student_courses:
            book_issues = BookAllotment.objects.filter(book__course=sc.course, student=student).values('allotment_datetime')
            student_course_list.append({
                'id': sc.id,
                'course_name': sc.course.name,
                'course_taken': Batch.objects.filter(student=student, course=sc.course).count(),
                'course_status': sc.status,
                'course_certificate_date': sc.certificate_date,
                'certificate_issued_at': sc.certificate_issued_at,
                'student_book_allotment': sc.student_book_allotment,
                'student_old_book_allotment': sc.student_old_book_allotment,
                'student_book_issue_date': list(book_issues),
                'student_marks': sc.marks,
                'student_exam_date': sc.marks_update_date,
            })

        batch_statuses = ['Upcoming', 'Completed', 'Running', 'Hold']
        student_batches = {
            status: Batch.objects.filter(student=student, status=status).select_related('course', 'trainer', 'batch_time')
            for status in batch_statuses
        }

        completed_or_ongoing_course_ids = student_courses.filter(status__in=['Completed', 'Ongoing']).values_list('course_id', flat=True)

        all_upcoming_batches = Batch.objects.filter(course__in=student_courses.values_list('course_id', flat=True), status='Upcoming')

        filtered_upcoming_batches = all_upcoming_batches.exclude(
            course_id__in=completed_or_ongoing_course_ids
        ).exclude(
            id__in=student_batches['Upcoming'].values_list('id', flat=True)
        )

        StudentCourse.objects.filter(
            student=student,
            course__in=student_batches['Upcoming'].values_list('course_id', flat=True)
        ).update(status='Upcoming')

        content_types = ContentType.objects.get_for_models(Student, StudentCourse, StudentNotes)
        student_logs = LogEntry.objects.filter(
            content_type__in=content_types.values()
        ).filter(
            Q(object_id=student.id) | Q(object_id__in=student_course_ids)
        ).order_by('-timestamp')

        serialized_logs = LogEntrySerializer(student_logs, many=True).data

        note_fields = ['id', 'note', 'create_at', 'last_update_datetime', 'create_by__first_name', 'create_by__role']
        student_notes = StudentNotes.objects.filter(student=student).values(*note_fields).order_by('-create_at')

        # ✅ Fetch all Status Notes
        status_notes_qs = StudentNotes.objects.filter(student=student).order_by('-create_at').values(
            'id', 'note', 'create_at', 'create_by__first_name','status_note'
        )

        batch_fields = [field.name for field in Batch._meta.fields]
        batch_extra_fields = ['course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time']

        # --- Attendance Summary ---
        attendance_summary = {
            "student_id": student.id,
            "name": student.name,
            "enrollment_no": student.enrollment_no,
            "batch_wise_summary": []
        }

        student_batches_qs = Batch.objects.filter(student=student, status__in=['Running', 'Completed']).order_by('-id')
        for batch in student_batches_qs:
            attendance_qs = Attendance.objects.filter(student=student, batch=batch).order_by('date')
            present_count = attendance_qs.filter(attendance='Present').count()
            absent_count = attendance_qs.filter(attendance='Absent').count()
            total_marked = attendance_qs.exclude(attendance='Not Marked').count()
            latest_attendance = attendance_qs.order_by('-date', '-id').first()

            batch_summary = {
                "batch_id": batch.id,
                "course_name": batch.course.name,
                "batch_status": batch.status,
                "present_count": present_count,
                "absent_count": absent_count,
                "total_attendance_marked": total_marked,
                "present_percent": f"{(present_count / total_marked * 100):.1f}%" if total_marked > 0 else "0%",
                "absent_percent": f"{(absent_count / total_marked * 100):.1f}%" if total_marked > 0 else "0%",
                "latest_status": latest_attendance.attendance if latest_attendance else "Not Marked",
                "latest_date": latest_attendance.date if latest_attendance else None,
                "attendance_history": [
                    {"date": att.date, "status": att.attendance}
                    for att in attendance_qs
                ]
            }

            attendance_summary["batch_wise_summary"].append(batch_summary)

        all_attendance_qs = Attendance.objects.filter(student=student).exclude(attendance='Not Marked')
        total_present = all_attendance_qs.filter(attendance='Present').count()
        total_absent = all_attendance_qs.filter(attendance='Absent').count()
        total_marked = all_attendance_qs.count()

        overall_attendance = {
            "total_present_count": total_present,
            "total_absent_count": total_absent,
            "total_attendance_marked": total_marked,
            "overall_present_percent": f"{(total_present / total_marked * 100):.1f}%" if total_marked > 0 else "0%",
            "overall_absent_percent": f"{(total_absent / total_marked * 100):.1f}%" if total_marked > 0 else "0%",
        }

        attendance_summary["overall_summary"] = overall_attendance

        latest_status_note = status_notes_qs.first()
        status_note_text = latest_status_note['status_note'] if latest_status_note else None

        response_data = {
            "All_in_One": {
                'student_count': Student.objects.count(),
                'student': StudentSerializer(student).data,
                'student_courses': student_course_list,
                'student_notes': student_notes,
                "status_note": status_note_text,
                'student_status_notes': list(status_notes_qs),   # ✅ Added
                'student_batch_upcoming': list(student_batches['Upcoming'].values(*batch_fields, *batch_extra_fields)),
                'student_batch_hold': list(student_batches['Hold'].values(*batch_fields, *batch_extra_fields)),
                'student_batch_ongoing': list(student_batches['Running'].values(*batch_fields, *batch_extra_fields)),
                'student_batch_completed': list(student_batches['Completed'].values(*batch_fields, *batch_extra_fields)),
                'all_upcoming_batch': list(filtered_upcoming_batches.values(*batch_fields, *batch_extra_fields)),
                'student_logs': serialized_logs,
                'attendance_summary': attendance_summary
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)

class StudentCourseEditAPIView(APIView):
    """API to edit an existing StudentCourse record."""
    authentication_classes = [JWTAuthFromCookie]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def patch(self, request, id, *args, **kwargs):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        """Allows partial updates (e.g., only updating status or certificate_date)."""
        student_course = get_object_or_404(StudentCourse, id=id)
        old_student_course_data = model_to_dict(student_course)  # Get old field values

        serializer = StudentCourseSerializer(student_course, data=request.data, partial=True)
        
        if serializer.is_valid():
            student_course = serializer.save()
            new_student_course_data = model_to_dict(student_course)  # Get new field values
            
            # ✅ Generate a unique correlation ID for logging
            cid = str(uuid.uuid4())  

            # ✅ Track what changed
            changes = {}
            for field, old_value in old_student_course_data.items():
                new_value = new_student_course_data.get(field)
                if old_value != new_value:  # Only log changes
                    changes[field] = {
                        "old": str(old_value) if old_value else "None",
                        "new": str(new_value) if new_value else "None"
                    }

            changes_text = []
            for field, change in changes.items():
                if change["old"] != "None" and change["new"] != "None":
                    changes_text.append(f"Updated {field} from {change['old']} to {change['new']}.")
                elif change["new"] != "None":
                    changes_text.append(f"Added {field}: {change['new']}.")
                elif change["old"] != "None":
                    changes_text.append(f"Removed {field}: {change['old']}.")

            # ✅ Log detailed update action
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(StudentCourse),
                cid=cid,
                object_pk=student_course.id,
                object_id=student_course.id,
                object_repr=f"Student ID: {student_course.student.enrollment_no} | Student: {student_course.student.name}",
                action=LogEntry.Action.UPDATE,
                changes=f"Updated StudentCourse: {student_course.id} by {request.user.username}. Changes: {changes}",
                serialized_data=json.dumps(model_to_dict(student_course), default=str),
                changes_text=" ".join(changes_text),
                additional_data="Student",
                actor=request.user,
                timestamp=now()
            )

            return Response({
                "message": "StudentCourse updated successfully", 
                "student_course_id": student_course.id,
                "changes": changes_text
            }, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



{

# @csrf_exempt
# @never_cache
# def email_open_tracker(request, id):
#     student_course = get_object_or_404(StudentCourse, id=id)

#     # Update a flag or timestamp to indicate the email was opened
#     student_course.email_opened = True
#     student_course.email_opened_at = now()
#     student_course.save(update_fields=['email_opened', 'email_opened_at'])

#     # 1x1 transparent GIF
#     pixel = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00' \
#             b'\xFF\xFF\xFF!\xF9\x04\x01\x00\x00\x00\x00,\x00' \
#             b'\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'

#     return HttpResponse(pixel, content_type='image/gif')
}



class GenerateCertificateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def patch(self, request, id, *args, **kwargs):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        student_course = get_object_or_404(StudentCourse, id=id)

        # Ensure course is marked as "Completed"
        if student_course.status != "Completed":
            return Response({'error': 'Certificate can only be generated for completed courses'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = StudentCourseSerializer(student_course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  # Save partial update first

            # Fetch necessary details
            student = student_course.student
            course = student_course.course
            certificate_no = student.enrollment_no
            certificate_date = student_course.certificate_date

            # Generate certificate
            file_path = generate_certificate(course.name, student.name, certificate_no, certificate_date)

            if os.path.exists(file_path):
                # ✅ Update student_certificate_allotment to True
                student_course.student_certificate_allotment = True
                student_course.certificate_issued_at = now() 
                student_course.save(update_fields=['student_certificate_allotment', 'certificate_issued_at'])

                # ✅ Log certificate generation
                LogEntry.objects.create(
                    content_type=ContentType.objects.get_for_model(StudentCourse),
                    cid=str(uuid.uuid4()),  # ✅ Generate unique correlation ID
                    object_pk=student_course.id,
                    object_id=student_course.id,
                    object_repr=f"Certificate Generated - Student: {student.name} | Course: {course.name}",
                    action=LogEntry.Action.CREATE,
                    changes=f"Generated Certificate for Student: {student.name}, Course: {course.name}, Certificate No: {certificate_no}",
                    actor=request.user,
                    serialized_data=json.dumps(model_to_dict(student_course), default=str),  # ✅ JSON serialized data
                    changes_text=f"Certificate generated for {student.name} in {course.name}.",
                    additional_data="Student",
                    timestamp=now()
                )


                # 📧 Send Email Notification

                subject = f"🎉 Congratulations, {student.name}! Your {course.name} Certificate is Here!"

                # pixel_url = f"http://192.168.1.18:8000/api/email-tracker/{student_course.id}/"  # ✅ Fixed the pixel URL

#                 html_message = f"""
#         <!DOCTYPE html>
#         <html>
#         <head>
#         <meta charset="UTF-8">
#         <title>Certificate Issued</title>
#         </head>
#         <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
#         <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
            
#             <!-- Header with Logo -->
#             <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
#             <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
#             </div>

#             <!-- Body -->
#             <div style="padding: 30px; color: #000;">
#             <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px;">🎓 Certificate of Achievement</h2>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 Dear <strong style="font-weight: bold;">{student.name}</strong>,
#             </p>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 Congratulations on successfully completing the <strong style="font-weight: bold;">{course}</strong> course at <strong>Craw Cyber Security</strong>! 🎉
#             </p>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 Your hard work and commitment have paid off, and we are excited to issue your official certificate.
#             </p>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 Share your achievement on LinkedIn and tag <strong>@Craw Cyber Security</strong> to inspire others! Don’t forget to use <strong>#crawsec</strong> and <strong>#lifeatcraw</strong> 🚀
#             </p>
            
#             <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
#                 <p style="font-size: 15px; margin: 6px 0;"><strong>🏷️ Enrollment Number:</strong> {student.enrollment_no}</p>
#                 <p style="font-size: 15px; margin: 6px 0;"><strong>📅 Date of Issue:</strong> {certificate_date}</p>
#                 <p style="font-size: 15px; margin: 6px 0;"><strong>📎 Certificate:</strong> Attached as PDF</p>
#                 <ifream src = "file_path" />
#             </div>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 Your certificate is attached to this email. Feel free to showcase it in your portfolio, LinkedIn profile, or wherever you wish to highlight your accomplishments.
#             </p>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 This is a great milestone in your cybersecurity journey, and we’re confident you’ll achieve even more in the future!
#             </p>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 🔐 Stay passionate, stay curious, and keep securing the digital world!
#             </p>

#             <p style="font-size: 16px; line-height: 1.6;">
#                 Warm regards,<br>
#                 <strong style="font-weight: bold;">Craw Cyber Security Team</strong> 🚀<br>
#                 📧 <a href="mailto:training@craw.in" style="text-decoration: underline;">training@craw.in</a><br>
#                 📞 +91 9513805401<br>
#                 🌐 <a href="https://www.craw.in/" style="text-decoration: underline;">www.craw.in</a>
#             </p>
#             </div>

#             <!-- Footer -->
#             <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
#             <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
#             <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
#             </div>
#         </div>
#         </body>
#         </html>

# """

#                 from_email = "CRAW SECURITY CERTIFICATE <training@craw.in>"
#                 try:
#                     email = EmailMessage(subject, html_message, from_email, [student.email])
#                     email.content_subtype = "html"  # ✅ Make it HTML email
#                     email.attach_file(file_path)
#                     email.send()
                # except Exception as e:
                #     return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # ✅ Fix: Open file WITHOUT closing it prematurely
                certificate_file = open(file_path, 'rb')
                return FileResponse(certificate_file, content_type='application/pdf')

            return Response({'error': 'Certificate generation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



{
# <!DOCTYPE html>
# <html>
# <head>
#     <meta charset="UTF-8">
#     <title>Certificate Issued</title>
# </head>
# <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
#     <p>Dear <strong>{student.name}</strong>,</p>

#     <p>We’re thrilled to congratulate you on successfully completing the <strong>{course.name}</strong> course at <strong>Craw Cyber Security</strong>!</p>

#     <p>Your dedication and hard work have paid off, and we are delighted to issue your official certificate.</p>

#     <p>
#         <strong>🏷️ Student Enrollment Number:</strong> {student.enrollment_no}<br>
#         <strong>📅 Date of Issue:</strong> {certificate_date}
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

#     <img src="{pixel_url}" width="1" height="1" alt="" style="display: none;" />
# </body>
# </html>
}



class DeleteStudentView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        student = get_object_or_404(Student, id=id)
        
        # ✅ Store student details before deleting
        student_data = {field.name: getattr(student, field.name, None) for field in Student._meta.fields}
        student_id = student.id
        student_enrollment_no = student.enrollment_no
        student_name = student.name

        # Attempt to get the associated user
        user = None
        if student.enrollment_no:
            user = User.objects.filter(username=student.enrollment_no).first()

        if user:
            # ✅ Delete associated token(s)
            Token.objects.filter(user=user).delete()
            # ✅ Delete the user account linked to the student
            user.delete()

        # ✅ Delete the student record
        student.delete()

        # ✅ Log deletion
        changes_text = [f"Deleted field {field}: {value}" for field, value in student_data.items()]

        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Student),
            cid=str(uuid.uuid4()),  # ✅ Generate unique correlation ID
            object_pk=student_id,
            object_id=student_id,
            object_repr=f"Student ID: {student_enrollment_no} | Name: {student_name}",
            action=LogEntry.Action.DELETE,
            changes=f"Deleted Student: {student_data} by {request.user.username}",
            actor=request.user,
            serialized_data=json.dumps(student_data, default=str),  # ✅ JSON serialized student data
            changes_text=" ".join(changes_text),
            additional_data="Student",
            timestamp=now()
        )

        return Response(
            {'detail': 'Student, associated user, and authentication token deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )



class DownloadCertificateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id, *args, **kwargs):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch the student course
        student_course = get_object_or_404(StudentCourse, id=id)

        # Ensure the certificate was allotted
        if not student_course.student_certificate_allotment:
            return Response({'error': 'Certificate not generated yet'}, status=status.HTTP_404_NOT_FOUND)

        # Get the file path of the certificate
        file_path = get_certificate_path(student_course.course.name, student_course.student.name, student_course.student.enrollment_no)

        # Ensure the file exists
        if os.path.exists(file_path):
            # ✅ Log certificate download action
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(StudentCourse),
                cid=str(uuid.uuid4()),
                object_pk=student_course.id,
                object_id=student_course.id,
                object_repr=f"Student: {student_course.student.name} | Course: {student_course.course.name}",
                action=LogEntry.Action.UPDATE,
                changes=f"Downloaded certificate for {student_course.student.name} ({student_course.student.enrollment_no}) in {student_course.course.name}",
                actor=request.user,
                serialized_data=json.dumps({
                    "student_name": student_course.student.name,
                    "enrollment_no": student_course.student.enrollment_no,
                    "course": student_course.course.name,
                    "certificate_allotted": student_course.student_certificate_allotment
                }, default=str),
                changes_text=f"Certificate downloaded for {student_course.student.name}",
                additional_data="Student",
                timestamp=now()
            )

            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')

        return Response({'error': 'Certificate file not found'}, status=status.HTTP_404_NOT_FOUND)
    


class StudentLogListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error':'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get content types for the related models
        student_ct = ContentType.objects.get_for_model(Student)
        course_ct = ContentType.objects.get_for_model(StudentCourse)
        notes_ct = ContentType.objects.get_for_model(StudentNotes)

        # Filter logs related to those models
        logs = LogEntry.objects.filter(content_type__in=[student_ct, course_ct, notes_ct]).order_by('-timestamp')
        serializer = LogEntrySerializer(logs, many=True)
        return Response(serializer.data)



{

# # Book Alloted With Sending Email to Student....
# class StudentBookAllotmentAPIView(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         student_course = get_object_or_404(StudentCourse, id=id)
#         old_data = model_to_dict(student_course)

#         serializer = StudentBookAllotmentSerializer(
#             instance=student_course,
#             data=request.data,
#             partial=True,
#             context={'student_course': student_course, 'request': request}
#         )

#         if serializer.is_valid():
#             result = serializer.save()
#             new_data = model_to_dict(student_course)

#             # Track field changes
#             changes = {}
#             changes_text = []
#             for field, old_value in old_data.items():
#                 new_value = new_data.get(field)
#                 if old_value != new_value:
#                     changes[field] = {'from': old_value, 'to': new_value}
#                     changes_text.append(f"{field} changed from '{old_value}' to '{new_value}'")

#             # Determine action and book details
#             book_flag = request.data.get("Book")
#             if book_flag:
#                 # Allotment action
#                 book_names = [book.name for book in result.book.all()] if hasattr(result, "book") else []
#                 action_description = f"Allotted books: {', '.join(book_names)}"

#                 # Send Email to Student
#                 student = student_course.student
# #                 subject = f"🎉 Congratulations, {student.name}! You've been allotted books for {student_course.course.name}"
# #                 html_message = f"""
# #                 <!DOCTYPE html>
# # <html>
# # <head>
# #     <meta charset="UTF-8">
# #     <title>Book Issued Email</title>
# # </head>
# # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
# #     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd;">
# #         <tr>
# #             <td style="padding: 30px; text-align: center;">
# #                 <!-- Optional logo -->
# #                 <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 80px; margin-bottom: 20px;" />
# #                 <h2 style="color: #007bff;">Thank you for visiting Admin Desk</h2>
# #             </td>
# #         </tr>
# #         <tr>
# #             <td style="padding: 0 30px 30px 30px;">
# #                 <p>Hello {student.name},</p>
# #                 <p>
# #                     <strong>Books Issued Till Today:</strong>
# #                     {''.join([f"<li>{name}</li>" for name in book_names])}
# #                 </p>
# #                 <p>
# #                     Join Our WhatsApp Channel for Updates:
# #                     <a href="https://www.whatsapp.com/channel/0029VaE4JsD29757yPAY9z32" target="_blank">
# #                         https://www.whatsapp.com/channel/0029VaE4JsD29757yPAY9z32
# #                     </a>
# #                 </p>
# #                 <p style="margin-top: 40px;">Best regards,<br>
# #                 <strong>Craw Cyber Security Pvt Ltd</strong></p>
# #             </td>
# #         </tr>
# #         <tr>
# #             <td style="padding: 20px; text-align: center; background-color: #f1f1f1; font-size: 12px; color: #888888;">
# #                 Copyright © 2024 Craw Security. All Rights Reserved.
# #             </td>
# #         </tr>
# #     </table>
# # </body>
# # </html>
# #                 """

                
#                 # <!DOCTYPE html>
#                 # <html>
#                 # <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
#                 #     <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
#                 #         <h2 style="color: #2c3e50;">Book Allotment Notification</h2>
#                 #         <p>Dear <strong>{student.name}</strong>,</p>
#                 #         <p>You have been successfully allotted the following book(s):</p>
#                 #         <ul>
#                 #             {''.join([f"<li>{name}</li>" for name in book_names])}
#                 #         </ul>
#                 #         <p>Please collect them at your earliest convenience.</p>
#                 #         <br>
#                 #         <p>Best regards,<br><strong>CRAW Security Library Team</strong></p>
#                 #     </div>
#                 # </body>
#                 # </html>

#                 # from_email = "CRAW SECURITY BOOK <training@craw.in>"
#                 # try:
#                 #     email = EmailMessage(subject, html_message, from_email, [student.email])
#                 #     email.content_subtype = "html"  # Enable HTML content
#                 #     email.send()
#                 # except Exception as e:
#                 #     return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             else:
#                 # Removal action
#                 removed_books = result.get("removed_books", []) if isinstance(result, dict) else []
#                 if removed_books:
#                     action_description = f"Removed books: {', '.join(removed_books)}"
#                 else:
#                     action_description = "No books found to remove."

#             # Final log message
#             full_changes_text = f"{action_description}. {' '.join(changes_text)}"

#             # Log entry
#             LogEntry.objects.create(
#                 content_type=ContentType.objects.get_for_model(StudentCourse),
#                 cid=str(uuid.uuid4()),
#                 object_pk=student_course.id,
#                 object_id=student_course.id,
#                 object_repr=f"Student ID: {student.enrollment_no} | Student: {student.name}",
#                 action=LogEntry.Action.UPDATE,
#                 changes=json.dumps(changes, default=str),
#                 serialized_data=json.dumps(new_data, default=str),
#                 changes_text=full_changes_text,
#                 additional_data="Student Book Allotment",
#                 actor=request.user,
#                 timestamp=now()
#             )

#             return Response({'message': action_description}, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
}


# This Help in when old Book Allotment...
class StudentOldBookAllotmentAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        student_course = get_object_or_404(StudentCourse, id=id)
        old_book_status = request.data.get('old_status')

        if old_book_status is None:
            return Response({'error': 'Missing "old_status" in request'}, status=status.HTTP_400_BAD_REQUEST)

        student_course.student_old_book_allotment = bool(old_book_status)
        student_course.save()

        return Response({
            'message': "Old Book Allotment status updated",
            'status': student_course.student_old_book_allotment
        }, status=status.HTTP_200_OK)



class StudentBookAllotmentAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        student_course = get_object_or_404(StudentCourse, id=id)
        old_data = model_to_dict(student_course)

        serializer = StudentBookAllotmentSerializer(
            data=request.data,
            context={
                'request': request,
                'student_course': student_course,
                'old_book_status': student_course.student_old_book_allotment  # ✅ move this here
            }
        )

        if serializer.is_valid():
            result = serializer.save()
            new_data = model_to_dict(student_course)

            changes = {}
            changes_text = []
            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if old_value != new_value:
                    changes[field] = {'from': old_value, 'to': new_value}
                    changes_text.append(f"{field} changed from '{old_value}' to '{new_value}'")

            student = student_course.student
            book_flag = request.data.get("Book")

            if book_flag:
                book_names = [book.name for book in result.book.all()] if hasattr(result, "book") else []
                action_description = f"Allotted books: {', '.join(book_names)}"

                # ✅ Only send email if it's NOT an old allotment
                if student_course.student_old_book_allotment is False:
                    subject = f"🎉 Congratulations, {student.name}! You've been allotted books for {student_course.course.name}"
                    html_message = f"""
                    <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>Book Issued Email</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <!-- Optional logo -->
                                        <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 80px; margin-bottom: 20px;" />
                                        <h2 style="color: #007bff;">Thank you for visiting Admin Desk</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 30px 30px 30px;">
                                        <p>Hello {student.name},</p>
                                        <p>
                                            <strong>Books Issued Till Today:</strong>
                                            {''.join([f"<li>{name}</li>" for name in book_names])}
                                        </p>
                                        <p>
                                            Join Our WhatsApp Channel for Updates:
                                            <a href="https://www.whatsapp.com/channel/0029VaE4JsD29757yPAY9z32" target="_blank">
                                                https://www.whatsapp.com/channel/0029VaE4JsD29757yPAY9z32
                                            </a>
                                        </p>
                                        <p style="margin-top: 40px;">Best regards,<br>
                                        <strong>Craw Cyber Security Pvt Ltd</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px; text-align: center; background-color: #f1f1f1; font-size: 12px; color: #888888;">
                                        Copyright © 2024 Craw Security. All Rights Reserved.
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                    """

                    
                    # <!DOCTYPE html>
                    # <html>
                    # <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                    #     <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
                    #         <h2 style="color: #2c3e50;">Book Allotment Notification</h2>
                    #         <p>Dear <strong>{student.name}</strong>,</p>
                    #         <p>You have been successfully allotted the following book(s):</p>
                    #         <ul>
                    #             {''.join([f"<li>{name}</li>" for name in book_names])}
                    #         </ul>
                    #         <p>Please collect them at your earliest convenience.</p>
                    #         <br>
                    #         <p>Best regards,<br><strong>CRAW Security Library Team</strong></p>
                    #     </div>
                    # </body>
                    # </html>

                    from_email = "CRAW SECURITY BOOK <training@craw.in>"
                    try:
                        email = EmailMessage(subject, html_message, from_email, [student.email])
                        email.content_subtype = "html"
                        email.send()
                    except Exception as e:
                        return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                removed_books = result.get("removed_books", []) if isinstance(result, dict) else []
                action_description = f"Removed books: {', '.join(removed_books)}" if removed_books else "No books found to remove."

            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(StudentCourse),
                cid=str(uuid.uuid4()),
                object_pk=student_course.id,
                object_id=student_course.id,
                object_repr=f"Student ID: {student.enrollment_no} | Student: {student.name}",
                action=LogEntry.Action.UPDATE,
                changes=json.dumps(changes, default=str),
                serialized_data=json.dumps(new_data, default=str),
                changes_text=f"{action_description}. {' '.join(changes_text)}",
                additional_data="Student Book Allotment",
                actor=request.user,
                timestamp=now()
            )

            return Response({'message': action_description}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



{
# class StudentAttendanceEdit(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
#         mark = request.data.get('mark')
        
#         try:
#             student_attendance = Attendance.objects.get(id=id)
            
#             if mark is True:
#                 student_attendance.attendance = 'Present'

#                 # Fatching student info
#                 student = Student.objects.filter(id=student_attendance.student).first()

#                 student_email = student.email
#                 student_name = student.name
#                 student_enrollment_no = student.enrollment_no
#                 batch_name = student_attendance.batch__batch_id

#                 # Send Email to Student For Attendance.....
#                 subject = f"Batch Attendance of {student_attendance.course}"
#                 html_message = f"""
# <!DOCTYPE html>
# """ 
#                 from_email = "CRAW SECURITY BATCH <training@craw.in>"
#                 try:
#                     email = EmailMessage(subject, html_message, from_email, [student_email])
#                     email.content_subtype = "html"
#                     email.send()
#                 except Exception as e:
#                     print(f"Failed to send removal email to {student_email} : {str(e)}")
                

#             else:
#                 student_attendance.attendance = 'Absent'

#                 subject = f"Batch Attendance of {student_attendance.course}"
#                 html_message = f"""
# <!DOCTYPE html>
# """
#                 from_email = "CRAW SECURITY BATCH <training@craw.in>"
#                 try:
#                     email = EmailMessage(subject, html_message, from_email, [student_email])
#                     email.content_subtype = "html"
#                     email.send()
#                 except Exception as e:
#                     print(f"Failed to send email to {student_email} : {str(e)}")
#             student_attendance.save()

#             return Response({
#                 'success': f"Attendance updated to {student_attendance.attendance}."
#             }, status=status.HTTP_200_OK)

#         except Attendance.DoesNotExist:
#             return Response({'error': 'Attendance record not found.'}, status=status.HTTP_404_NOT_FOUND)
        
}

{


# Student Attendance and email send to student.....
# class StudentAttendanceEdit(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         mark = request.data.get('mark', False)

#         try:
#             student_attendance = Attendance.objects.get(id=id)

#             student = Student.objects.filter(id=student_attendance.student_id).first()
#             if not student:
#                 return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

#             batch = student_attendance.batch
#             trainer_name = batch.trainer.name if batch and batch.trainer else "N/A"
#             start_time = batch.batch_time.start_time.strftime("%I:%M %p") if batch and batch.batch_time.start_time else "N/A"
#             end_time = batch.batch_time.end_time.strftime("%I:%M %p") if batch and batch.batch_time.end_time else "N/A"

#             student_email = student.email
#             student_name = student.name
#             course_name = student_attendance.course if student_attendance.course else "Course"
#             batch_id = batch.batch_id if batch else "N/A"
#             date_str = timezone.now().strftime('%d %B %Y')

#             if mark is True:
#                 student_attendance.attendance = 'Present'
#                 status_text = "marked as <strong style='color: green;'>Present</strong>"
#             else:
#                 student_attendance.attendance = 'Absent'
#                 status_text = "marked as <strong style='color: red;'>Absent</strong>"

#             # Build the email message
#             subject = f"Attendance Update for {course_name} on {date_str}"
#             html_message = f"""
#             <!DOCTYPE html>
#             <html>
#             <head>
#                 <meta charset="UTF-8">
#                 <title>Attendance Update</title>
#             </head>
#             <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
#                 <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
#                     <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
#                         <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
#                     </div>
#                     <div style="padding: 30px; color: #000;">
#                         <h2 style="text-align: center; color: #000; font-size: 24px; margin-bottom: 20px;">📋 Attendance Notification</h2>
#                         <p style="font-size: 16px; line-height: 1.6; color: #000;">Dear <strong>{escape(student_name)}</strong>,</p>
#                         <p style="font-size: 16px; line-height: 1.6; color: #000;">Your attendance for today's session of <strong>{escape(str(course_name))}</strong> (Batch ID: {batch_id}) has been {status_text}.</p>
#                         <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
#                             <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>📘 Batch ID:</strong> {batch_id}</p>
#                             <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>🕒 Timing:</strong> {start_time} - {end_time}</p>
#                             <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>👨‍🏫 Trainer:</strong> {trainer_name}</p>
#                             <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>📅 Date:</strong> {date_str}</p>
#                         </div>
#                         <p style="font-size: 16px; line-height: 1.6; color: #000;">If this information is incorrect, please contact your coordinator.</p>
#                         <p style="font-size: 15px; margin-top: 30px; line-height: 1.6; color: #000;">
#                             📍 <strong>Our Address:</strong><br>
#                             1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
#                             Behind Saket Metro Station, New Delhi 110030
#                         </p>
#                         <p style="font-size: 15px; line-height: 1.6; color: #000;">
#                             📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
#                             📧 <strong>Email:</strong> training@craw.in<br>
#                             🌐 <strong>Website:</strong> 
#                             <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
#                         </p>
#                         <p style="font-size: 16px; line-height: 1.6; color: #000;">
#                             Regards,<br>
#                             <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
#                         </p>
#                     </div>
#                     <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; border-top: 1px solid #ddd; color: #000;">
#                         <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
#                         <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
#                     </div>
#                 </div>
#             </body>
#             </html>

#             """

#             try:
#                 email = EmailMessage(subject, html_message, "CRAW SECURITY BATCH <training@craw.in>", [student_email])
#                 email.content_subtype = "html"
#                 email.send()
#             except Exception as e:
#                 print(f"Failed to send attendance email to {student_email}: {str(e)}")

#             student_attendance.save()

#             return Response({
#                 'success': f"Attendance updated to {student_attendance.attendance}."
#             }, status=status.HTTP_200_OK)

#         except Attendance.DoesNotExist:
#             return Response({'error': 'Attendance record not found.'}, status=status.HTTP_404_NOT_FOUND)

}

class StudentAttendanceEdit(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        mark = request.data.get('mark', False)

        try:
            student_attendance = Attendance.objects.get(id=id)

            student = Student.objects.filter(id=student_attendance.student_id).first()
            if not student:
                return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

            batch = student_attendance.batch
            trainer_name = batch.trainer.name if batch and batch.trainer else "N/A"
            start_time = batch.batch_time.start_time.strftime("%I:%M %p") if batch and batch.batch_time.start_time else "N/A"
            end_time = batch.batch_time.end_time.strftime("%I:%M %p") if batch and batch.batch_time.end_time else "N/A"

            student_email = student.email
            student_name = student.name
            course_name = student_attendance.course if student_attendance.course else "Course"
            batch_id = batch.batch_id if batch else "N/A"
            date_str = timezone.now().strftime('%d %B %Y')

            if mark is True:
                student_attendance.attendance = 'Present'
                status_text = "marked as <strong style='color: green;'>Present</strong>"
            else:
                student_attendance.attendance = 'Absent'
                status_text = "marked as <strong style='color: red;'>Absent</strong>"

            # # Build the email message
            # subject = f"Attendance Update for {course_name} on {date_str}"
            # html_message = f"""
            # <!DOCTYPE html>
            # <html>
            # <head>
            #     <meta charset="UTF-8">
            #     <title>Attendance Update</title>
            # </head>
            # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
            #     <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
            #         <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
            #             <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
            #         </div>
            #         <div style="padding: 30px; color: #000;">
            #             <h2 style="text-align: center; color: #000; font-size: 24px; margin-bottom: 20px;">📋 Attendance Notification</h2>
            #             <p style="font-size: 16px; line-height: 1.6; color: #000;">Dear <strong>{escape(student_name)}</strong>,</p>
            #             <p style="font-size: 16px; line-height: 1.6; color: #000;">Your attendance for today's session of <strong>{escape(str(course_name))}</strong> (Batch ID: {batch_id}) has been {status_text}.</p>
            #             <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
            #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>📘 Batch ID:</strong> {batch_id}</p>
            #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>🕒 Timing:</strong> {start_time} - {end_time}</p>
            #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>👨‍🏫 Trainer:</strong> {trainer_name}</p>
            #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>📅 Date:</strong> {date_str}</p>
            #             </div>
            #             <p style="font-size: 16px; line-height: 1.6; color: #000;">If this information is incorrect, please contact your coordinator.</p>
            #             <p style="font-size: 15px; margin-top: 30px; line-height: 1.6; color: #000;">
            #                 📍 <strong>Our Address:</strong><br>
            #                 1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
            #                 Behind Saket Metro Station, New Delhi 110030
            #             </p>
            #             <p style="font-size: 15px; line-height: 1.6; color: #000;">
            #                 📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
            #                 📧 <strong>Email:</strong> training@craw.in<br>
            #                 🌐 <strong>Website:</strong> 
            #                 <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
            #             </p>
            #             <p style="font-size: 16px; line-height: 1.6; color: #000;">
            #                 Regards,<br>
            #                 <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
            #             </p>
            #         </div>
            #         <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; border-top: 1px solid #ddd; color: #000;">
            #             <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
            #             <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
            #         </div>
            #     </div>
            # </body>
            # </html>

            # """

            # try:
            #     email = EmailMessage(subject, html_message, "CRAW SECURITY BATCH <training@craw.in>", [student_email])
            #     email.content_subtype = "html"
            #     email.send()
            # except Exception as e:
            #     print(f"Failed to send attendance email to {student_email}: {str(e)}")

            student_attendance.save()

            return Response({
                'success': f"Attendance updated to {student_attendance.attendance}."
            }, status=status.HTTP_200_OK)

        except Attendance.DoesNotExist:
            return Response({'error': 'Attendance record not found.'}, status=status.HTTP_404_NOT_FOUND)


# Student Marks Update with Sending Email...
class StudentMarksUpdateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        marks = request.data.get('marks')
        exam_date = request.data.get('exam_date')

        if marks is None or exam_date is None:
            return Response({'error': 'Marks and exam_date fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            marks = int(marks)
        except ValueError:
            return Response({'error': 'Marks must be a number.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            exam_date = datetime.strptime(exam_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        student_course = StudentCourse.objects.filter(id=id).select_related('student', 'course').first()
        print(student_course.student.name)


        if not student_course:
            return Response({'error': 'StudentCourse not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            if student_course and marks is not None:
                student_course.marks = marks
                student_course.marks_update_date = date.today()
                student_course.student_exam_date = exam_date  # Update exam date
                student_course.save()
                
        except Exception as e:
            print(f"Error updating marks: {e}")


        student = student_course.student
        course_name = student_course.course.name
        student_email = student.email
        student_name = student.name

        from_email = "CRAW SECURITY BATCH <training@craw.in>"

        if marks/50*100 <= 50:
            subject = "Exam Result Notification"
            html_message = f"""<html>
            <head>
            <meta charset="UTF-8">
            <title>Exam Result Notification</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; color: #000;">
                <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                    <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
                </div>
                <div style="padding: 30px; font-size: 16px; color: #000;">
                    <h2 style="text-align: center; font-size: 22px; color: #000;">📢 Exam Result Notification</h2>
                    <p style="color: #000;">Dear <strong>{student_name}</strong>,</p>
                    <p style="color: #000;">You did not pass the <strong>{course_name}</strong> exam held on <strong>{exam_date}</strong>.</p>
                    <p style="color: #000;">You scored <strong>{marks/50*100} % </strong> marks. Please prepare and try again because our pass marks percentage needs to be above 55%.</p>
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
                <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
                    <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
                    <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
                </div>
            </div>
            </body>
            </html>"""
        else:
            subject = "🎉 Congratulations on Passing the Exam!"
            html_message = f"""<html>
            <head>
            <meta charset="UTF-8">
            <title>Exam Success</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; color: #000;">
                <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                    <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
                </div>
                <div style="padding: 30px; font-size: 16px; color: #000;">
                    <h2 style="text-align: center; font-size: 22px; color: #000;">🎉 Congratulations!</h2>
                    <p style="color: #000;">Dear <strong>{student_name}</strong>,</p>
                    <p style="color: #000;">Congratulations on passing your <strong>{course_name}</strong> exam held on <strong>{exam_date}</strong>!</p>
                    <p style="color: #000;">You scored <strong>{marks/50*100} %</strong> marks. Keep it up the great work!</p>
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
                <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
                    <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
                    <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
                </div>
            </div>
            </body>
            </html>"""

        try:
            email = EmailMessage(subject, html_message, from_email, [student_email])
            email.content_subtype = "html"
            email.send()
        except Exception as e:
            print(f"Failed to send email to {student_email}: {e}")

        return Response({'message': 'Marks updated and email sent successfully.'}, status=status.HTTP_200_OK)


{

# This is for Creating Student Note...
# class StudentNotesCreateAPIViews(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'User is Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

#         student_id = request.data.get('student_id')
#         note_text = request.data.get('note')

#         if not student_id or not note_text:
#             return Response({'error': 'Missing student_id or note'}, status=status.HTTP_400_BAD_REQUEST)

#         student = Student.objects.filter(id=student_id).first()
#         if not student:
#             return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#         serializer = StudentNoteSerializer(data={'note': note_text, 'student': student_id})
#         if serializer.is_valid():
#             serializer.save(student=student, create_by=request.user)
#             return Response({
#                 "message": "Note created successfully"
#             }, status=status.HTTP_201_CREATED)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
}

class StudentNotesCreateAPIViews(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'User is Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        student_id = request.data.get('student_id')
        note_text = request.data.get('note')
        status_note = request.data.get('status_note')  # ✅ Get status_note from request

        if not student_id:
            return Response({'error': 'Missing student_id'}, status=status.HTTP_400_BAD_REQUEST)

        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentNoteSerializer(data={
            'note': note_text,
            'status_note': status_note,
            'student': student_id
        })

        if serializer.is_valid():
            serializer.save(student=student, create_by=request.user)
            return Response({"message": "Note created successfully"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                  



# This is for Editing Student Note...
class StudentNotesEditAPIViews(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'User is Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            note = StudentNotes.objects.get(id=id)
        except StudentNotes.DoesNotExist:
            return Response({'detail': 'Note ID is not valid'}, status=status.HTTP_404_NOT_FOUND)

        old_data = model_to_dict(note)
        serializer = StudentNoteSerializer(note, data=request.data, partial=True)

        if serializer.is_valid():
            note = serializer.save()  # Save updated fields from serializer

            # ✅ Set updated_by field manually (if you add this field to the model)
            note.updated_by = request.user
            note.save()  # Save updated_by and update the timestamp (if overridden in save())

            new_data = model_to_dict(note)

            cid = str(uuid.uuid4())

            changes = {}
            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if old_value != new_value:
                    changes[field] = {"old": str(old_value), "new": str(new_value)}

                changes_text = [f"Updated {field} from {change['old']} to {change['new']}" for field, change in changes.items()]

                LogEntry.objects.create(
                    content_type=ContentType.objects.get_for_model(note),
                    cid=cid,
                    object_pk=note.id,
                    object_id=note.id,
                    object_repr=f"Coordinator ID: {getattr(note, 'coordinator_id', 'N/A')} | Note ID: {note.id}",
                    action=LogEntry.Action.UPDATE,
                    changes=f"Updated student name: {getattr(note.student, 'name', 'Unknown')} by {getattr(request.user, 'name', 'Unknown')}. Changes: {changes}",
                    serialized_data=json.dumps(new_data, default=str),
                    changes_text=" ".join(changes_text),
                    additional_data="Coordinator",
                    actor=request.user,
                    timestamp=now()
                )

                return Response({"message": "Coordinator updated successfully", "note_id": note.id}, status=status.HTTP_200_OK)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



class TagsListAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ['admin', 'coordinator']:
            return Response( {"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        tags = Tags.objects.all().order_by('tag_name')
        serializer = TagsSerializer(tags, many=True)

        return Response({
            "message": "Tags retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)



class TagsCreateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role not in ['admin', 'coordinator']:
            return Response({"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        serializer = TagsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=user, updated_by=user) 
            return Response({"message": "Tag created successfully"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class TagsUpdateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        user = request.user

        if user.role not in ['admin', 'coordinator']:
            return Response({"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            tag = Tags.objects.get(id=id)
        except Tags.DoesNotExist:
            return Response({"message": "Tag not found"}, status=status.HTTP_404_NOT_FOUND)

        # Ensure the tag is not already assigned to any student
        serializer = TagsSerializer(tag, data=request.data, partial=True, context={"request": request})
        
        if serializer.is_valid():
            serializer.save(updated_by=user)  
            return Response({"message": "Tag updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    


class TagsDeleteAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        user = request.user

        if user.role not in ['admin', 'coordinator']:
            return Response({"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tag = Tags.objects.get(id=id)
        except Tags.DoesNotExist:
            return Response({"message": "Tag not found"}, status=status.HTTP_404_NOT_FOUND)
        
        tag.delete()

        return Response({"message": "Tag deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    



class AssignTagsToStudentAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """Return both assigned and unassigned tags for a student"""
        if request.user.role not in ['admin', 'coordinator']:
            return Response({"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        student = get_object_or_404(Student, id=id)

        # ✅ Assigned tags
        assigned_mappings = StudentTags.objects.filter(student=student).select_related('tag')
        assigned_tags = [
            {
                "id": mapping.tag.id,
                "tag_name": mapping.tag.tag_name,
                "tag_color": mapping.tag.tag_color,
                "created_at": mapping.created_at,
                "updated_at": mapping.updated_at,
            }
            for mapping in assigned_mappings
        ]

        # ✅ Unassigned tags
        assigned_tag_ids = [mapping.tag.id for mapping in assigned_mappings]
        unassigned_tags = Tags.objects.exclude(id__in=assigned_tag_ids)
        unassigned_tags_data = [
            {
                "id": tag.id,
                "tag_name": tag.tag_name,
                "tag_color": tag.tag_color
            }
            for tag in unassigned_tags
        ]

        return Response({
            "assigned_tags": assigned_tags,
            "unassigned_tags": unassigned_tags_data
        }, status=status.HTTP_200_OK)

    def post(self, request, id):
        tag_ids = request.data.get("tag_ids", [])
        action = request.data.get("action", "assign").lower()

        if request.user.role not in ['admin', 'coordinator']:
            return Response({"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        if not isinstance(tag_ids, list):
            return Response({
                "message": "Both student_id and tag_ids (as a list) are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        student = get_object_or_404(Student, id=id)

        tags = Tags.objects.filter(id__in=tag_ids)

        if not tags.exists():
            return Response({
                "message": "No valid tags found for the provided tag_ids.",
                "provided_ids": tag_ids
            }, status=status.HTTP_400_BAD_REQUEST)

        assigned_tags = []
        unassigned_tags = []
        not_assigned = []
        tag_messages = []

        for tag in tags:
            if action == "assign":
                mapping, created = StudentTags.objects.get_or_create(student=student, tag=tag)
                if created:
                    assigned_tags.append(tag.tag_name)
                    tag_messages.append(f"Tag '{tag.tag_name}' assigned successfully.")
                    print(f"Tag '{tag.tag_name}' assigned to student '{student.name}' at {mapping.created_at} and updated at {mapping.updated_at}.")
                else:
                    tag_messages.append(f"Tag '{tag.tag_name}' is already assigned.")

            elif action == "unassign":
                deleted, _ = StudentTags.objects.filter(student=student, tag=tag).delete()
                if deleted:
                    unassigned_tags.append(tag.tag_name)
                    tag_messages.append(f"Tag '{tag.tag_name}' unassigned successfully.")
                else:
                    not_assigned.append(tag.tag_name)
                    tag_messages.append(f"Tag '{tag.tag_name}' was not assigned, so cannot unassign.")
                    
            else:
                return Response({
                    "message": "Invalid action. Use 'assign' or 'unassign'."
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": f"Tags {action}ed for student '{student.name}'",
            "assigned_tags": assigned_tags,
            "unassigned_tags": unassigned_tags,
            "not_assigned_tags": not_assigned,
            "tag_messages": tag_messages
        }, status=status.HTTP_200_OK)


