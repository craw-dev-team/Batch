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
from Student.models import StudentCourse, Student
from Student.serializer import StudentSerializer
from nexus.serializer import BatchCreateSerializer
from nexus.models import Batch
from django.db.models import Prefetch
import uuid
import json



class CourseListAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseCreateAPIView(APIView):
    authentication_classes = [TokenAuthentication]
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
    authentication_classes = [TokenAuthentication]
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
    authentication_classes = [TokenAuthentication]
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
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        books = Book.objects.all()  # Latest first
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)    



class BookCreateAPIView(APIView):
    authentication_classes = [TokenAuthentication]
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
    authentication_classes = [TokenAuthentication]
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
    authentication_classes = [TokenAuthentication]
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

