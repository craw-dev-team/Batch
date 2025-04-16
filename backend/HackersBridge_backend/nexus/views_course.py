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
