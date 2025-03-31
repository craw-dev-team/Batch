import  os
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Batch, BatchStudentAssignment
from .serializer import BatchSerializer, BatchCreateSerializer, BatchStudentAssignmentSerializer
from Trainer.serializer import TrainerSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Q, Count, Min, Prefetch
from Student.models import StudentCourse, Student
from Student.serializer import StudentSerializer, StudentCourseSerializer
from Trainer.models import Trainer
from Coordinator.models import Coordinator
from nexus.models import Course, Timeslot
from rest_framework import serializers
from nexus.generate_certificate import generate_certificate, get_certificate_path



class BatchAPIView(APIView):
    """
    API View for fetching batch details with filtering and trainer availability.
    """
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # if request.user.role != 'admin':
        #     return Response({'error': 'Only coordinators can access this data'}, status=403)
        
        batches = Batch.objects.prefetch_related('student').select_related('trainer', 'course', 'location', 'batch_time')
        now = timezone.now()
        today = date.today()

        # Update batch statuses
        for batch in batches:
            students = batch.student.all()
            if batch.status not in ['Hold', 'Cancelled']:
                if batch.start_date <= today < batch.end_date:
                    batch.status = 'Running'
                    batch.save()
                    StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Ongoing')
                elif batch.start_date >= today and batch.end_date >= today:
                    batch.status = 'Upcoming'
                    batch.save()
                    StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Upcoming')
                elif batch.end_date < today:
                    batch.status = 'Completed'
                    batch.save()
                    StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Completed')

        seven_days_later = now + timedelta(days=10)
        batches_ending_soon = Batch.objects.filter(end_date__lte=seven_days_later, end_date__gte=now, status='Running').order_by('end_date')
        # for batch in batches_ending_soon:
        #     print(batch.end_date, batch.id)
        #     print(" ")
        running_batch = Batch.objects.filter(status='Running')
        scheduled_batch = Batch.objects.filter(status='Upcoming')
        completed_batch = Batch.objects.filter(status='Completed')
        hold_batch = Batch.objects.filter(status='Hold')
        cancelled_batch = Batch.objects.filter(status='Cancelled')

        # Serialize the batches using the updated BatchSerializer
        all_batches_data = {
            'batches': BatchSerializer(batches, many=True).data,
            'running_batch': BatchSerializer(running_batch, many=True).data,
            'batches_ending_soon': BatchSerializer(batches_ending_soon, many=True).data,
            'scheduled_batch': BatchSerializer(scheduled_batch, many=True).data,
            'completed_batch': BatchSerializer(completed_batch, many=True).data,
            'hold_batch': BatchSerializer(hold_batch, many=True).data,
            'cancelled_batch': BatchSerializer(cancelled_batch, many=True).data,
        }

        return Response({'All_Type_Batch': all_batches_data}, status=200)
    
# # Serialize trainers before returning response
        # current_free_trainers = []
        # for k, v in free_trainers.items():
        #     for l, m in v.items():
        #         trainer_data = TrainerSerializer(m[0]).data  # Serialize trainer object
        #         current_free_trainers.append({
        #             'start_time': l.start_time,
        #             'timeslot': l.id,  # Serialize timeslot ID instead of object
        #             'end_time': l.end_time,
        #             **trainer_data,  # Unpack serialized trainer data
        #             'end_date': m[1].end_date if m[1] else 'No past Batch',
        #             'free_days': (today - m[1].end_date).days if m[1] else 'No past Batch',
        #             'course': list(Course.objects.filter(trainer=k).values_list('name', flat=True)),
        #             'week': 'Weekends' if l.id > 4 else 'Weekdays'
        #         })
        
        #         # Trainers who will be available soon
        # future_available_trainers = Trainer.objects.annotate(
        #     batch_count=Count('batch', filter=~Q(batch__status='Completed')),
        #     next_end_date=Min('batch__end_date', filter=~Q(batch__status='Completed'))
        # ).prefetch_related(
        #     Prefetch('batch_set', queryset=Batch.objects.filter(~Q(status='Completed')), to_attr='future_batches')
        # )

        # future_availability_trainers = [
        #     {
        #         'trainer': trainer,
        #         'trainer_id': trainer.trainer_id,
        #         'will_free': batch.end_date,
        #         'batch_count': trainer.batch_count,
        #         'batch_id': batch.batch_id,
        #         'batch_week': batch.preferred_week,
        #         'free_days': (batch.end_date - today).days,
        #         'start_time': batch.batch_time.start_time,
        #         'end_time': batch.batch_time.end_time
        #     }
        #     for trainer in future_available_trainers if trainer.batch_count != 0
        #     for batch in trainer.future_batches if (batch.end_date - today).days >= 0
        # ]

        # future_availability_trainers.sort(key=lambda x: x['free_days'])

