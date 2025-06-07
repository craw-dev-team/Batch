import uuid
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Course, Book
from .serializer import CourseSerializer, BookSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from Student.models import StudentCourse, Student,BookAllotment
from Student.serializer import StudentSerializer
from nexus.serializer import BatchCreateSerializer
from nexus.models import Batch
from django.db.models import Prefetch
from rest_framework_simplejwt.authentication import JWTAuthentication
from collections import defaultdict
from django.utils.timezone import make_aware, datetime
from datetime import timedelta

class CourseListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseCreateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save()  # Save the course and store it

            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Course),
                cid=str(uuid.uuid4()),  # Generate unique ID
                object_pk=course.id,
                object_id=course.id,
                object_repr=f"Course: {course.name}",  # Assuming `name` field exists
                action=LogEntry.Action.CREATE,
                changes=f"Created course: {course.name} by {request.user.username}",
                serialized_data=json.dumps(CourseSerializer(course).data, default=str),
                changes_text=f"Course '{course.name}' created by {request.user.username}.",
                additional_data="Course",
                actor=request.user,
                timestamp=now()
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseEditAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        try:
            course = Course.objects.get(id=id)
        except Course.DoesNotExist:
            return Response({'detail': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            updated_course = serializer.save(last_update_user=request.user)

            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Course),
                cid=str(uuid.uuid4()),  # Generate unique ID
                object_pk=updated_course.id,
                object_id=updated_course.id,
                object_repr=f"Course: {updated_course.name}",
                action=LogEntry.Action.UPDATE,  # Corrected from CREATE to UPDATE
                changes=f"Updated course: {updated_course.name} by {request.user.username}",
                serialized_data=json.dumps(CourseSerializer(updated_course).data, default=str),
                changes_text=f"Course '{updated_course.name}' updated by {request.user.username}.",
                additional_data="Course",
                actor=request.user,
                timestamp=now()
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CourseDeleteAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            course = Course.objects.get(id=id)
        except Course.DoesNotExist:
            return Response({'detail': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        # Log the delete action before deleting the course
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Course),
            cid=str(uuid.uuid4()),  # Generate unique ID
            object_pk=course.id,
            object_id=course.id,
            object_repr=f"Course: {course.name}",
            action=LogEntry.Action.DELETE,  # Correct action type
            changes=f"Deleted course: {course.name} by {request.user.username}",
            serialized_data=json.dumps(CourseSerializer(course).data, default=str),
            changes_text=f"Course '{course.name}' deleted by {request.user.username}.",
            additional_data="Course",
            actor=request.user,
            timestamp=now()
        )

        course.delete()
        return Response({'detail': 'Course deleted successfully'}, status=status.HTTP_204_NO_CONTENT)




class CourseinfoAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        # Step 1: Get the course
        course = get_object_or_404(Course, id=id)

        # Step 2: Get student IDs and prefetch full student data efficiently
        student_ids = StudentCourse.objects.filter(course=course).values_list('student_id', flat=True).distinct()
        students = Student.objects.filter(id__in=student_ids).select_related(
            'support_coordinator', 'course_counsellor', 'location'
        ).prefetch_related(
            'courses', 'notes', 'studentcourse_set'
        )

        Student_take_by = StudentSerializer(students, many=True).data

        # Step 3: Fetch related batch data efficiently
        batches = Batch.objects.filter(course=course).select_related(
            'course', 'trainer', 'batch_time', 'location', 'batch_coordinator'
        ).prefetch_related(
            Prefetch('student', queryset=Student.objects.only('id', 'name'))
        )

        Batch_take_by = []
        for batch in batches:
            Batch_take_by.append({
                "id": batch.id,
                "batch_id": batch.batch_id,
                "course": batch.course.name,
                "trainer": batch.trainer.name if batch.trainer else None,
                "mode": batch.mode,
                "status": batch.status,
                "start_date": batch.start_date,
                "end_date": batch.end_date,
                "preferred_week": batch.preferred_week,
                "batch_time": str(batch.batch_time) if batch.batch_time else None,
                "language": str(batch.language) if batch.language else None,
                "location": str(batch.location) if batch.location else None,
                "batch_coordinator": str(batch.batch_coordinator) if batch.batch_coordinator else None,
                "students": [
                    {"id": student.id, "name": student.name} for student in batch.student.all()
                ]
            })

        # Step 4: Final Response
        course_info = {
            'course': CourseSerializer(course).data,
            'Student_take_by': Student_take_by,
            'Batch_take_by': Batch_take_by
        }

        return Response({'course_info': course_info})




class CourseTakebyEdit(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, course_id):
        new_course_id = request.data.get("course")
        if not new_course_id:
            return Response({"error": "New course ID not provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_course = Course.objects.get(id=new_course_id)
        except Course.DoesNotExist:
            return Response({"error": "New course not found."}, status=status.HTTP_404_NOT_FOUND)

        student_courses = StudentCourse.objects.filter(course_id=course_id)
        updated_instances = []
        skipped_instances = []

        for sc in student_courses:
            # Check for existing (student, new_course) pair
            if StudentCourse.objects.filter(student=sc.student, course=new_course).exists():
                skipped_instances.append(sc.id)
                continue

            sc.course = new_course

            sc.save()
            updated_instances.append(sc.id)


        return Response({
            "updated_student_course_ids": updated_instances,
            "skipped_due_to_duplicates": skipped_instances
        }, status=status.HTTP_200_OK)




class StudentCourseUpdate(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, course_id):
        new_course_id = request.data.get("course")
        student_list = request.data.get("student", [])

        if not new_course_id:
            return Response({"error": "New course ID not provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_course = Course.objects.get(id=new_course_id)
        except Course.DoesNotExist:
            return Response({"error": "New course not found."}, status=status.HTTP_404_NOT_FOUND)

        updated_instances = []
        skipped_instances = []

        for student_id in student_list:
            student_courses = StudentCourse.objects.filter(student=student_id, course_id=course_id)

            for sc in student_courses:
                # Check for existing (student, new_course) pair
                if StudentCourse.objects.filter(student=sc.student, course=new_course).exists():
                    skipped_instances.append(sc.id)
                    continue

                sc.course = new_course
                sc.save()
                updated_instances.append(sc.id)

        return Response({
            "updated_student_course_ids": updated_instances,
            "skipped_due_to_duplicates": skipped_instances
        }, status=status.HTTP_200_OK)
    



class BatchCourseUpdate(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, course_id):
        new_course_id = request.data.get("course")

        if not new_course_id:
            return Response({"error": "New Course ID not provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_course = Course.objects.get(id=new_course_id)
        except Course.DoesNotExist:
            return Response({"error": "New course not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get all batches with the given course_id
        batches = Batch.objects.filter(course_id=course_id)
        if not batches.exists():
            return Response({"message": "No batches found for the given course."}, status=status.HTTP_404_NOT_FOUND)

        updated_batches = []

        for batch in batches:
            serializer = BatchCreateSerializer(instance=batch, data={"course": new_course.id}, partial=True)
            if serializer.is_valid():
                serializer.save()
                updated_batches.append(serializer.data)
            else:
                return Response({
                    "error": f"Error updating batch {batch.id}",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": f"{len(updated_batches)} batches updated successfully.",
            "updated_batches": updated_batches
        }, status=status.HTTP_200_OK)
    

    


class BookListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        books = Book.objects.all()

        for book in books:
            if book.stock >= 1 and book.status != 'Available':
                book.status = 'Available'
                book.save(update_fields=['status'])
            elif book.stock == 0 and book.status != 'Not':
                book.status = 'Not'
                book.save(update_fields=['status'])

        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)



class BookCreateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            book = serializer.save(last_update_user=request.user)  # Save and get instance

            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Book),
                cid=str(uuid.uuid4()),  # Generate unique ID
                object_pk=book.id,
                object_id=book.id,
                object_repr=f"Book: {book.name}",  # Assuming `title` field exists
                action=LogEntry.Action.CREATE,
                changes=f"Created book: {book.name} by {request.user.username}",
                serialized_data=json.dumps(BookSerializer(book).data, default=str),
                changes_text=f"Book '{book.name}' created by {request.user.username}.",
                additional_data="Book",
                actor=request.user,
                timestamp=now()
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class BookUpdateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        try:
            book = Book.objects.get(id=id)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BookSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            # Save the updated book first
            updated_book = serializer.save(last_update_user=request.user)

            # Now, create the log entry
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Book),
                cid=str(uuid.uuid4()),  # Generate unique ID
                object_pk=updated_book.id,
                object_id=updated_book.id,
                object_repr=f"Book: {updated_book.name}",  # Use updated name
                action=LogEntry.Action.UPDATE,
                changes=f"Updated book: {updated_book.name} by {request.user.username}",
                serialized_data=json.dumps(BookSerializer(updated_book).data, default=str),
                changes_text=f"Book '{updated_book.name}' updated by {request.user.username}.",
                additional_data="Book",
                actor=request.user,
                timestamp=now()
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    
class BookDeleteAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            book = Book.objects.get(id=id)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create the log entry before deleting the book
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Book),
            cid=str(uuid.uuid4()),  # Generate unique ID
            object_pk=book.id,
            object_id=book.id,
            object_repr=f"Book: {book.name}",  # Use correct field if different
            action=LogEntry.Action.DELETE,
            changes=f"Deleted book: {book.name} by {request.user.username}",
            serialized_data=json.dumps(BookSerializer(book).data, default=str),
            changes_text=f"Book '{book.name}' deleted by {request.user.username}.",
            additional_data="Book",
            actor=request.user,
            timestamp=now()
        )

        # Delete the book after logging
        book.delete()
        return Response({'detail': 'Book deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


{
# class BookTakeByCountAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

#         # Get the start and end of the current month
#         today = now()
#         start_of_month = today.replace(day=1)
        
#         # Get all BookAllotment entries this month
#         allotments_this_month = BookAllotment.objects.filter(
#             allotment_datetime__date__gte=start_of_month
#         ).prefetch_related('book')

#         # Flat list of book IDs for this month
#         book_counts = {}

#         for allotment in allotments_this_month:
#             for book in allotment.book.all():
#                 if book.name in book_counts:
#                     book_counts[book.name] += 1
#                 else:
#                     book_counts[book.name] = 1

#         return Response(book_counts)
    



# class BookTakeByStudentListAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Forbidden'}, status=403)

#         # Get Current Month
#         today = now()
#         start_of_month = today.replace(day=1)

#         # Get all BookAllotments for current month
#         allotments_this_month = BookAllotment.objects.filter(
#             allotment_datetime__date__gte=start_of_month
#         ).prefetch_related('student', 'book__course')

#         # Build response data
#         data = []
#         for allotment in allotments_this_month:
#             for student in allotment.student.all():
#                 for book in allotment.book.all():
#                     data.append({
#                         'student_name': student.name,
#                         'enrollment_no': student.enrollment_no,
#                         'book_name': book.name,
#                         'course_name': book.course.name,
#                     })

#         return Response({"data": data})
}


# This is for geting all info about book issue...
class BookTakeByAllDataAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        today = now()
        start_of_month = today.replace(day=1)

        # Fetch BookAllotments with related data
        allotments = BookAllotment.objects.filter(
            allotment_datetime__date__gte=start_of_month
        ).select_related('allot_by').prefetch_related(
            Prefetch('student'),
            Prefetch('book')
        )

        # Structure data
        book_data = defaultdict(lambda: {'count': 0, 'students_map': {}})

        for allotment in allotments:
            allot_by_name = getattr(allotment.allot_by, 'first_name', 'Unknown')
            issue_date = allotment.allotment_datetime.strftime('%Y-%m-%d')

            for book in allotment.book.all():
                book_key = book.name.replace(" ", "_")

                for student in allotment.student.all():
                    key = student.enrollment_no

                    # Add count (total allotments)
                    book_data[book_key]['count'] += 1

                    # Add student info if not already added
                    if key not in book_data[book_key]['students_map']:
                        book_data[book_key]['students_map'][key] = {
                            'name': student.name,
                            'enrollment_no': student.enrollment_no,
                            'email': student.email,
                            'date_of_joining': student.date_of_joining.strftime('%Y-%m-%d'),
                            'book_issue_date': issue_date,
                            'book_issue_by': allot_by_name
                        }

        # Final formatted response
        response = {'all_book_tasks': {}}
        for book_key, info in book_data.items():
            response['all_book_tasks'][f"{book_key}_count"] = info['count']
            response['all_book_tasks'][f"{book_key}_book_take_by"] = list(info['students_map'].values())

        return Response(response)
    



# This is for apply filter on issue books...
class BookIssueFilterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        filter_type = request.query_params.get('filter_type')
        today = now().date()

        if filter_type == "today":
            start_date_str = end_date_str = today.strftime("%Y-%m-%d")

        elif filter_type == "yesterday":
            yesterday = today - timedelta(days=1)
            start_date_str = end_date_str = yesterday.strftime("%Y-%m-%d")

        elif filter_type == "past_week":
            start_date = today - timedelta(days=7)
            end_date = today
            start_date_str = start_date.strftime("%Y-%m-%d")
            end_date_str = end_date.strftime("%Y-%m-%d")

        elif filter_type == "last_month":
            first_day_this_month = today.replace(day=1)
            last_month_end = first_day_this_month - timedelta(days=1)
            last_month_start = last_month_end.replace(day=1)
            start_date_str = last_month_start.strftime("%Y-%m-%d")
            end_date_str = last_month_end.strftime("%Y-%m-%d")

        elif filter_type == "custom":
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')

        else:
            return Response({'error': 'Invalid filter_type'}, status=400)

        if not start_date_str or not end_date_str:
            return Response({'error': 'start_date and end_date are required in YYYY-MM-DD format'}, status=400)

        try:
            start_date = make_aware(datetime.strptime(start_date_str, "%Y-%m-%d"))
            end_date = make_aware(datetime.strptime(end_date_str, "%Y-%m-%d")) + timedelta(days=1)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)

        # Query allotments
        allotments = BookAllotment.objects.filter(
            allotment_datetime__range=(start_date, end_date)
        ).select_related('allot_by').prefetch_related(
            Prefetch('student'),
            Prefetch('book')
        )

        book_data = defaultdict(lambda: {'count': 0, 'students_map': {}})

        for allotment in allotments:
            allot_by_name = getattr(allotment.allot_by, 'first_name', 'Unknown')
            issue_date = allotment.allotment_datetime.strftime('%Y-%m-%d')

            for book in allotment.book.all():
                book_key = book.name.replace(" ", "_")
                for student in allotment.student.all():
                    student_key = student.enrollment_no
                    book_data[book_key]['count'] += 1

                    if student_key not in book_data[book_key]['students_map']:
                        book_data[book_key]['students_map'][student_key] = {
                            'name': student.name,
                            'enrollment_no': student.enrollment_no,
                            'email': student.email,
                            'date_of_joining': student.date_of_joining.strftime('%Y-%m-%d'),
                            'book_issue_date': issue_date,
                            'book_issue_by': allot_by_name
                        }

        response = {'all_book_tasks': {}}
        for book_key, info in book_data.items():
            response['all_book_tasks'][f"{book_key}_count"] = info['count']
            response['all_book_tasks'][f"{book_key}_book_take_by"] = list(info['students_map'].values())

        return Response(response)
    



# This if for Book Info also send issued or not issued students..
class BookInfoAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'User is Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        book = Book.objects.select_related('course').filter(id=id).first()
        if not book:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        book_info = {
            'id': book.id,
            'book_id': book.book_id,
            'name': book.name,
            'version': book.version,
            'course': book.course.name if book.course else None,
            'stock': book.stock,
            'status': book.status,
            'last_update_user': str(book.last_update_user) if book.last_update_user else None
        }

        active_student_ids = Student.objects.filter(status='Active').values_list('id', flat=True)

        students_not_issued = StudentCourse.objects.filter(
            course=book.course,
            student_book_allotment=False,
            student__in=active_student_ids
        ).select_related('student', 'course')

        students_issued = StudentCourse.objects.filter(
            course=book.course,
            student_book_allotment=True,
            student__in=active_student_ids
        ).select_related('student', 'course')

        # Fetch all allotments related to this book
        issued_allotments = BookAllotment.objects.filter(
            book=book
        ).prefetch_related('student', 'book', 'allot_by')

        # Build map: student.id => issue details
        allotment_map = {}

        for allot in issued_allotments:
            for student in allot.student.all():
                allotment_map[student.id] = {
                    'issue_by': str(allot.allot_by) if allot.allot_by else None,
                    'allotment_datetime': allot.allotment_datetime
                }

        not_issued_students = [
            {
                'student_id':sc.student.id,
                'name': sc.student.name,
                'enrollment_no': sc.student.enrollment_no,
                'course': sc.course.name,
                'issue_by': None,
                'allotment_datetime': None
            }
            for sc in students_not_issued
        ]

        issued_students = [
            {
                'student_id':sc.student.id,
                'name': sc.student.name,
                'enrollment_no': sc.student.enrollment_no,
                'course': sc.course.name,
                'issue_by': allotment_map.get(sc.student.id, {}).get('issue_by'),
                'allotment_datetime': allotment_map.get(sc.student.id, {}).get('allotment_datetime')
            }
            for sc in students_issued
        ]

        return Response({
            'book_info': book_info,
            'not_issued_students': not_issued_students,
            'issued_students': issued_students
        }, status=status.HTTP_200_OK)
