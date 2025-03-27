from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Min
from datetime import date
from rest_framework import status
from nexus.models import *
from .serializer import TrainerSerializer
from .models import *
from nexus.models import *
from Coordinator.models import *
from Counsellor.models import *
from django.utils.crypto import get_random_string
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail



User = get_user_model()  # Get custom User model if used


# For Trainer-List-Only
class TrainerListAPIviews(APIView):
    # authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # if request.user.role == 'admin':
        trainers = Trainer.objects.prefetch_related('course').select_related('coordinator','teamleader')
        isTeamleader = Trainer.objects.filter(is_teamleader=True)
        all_data = {
            "trainers": TrainerSerializer(trainers, many=True).data,
            "teamleaders": TrainerSerializer(isTeamleader, many=True).data
        }
        
        return Response({"all_data":all_data}, status=200)
            
        # else:
        #     return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


# For Trainer-Availability-In-CurrentlyFreeTrainers-Or-FutureAvailabilityOfTrainers
class TrainerAvailabilityAPIView(APIView):
    def get(self, request):
        trainers = Trainer.objects.all()
        today = date.today()

        # Fetch all timeslots except 'Special'
        timeslots = Timeslot.objects.exclude(special_time_slot='Special')

        # Step 1: Initialize free trainers dictionary
        free_trainers = {trainer.id: {ts: [trainer, None] for ts in timeslots} for trainer in trainers}

        # Step 2: Assign last batch info to trainers
        for trainer in trainers:
            for timeslot in timeslots:
                last_batch = Batch.objects.filter(
                    trainer=trainer, batch_time=timeslot
                ).order_by('-end_date').first()
                free_trainers[trainer.id][timeslot][1] = last_batch  # Store last batch info

        # Step 3: Filter out trainers with an active batch at the same timeslot
        for trainer in trainers:
            for timeslot in timeslots:
                active_batch = Batch.objects.filter(
                    trainer=trainer, batch_time=timeslot, status__in=["Running", "Upcoming"]
                ).exists()

                if active_batch and timeslot in free_trainers.get(trainer.id, {}):
                    del free_trainers[trainer.id][timeslot]  # Remove trainer from free list if they have an active batch

        # Step 4: Compile the final free trainers list
        current_free_trainers = []
        for trainer_id, timeslot_data in free_trainers.items():
            for timeslot, (trainer, batch) in timeslot_data.items():
                if not batch or batch.status in ["Completed", "Cancelled"]:  # Ensure past batch is completed or canceled
                    current_free_trainers.append({
                        'start_time': timeslot.start_time,
                        'time_id': timeslot.id,
                        'end_time': timeslot.end_time,
                        'trainer_id': trainer.trainer_id,
                        'tr_id': trainer.id,
                        'name': trainer.name,
                        'languages': trainer.languages,
                        'location': trainer.location.locality if trainer.location else None,
                        'location_id': trainer.location.id if trainer.location else None,
                        'email': trainer.email,
                        'phone': trainer.phone,
                        'end_date': batch.end_date if batch else 'No past Batch',
                        'free_days': (today - batch.end_date).days if batch else 'No past Batch',
                        'course': list(Course.objects.filter(trainer=trainer).values_list('id', 'name')),
                        'week': timeslot.week_type
                    })

        # Step 5: Sort free trainers by max free days
        current_free_trainers.sort(
            key=lambda x: x['free_days'] if isinstance(x['free_days'], int) else float('-inf'), reverse=True
        )

        future_availability_trainers = []

        for trainer in trainers:
            for timeslot in timeslots:
                # Get all batches for this trainer at this timeslot
                trainer_batches = Batch.objects.filter(trainer=trainer, batch_time=timeslot)

                # Check if there's any "Upcoming" batch with the same week_type
                has_upcoming_batch = trainer_batches.filter(
                    status="Upcoming", batch_time__week_type=timeslot.week_type
                ).exists()

                if not has_upcoming_batch:
                    # Fetch the most recent past batch (excluding "Upcoming" ones)
                    last_batch = trainer_batches.exclude(status="Upcoming").order_by('-end_date').first()

                    if last_batch and last_batch.status in ["Running", "Completed", "Canceled", "Hold"]:
                        free_days = (last_batch.end_date - today).days if last_batch.end_date else None

                        future_availability_trainers.append({
                            'trainer_id': trainer.trainer_id,
                            'tr_id': trainer.id,
                            'name': trainer.name,
                            'languages': trainer.languages,
                            'location': getattr(trainer.location, 'locality', None),
                            'location_id': getattr(trainer.location, 'id', None),
                            'email': trainer.email,
                            'phone': trainer.phone,
                            'batch_id': last_batch.batch_id,
                            'batch_course': last_batch.course.name,
                            'batch_week': last_batch.preferred_week,
                            'start_date': last_batch.start_date,
                            'end_date': last_batch.end_date,
                            'free_days': free_days,
                            'start_time': timeslot.start_time,
                            'end_time': timeslot.end_time,
                            'week': timeslot.week_type  # Include week_type filter
                        })

        # Sort trainers by the number of free days (earliest availability first)
        future_availability_trainers.sort(key=lambda x: x['free_days'] if isinstance(x['free_days'], int) else float('inf'))

        return Response({
            'free_trainers': current_free_trainers,
            'future_availability_trainers': future_availability_trainers
        })



        # Step 5: Get trainers with future availability
        # future_available_trainers = Trainer.objects.annotate(
        #     batch_count=Count('batch', filter=~Q(batch__status='Completed')),
        #     next_end_date=Min('batch__end_date', filter=~Q(batch__status='Completed'))
        # ).prefetch_related(
        #     'batch_set'
        # )

        # future_availability_trainers = []
        # for trainer in future_available_trainers:
        #     if trainer.batch_count > 0:
        #         for batch in trainer.batch_set.all():
        #             if batch.status != 'Completed':
        #                 free_days = (batch.end_date - today).days
        #                 if free_days >= 0:
        #                     future_availability_trainers.append({
        #                         'trainer_id': trainer.trainer_id,
        #                         'name': trainer.name,
        #                         'start_date': batch.start_date,
        #                         'end_date': batch.end_date,
        #                         'batch_count': trainer.batch_count,
        #                         'batch_id': batch.batch_id,
        #                         'batch_course':batch.course.name,
        #                         'batch_week': batch.preferred_week,
        #                         'free_days': free_days,
        #                         'start_time': getattr(batch.batch_time, 'start_time', "N/A"),
        #                         'end_time': getattr(batch.batch_time, 'end_time', "N/A")
        #                     })

        # # Sort future availability trainers by earliest free date
        # future_availability_trainers.sort(key=lambda x: x['free_days'])

