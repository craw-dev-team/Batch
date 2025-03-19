from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Batch, BatchStudentAssignment
from .serializer import BatchSerializer, BatchCreateSerializer
from Trainer.serializer import TrainerSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Q, Count, Min, Prefetch
from Student.models import StudentCourse, Student
from Student.serializer import StudentSerializer
from Trainer.models import Trainer
from Coordinator.models import Coordinator
from nexus.models import Course, Timeslot
from rest_framework import serializers



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

        seven_days_later = now + timedelta(days=7)
        batches_ending_soon = Batch.objects.filter(end_date__lte=seven_days_later, end_date__gte=now, status='Running')
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



class  BatchDeleteAPIView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def delete(self, request, id):
        # if request.user.role == 'admin':
        try:
            counsellors = Batch.objects.get(id=id)
        except Batch.DoesNotExist:
            return Response({'detail': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        counsellors.delete()
        return Response({'detail': 'Course deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
            
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
        # if request.user.role != 'coordinator':
        #     return Response({"error": "Only coordinators can perform this action."}, status=status.HTTP_403_FORBIDDEN)

        batch = get_object_or_404(Batch, id=batch_id)
        students_ids = request.data.get('students', [])  # Expecting a list of student IDs

        if not isinstance(students_ids, list):
            return Response({"error": "Invalid input format, expected a list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(id__in=students_ids)

        # # Get the logged-in coordinator
        # coordinator_id = request.user.username
        # coordinator = get_object_or_404(Coordinator, coordinator_id=coordinator_id)

        # Add students to batch if conditions meet
        added_students = []
        for student in students:
            if not BatchStudentAssignment.objects.filter(batch=batch, student=student).exists():
                if batch.status != 'Completed':
                    BatchStudentAssignment.objects.create(batch=batch, student=student,) #coordinator=coordinator)
                    added_students.append(student.id)

        return Response({"message": "Students added successfully", "added_students": added_students}, status=status.HTTP_200_OK)



class BatchInfoAPIView(APIView):
    
    def get(self, request, id):
        batch = get_object_or_404(Batch, id=id)
        student_in_batch = batch.student.all()
        
        batch_serializer = BatchSerializer(batch)
        student_serializer = StudentSerializer(student_in_batch, many=True)
        
        return Response({
            'batch': batch_serializer.data,
            'students': student_serializer.data
        }, status=status.HTTP_200_OK)