class BatchCreateAPIView(APIView):
    # permission_classes =[IsAuthenticated]
    
    def post(self, request):
        # if request.user.role == 'admin':
        serializer = BatchCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except serializers.ValidationError as e:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        # else:
        #     return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

class BatchEditAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def put(self, request, id):
        # if request.user.role == 'admin':
        try:
            batches = Batch.objects.get(id=id)
            
        except Batch.DoesNotExist:
            return Response({'detail': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = BatchCreateSerializer(batches, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # else:
        #     return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)



class BatchDeleteAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        """Delete a batch and update student course statuses."""

        try:
            batch = Batch.objects.prefetch_related('student').get(id=id)
        except Batch.DoesNotExist:
            return Response({'detail': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

        course = batch.course
        students = list(batch.student.all())  # Fetch students before deleting batch
        batch_status = batch.status  # Store batch status before deletion

        # Delete the batch
        batch.delete()

        # Update student course statuses based on the batch status
        if batch_status == 'Running':
            StudentCourse.objects.filter(student__in=students, course=course).update(status='Denied')
        elif batch_status == 'Upcoming':
            StudentCourse.objects.filter(student__in=students, course=course).update(status='Not Started')
        elif batch_status == 'Completed':
            StudentCourse.objects.filter(student__in=students, course=course).update(status='Completed')

        return Response({'detail': 'Batch deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
                
    # else:
        #     return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class AvailableStudentsAPIView(APIView):
    """API to get available students for a batch."""
    # permission_classes = [IsAuthenticated]

    def get(self, request, batch_id):
        # if request.user.role != 'coordinator':
        #     return Response({"error": "Only coordinators can view this data."}, status=status.HTTP_403_FORBIDDEN)


        batch = get_object_or_404(Batch, id=batch_id)

        # Base filter for active students in the same course
        filters = Q(courses__id=batch.course.id, status='Active')

        # Language filter
        if batch.language != "Both":
            filters &= Q(language__in=[batch.language, "Both"])

        # Week filter
        if batch.preferred_week != "Both":
            filters &= Q(preferred_week__in=[batch.preferred_week, "Both"])

        # Mode filter
        if batch.mode != "Hybrid":
            filters &= Q(mode__in=[batch.mode, "Hybrid"])

        # Location filter (Ensure location comparison is valid)
        if hasattr(batch.location, 'locality') and batch.location.locality != "Both":
            filters &= Q(location__locality__in=[batch.location.locality, "Both"])

        # Exclude students who are already in the batch
        # enrolled_students = batch.student.values_list('id', flat=True)  # Get IDs of enrolled students
        # filters &= ~Q(id__in=enrolled_students)  # Exclude them from the queryset

        # Exclude students who are in a Running or Upcoming batch of the same course
        ongoing_batches = Batch.objects.filter(course=batch.course, status__in=['Running', 'Upcoming'])
        ongoing_students = Student.objects.filter(batch__in=ongoing_batches).values_list('id', flat=True)
        filters &= ~Q(id__in=ongoing_students)

        
        # Query the filtered students
        students = Student.objects.filter(filters)

        # Serialize and return filtered student data
        serialized_students = StudentSerializer(students, many=True).data
        return Response({"available_students": serialized_students}, status=status.HTTP_200_OK)  
    



class AvailableTrainersAPIView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def get(self, request, batch_id):
        # if request.user.role != 'admin':
        #     return Response({"error": "Only admin can view this data."}, status=status.HTTP_403_FORBIDDEN)
        
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
    # permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        """Add students to a batch and update their course status accordingly."""
        
        batch = get_object_or_404(Batch, id=batch_id)
        student_ids = request.data.get('students', [])  # Expecting a list of student IDs

        if not isinstance(student_ids, list):
            return Response({"error": "Invalid input format, expected a list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(id__in=student_ids)

        if not students.exists():
            return Response({"error": "No valid students found."}, status=status.HTTP_400_BAD_REQUEST)

        course = batch.course
        added_students = []

        for student in students:
            # Check if student is already assigned to this batch
            if not BatchStudentAssignment.objects.filter(batch=batch, student=student).exists():
                if batch.status != 'Completed':  # Ensure batch is not completed
                    BatchStudentAssignment.objects.create(batch=batch, student=student)
                    added_students.append(student.id)

        # Update course status based on batch status
        if batch.status == 'Running':
            StudentCourse.objects.filter(student__in=students, course=course).update(status='Ongoing')
        elif batch.status == 'Upcoming':
            StudentCourse.objects.filter(student__in=students, course=course).update(status='Not Started')

        return Response({"message": "Students added successfully", "added_students": added_students}, status=status.HTTP_200_OK)




class BatchRemoveStudentAPIView(APIView):
    """API to remove students from a batch and update course status."""
    # permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        # if request.user.role != 'coordinator':
        #     return Response({"error": "Only coordinators can perform this action."}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=batch_id)
        students_ids = request.data.get('students', [])  # Expecting a list of student IDs

        if not isinstance(students_ids, list):
            return Response({"error": "Invalid input format, expected a list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(id__in=students_ids)
        
        removed_students = []
        student_courses_to_update = []  # Collect StudentCourse objects for bulk update

        for student in students:
            assignment = BatchStudentAssignment.objects.filter(batch=batch, student=student)
            if assignment.exists():
                assignment.delete()
                removed_students.append(student.id)

                # Update only the course associated with this batch
                student_course = StudentCourse.objects.filter(student=student, course=batch.course).first()
                if student_course:
                    if batch.status == 'Running':
                        student_course.status = 'Denied'
                    elif batch.status == 'Upcoming':
                        student_course.status = 'Not Started'
                    student_courses_to_update.append(student_course)


        # Bulk update StudentCourse status for better performance
        if student_courses_to_update:
            StudentCourse.objects.bulk_update(student_courses_to_update, ['status'])

        return Response({
            "message": "Students removed successfully, and course status updated.",
            "removed_students": removed_students
        }, status=status.HTTP_200_OK)





class BatchInfoAPIView(APIView):
    def get(self, request, id):
        batch = get_object_or_404(Batch, id=id)

        # Fetch students from BatchStudentAssignment (ensuring correct batch-student mapping)
        student_assignments = BatchStudentAssignment.objects.filter(batch=batch)

        batch_serializer = BatchSerializer(batch)  # Serialize batch details
        student_serializer = BatchStudentAssignmentSerializer(student_assignments, many=True)  # Serialize students with status

        return Response({
            'batch': batch_serializer.data,
            'students': student_serializer.data
        }, status=status.HTTP_200_OK)
    

class BatchStudentAssignmentUpdateAPIView(APIView):
    def patch(self, request, assignment_id):
        assignment = get_object_or_404(BatchStudentAssignment, id=assignment_id)
        
        serializer = BatchStudentAssignmentSerializer(assignment, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Student batch status updated successfully",
                "updated_data": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GenerateBatchCertificateAPIView(APIView):
    def post(self, request, id, *args, **kwargs):
        issue_date = request.data.get("issue_date")
        student_ids = request.data.get("student_id", [])

        if not issue_date:
            return Response({"error": "Issue date is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get the batch and course
        batch = get_object_or_404(Batch, id=id)
        course = batch.course.name

        # Fetch all completed student courses for the given student IDs
        student_courses = StudentCourse.objects.filter(
            student__id__in=student_ids, course=batch.course, status="Completed"
        )

        if not student_courses.exists():
            return Response({"error": "No completed student courses found for this batch"}, status=status.HTTP_400_BAD_REQUEST)

        certificate_paths = []
        errors = []

        for student_course in student_courses:
            student = student_course.student
            student_course.certificate_date = issue_date
            student_course.save(update_fields=["certificate_date"])

            # Generate certificate
            file_path = generate_certificate(course, student.name, student.enrollment_no, issue_date)
            
            if os.path.exists(file_path):
                student_course.student_certificate_allotment = True
                student_course.save(update_fields=["student_certificate_allotment"])
                certificate_paths.append({
                    "student_id": student.id,
                    "certificate_path": file_path
                })
            else:
                errors.append({
                    "student_id": student.id,
                    "error": "Certificate generation failed"
                })

        response_data = {"certificates": certificate_paths}
        if errors:
            response_data["errors"] = errors

        return Response(response_data, status=status.HTTP_200_OK)