class AddTrainerAPIView(APIView):
    """API View to add a new trainer (without creating a user)"""
    # authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle POST request to create a new trainer"""
        # if request.user.role == 'admin':
        serializer = TrainerSerializer(data=request.data)

        if serializer.is_valid():
            # Get the currently logged-in coordinator
            try:
                last_update_user = request.user
            except CustomUser.DoesNotExist:
                return Response({'error': 'Coordinator not found'}, status=status.HTTP_400_BAD_REQUEST)

            trainer = serializer.save(last_update_user=last_update_user)

            return Response({
                'message': 'Trainer added successfully',
                'trainer_id': trainer.trainer_id,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # else:
        #     return Response({'error': 'Only admin can add trainers'}, status=status.HTTP_403_FORBIDDEN)





# class AddTrainerAPIView(APIView):
#     """API View to handle adding a new trainer"""
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """Handle POST request to create a new trainer"""
#         if request.user.role != 'coordinator':
#             return Response({'error': 'Only coordinators can add trainers'}, status=status.HTTP_403_FORBIDDEN)

#         serializer = AddTrainerSerializer(data=request.data)

#         if serializer.is_valid():
#             # Get the currently logged-in coordinator
#             try:
#                 last_update_coordinator = Coordinator.objects.get(coordinator_id=request.user.username)
#             except Coordinator.DoesNotExist:
#                 return Response({'error': 'Coordinator not found'}, status=status.HTTP_400_BAD_REQUEST)

#             trainer = serializer.save(last_update_coordinator=last_update_coordinator)

#             return Response({
#                 'message': 'Trainer added successfully',
#                 'trainer_id': trainer.trainer_id,
#                 # 'password': get_random_string(length=12)  # Just an example, should be securely shared
#                 'password': trainer.phone  # Just an example, should be securely shared
#             }, status=status.HTTP_201_CREATED)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




#     """
#     API view to retrieve a list of trainers who are team leaders.
#     """
# class TeamLeaderListView(APIView):
    
#     def get(self, request):
#             isTeamleader = Trainer.objects.filter(is_teamleader=True)
#             serializer = TrainerSerializer(isTeamleader, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
            





class EditTrainerAPIView(APIView):
    """API View to edit an existing trainer"""
    # permission_classes = [IsAuthenticated]

    def put(self, request, id):
        """Handle PUT request to update trainer details"""
        # if request.user.role != 'admin':
        #     return Response({'error': 'Only admins can edit trainers'}, status=status.HTTP_403_FORBIDDEN)

        trainer = get_object_or_404(Trainer, id=id)
        old_email = trainer.email  # Store old email before updating
        previous_status = trainer.status  # Store previous status before updating

        serializer = TrainerSerializer(trainer, data=request.data, partial=True)

        if serializer.is_valid():
            trainer = serializer.save(last_update_coordinator=request.user)

            # ✅ Update User email if changed
            if old_email != serializer.validated_data.get('email'):
                try:
                    user = User.objects.get(email=old_email)
                    user.email = serializer.validated_data.get('email')
                    user.save()
                except User.DoesNotExist:
                    return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Check if status changed to Inactive
            if previous_status == "Active" and trainer.status == "Inactive":
                trainer.status_change_date = now().date()
                trainer.save()

            # ✅ Calculate inactive days
            inactive_days = trainer.calculate_inactive_days()
            
            return Response({
                'message': 'Trainer updated successfully',
                'trainer_id': trainer.trainer_id,
                'inactive_days': inactive_days
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteTrainerAPIView(APIView):
    """API View to delete a trainer"""
    # permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        """Handle DELETE request to remove a trainer"""
        # if request.user.role != 'admin':
        #     return Response({'error': 'Only admins can delete trainers'}, status=status.HTTP_403_FORBIDDEN)

        trainer = get_object_or_404(Trainer, id=id)

        try:
            user = User.objects.get(username=trainer.trainer_id)  # Get user by trainer ID
        except User.DoesNotExist:
            return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Delete authentication tokens
        Token.objects.filter(user=user).delete()

        # ✅ Delete trainer record
        trainer.delete()

        # ✅ Delete associated user
        user.delete()
        
        return Response({'message': 'Trainer, user account, and authentication token deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    



class TrainerInfoAPIView(APIView):
    def get(self, request, id):
        trainer = get_object_or_404(Trainer, id=id)

        trainer_batches = {
            'Upcoming': Batch.objects.filter(trainer=trainer, status='Upcoming').select_related('course', 'batch_time'),
            'Ongoing': Batch.objects.filter(trainer=trainer, status='Running').select_related('course', 'batch_time'),
            'Completed': Batch.objects.filter(trainer=trainer, status='Completed').select_related('course', 'batch_time'),
            'Hold': Batch.objects.filter(trainer=trainer, status='Hold').select_related('course', 'batch_time'),
        }

        trainer_data = {'trainer': TrainerSerializer(trainer).data}

        for batch_status, batches in trainer_batches.items():  # Rename 'status' to 'batch_status'
            trainer_data[f'trainer_batch_{batch_status.lower()}'] = [
                {
                    'batch_id': batch.id,
                    'batch_name': batch.batch_id,
                    'course_name': batch.course.name,
                    'batch_time_start': batch.batch_time.start_time,
                    'batch_time_end': batch.batch_time.end_time,
                    'batch_start_date':batch.start_date,
                    'batch_end_date':batch.end_date,
                    'batch_mode':batch.mode,
                    'batch_language':batch.language,
                    'batch_location':batch.location.locality,
                    'batch_preferred_week':batch.preferred_week,
                    'students': list(batch.student.values('id', 'name'))  # Use correct related_name
                }
                for batch in batches  # Iterate over queryset directly
            ]
            
        return Response({'Trainer_All': trainer_data}, status=status.HTTP_200_OK)

# class TrainerInfoAPIView(APIView):
#     def get(self, request, id):
#         trainer = get_object_or_404(Trainer, id=id)
#         today = date.today()

#         # Fetch all timeslots except Bootcamp
#         timeslots = Timeslot.objects.exclude(special_time_slot='Bootcamp')
#         timeslot_dict = {ts.id: ts for ts in timeslots}  # Store in a dictionary for quick access

#         # Initialize free trainers dictionary
#         free_trainers = {
#             trainer.id: {ts.id: [trainer, None] for ts in timeslots}
#         }

#         # Step 2: Update free trainers with last batch info
#         for ts_id, timeslot in timeslot_dict.items():
#             last_batch = Batch.objects.filter(Q(trainer=trainer) & Q(batch_time=timeslot)).order_by('end_date').last()
#             free_trainers[trainer.id][ts_id][1] = last_batch

#         # Step 3: Remove occupied timeslots for trainer
#         running_batches = Batch.objects.filter(Q(trainer=trainer) & (Q(status="Running") | Q(status="Upcoming")))
#         for batch in running_batches:
#             ts_id = batch.batch_time.id  # Ensure ID is used
#             if ts_id in free_trainers[trainer.id]:
#                 del free_trainers[trainer.id][ts_id]  # Remove occupied timeslot

#         # Step 4: Compile current free trainers list
#         current_free_trainers = []
#         for trainer_id, timeslot_data in free_trainers.items():
#             for ts_id, (trainer, batch) in timeslot_data.items():
#                 timeslot = timeslot_dict[ts_id]  # Fetch from preloaded dictionary
#                 end_date = batch.end_date if batch else None
#                 free_days = (today - end_date).days if end_date else 'No past Batch'
                
#                 current_free_trainers.append({
#                     'start_time': timeslot.start_time,
#                     'time_id': timeslot.id,
#                     'end_time': timeslot.end_time,
#                     'trainer_id': trainer.id,
#                     'name': trainer.name,
#                     'languages': trainer.languages,
#                     'location': trainer.location.locality if trainer.location else None,
#                     'location_id': trainer.location.id if trainer.location else None,
#                     'email': trainer.email,
#                     'phone': trainer.phone,
#                     'end_date': end_date if end_date else 'No past Batch',
#                     'free_days': free_days,
#                     'course': list(Course.objects.filter(trainer=trainer).values_list('id', 'name')),
#                     'week': 'Weekends' if timeslot.id > 4 else 'Weekdays'
#                 })

#         # Sort free trainers by max free days first
#         current_free_trainers.sort(
#             key=lambda x: x['free_days'] if isinstance(x['free_days'], int) else float('-inf'), reverse=True
#         )

#         # Step 1: Get all running/upcoming batches with their time slots and weeks
#         running_batches = set(
#             Batch.objects.filter(
#                 trainer=trainer, status__in=['Running', 'Upcoming']
#             ).values_list('batch_time_id', 'preferred_week')
#         )

#         # Step 2: Get all completed batches (potential future availability)
#         completed_batches = Batch.objects.filter(
#             trainer=trainer, status='Completed'
#         ).select_related('course', 'batch_time')

#         future_availability_trainers = []
#         for batch in completed_batches:
#             # Check if this batch's time slot and week conflict with any running/upcoming batch
#             if (batch.batch_time.id, batch.preferred_week) in running_batches:
#                 continue  # Skip this batch if a conflict exists

#             free_days = (today - batch.end_date).days if batch.end_date else float('inf')

#             future_availability_trainers.append({
#                 'trainer_id': trainer.id,
#                 'name': trainer.name,
#                 'start_date': batch.start_date,
#                 'end_date': batch.end_date,
#                 'batch_id': batch.batch_id,
#                 'batch_course': batch.course.name,
#                 'batch_week': batch.preferred_week,
#                 'free_days': free_days,
#                 'start_time': getattr(batch.batch_time, 'start_time', "N/A"),
#                 'end_time': getattr(batch.batch_time, 'end_time', "N/A")
#             })

#         # Sort future availability trainers by longest free days first
#         future_availability_trainers.sort(key=lambda x: x['free_days'], reverse=True)

#         # Fetch trainer's batch data
#         trainer_batches = {
#             'Upcoming': list(Batch.objects.filter(trainer=trainer, status='Upcoming').select_related('course', 'batch_time')),
#             'Ongoing': list(Batch.objects.filter(trainer=trainer, status='Running').select_related('course', 'batch_time')),
#             'Completed': list(Batch.objects.filter(trainer=trainer, status='Completed').select_related('course', 'batch_time')),
#             'Hold': list(Batch.objects.filter(trainer=trainer, status='Hold').select_related('course', 'batch_time')),
#             'Free_Batch': current_free_trainers,  # Store sorted free batch trainers
#             'Future_Batch': future_availability_trainers,
#         }

#         trainer_data = {'trainer': TrainerSerializer(trainer).data}

#         for batch_status, batches in trainer_batches.items():
#             if batch_status in ["Free_Batch", "Future_Batch"]:
#                 trainer_data[f'trainer_batch_{batch_status.lower()}'] = batches
#             else:
#                 trainer_data[f'trainer_batch_{batch_status.lower()}'] = [
#                     {
#                         'batch_id': batch.id,
#                         'batch_name': batch.batch_id,
#                         'course_name': batch.course.name,
#                         'batch_time_start': batch.batch_time.start_time,
#                         'batch_time_end': batch.batch_time.end_time,
#                         'batch_start_date': batch.start_date,
#                         'batch_end_date': batch.end_date,
#                         'batch_mode': batch.mode,
#                         'batch_language': batch.language,
#                         'batch_location': batch.location.locality if batch.location else None,
#                         'batch_preferred_week': batch.preferred_week,
#                         'students': list(batch.student.values('id', 'name'))  # Use correct related_name
#                     }
#                     for batch in batches
#                 ]

#         return Response({'Trainer_All': trainer_data}, status=status.HTTP_200_OK)