from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Min
from datetime import date
from rest_framework import status
from nexus.models import *
from .serializer import TrainerSerializer
from .models import *
from Student.models import Student
from nexus.serializer import LogEntrySerializer
from Coordinator.models import *
from Counsellor.models import *
from django.utils.crypto import get_random_string
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from auditlog.middleware import AuditlogMiddleware
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import time
from django.core.mail import EmailMessage
import time as sleep_time 
from django.utils.dateparse import parse_date
import calendar
import json
import uuid

User = get_user_model()  # Get custom User model if used
cid = str(uuid.uuid4())

# For Trainer-List-Only
class TrainerListAPIviews(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            today = date.today()

            trainers = Trainer.objects.prefetch_related('course', 'timeslot').select_related('coordinator', 'teamleader')
            teamleaders = trainers.filter(is_teamleader=True)

            for trainer in trainers:
                # Clear expired leave
                if trainer.leave_end_date and today > trainer.leave_end_date:
                    trainer.leave_end_date = None
                    trainer.leave_status = None
                    trainer.save(update_fields=['leave_end_date', 'leave_status'])

                # This is for Trainer's Change Status...... 
                # When Trainer weekoff that day trainer status is Inactive...
                today_name = calendar.day_name[today.weekday()]  # e.g., "Monday"

                if trainer.real_status == False:
                    if trainer.weekoff == today_name:
                        trainer.status = "Inactive"
                        trainer.save(update_fields=['status'])
                    else:
                        trainer.status = "Active"
                        trainer.save(update_fields=['status'])

            data = {
                "trainers": TrainerSerializer(trainers, many=True).data,
                "teamleaders": TrainerSerializer(teamleaders, many=True).data
            }

            return Response({"all_data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# For Trainer-Availability-In-CurrentlyFreeTrainers-Or-FutureAvailabilityOfTrainers
class TrainerAvailabilityAPIView(APIView):
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        today = date.today()

        # Fetch trainers with their assigned timeslots
        trainers = Trainer.objects.select_related('location').prefetch_related('course', 'timeslot')
        timeslots = Timeslot.objects.exclude(special_time_slot='Special')

        # Step 1: Initialize free trainers list (Filtered by trainer's assigned timeslot)
        free_trainers = []

        for trainer in trainers:
            assigned_timeslots = trainer.timeslot.all()

            for timeslot in assigned_timeslots:
                if timeslot not in timeslots:  # Skip if not a valid timeslot
                    continue  

                # Check if the trainer has an active batch in this timeslot
                active_batch_exists = Batch.objects.filter(
                    trainer=trainer, batch_time=timeslot, status__in=["Running", "Upcoming"]
                ).exists()

                if not active_batch_exists:  # Only add if the trainer is actually free
                    last_batch = Batch.objects.filter(
                        trainer=trainer, batch_time=timeslot
                    ).order_by('-end_date').first()

                    free_days = (today - last_batch.end_date).days if last_batch and last_batch.status in ["Completed", "Cancelled"] else "No past Batch"

                    free_trainers.append({
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
                        'end_date': last_batch.end_date if last_batch else 'No past Batch',
                        'free_days': free_days,
                        'course': list(trainer.course.values_list('id', 'name')),
                        'week': timeslot.week_type
                    })

        # Step 2: Sort free trainers by max free days
        free_trainers.sort(
            key=lambda x: x['free_days'] if isinstance(x['free_days'], int) else float('-inf'),
            reverse=True
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
                    # Fetch the most recent past batch (excluding "Upcoming")
                    last_batch = trainer_batches.exclude(status="Upcoming").order_by('-end_date').first()

                    if last_batch and last_batch.status in ["Running", "Completed", "Canceled", "Hold"]:
                        # Calculate free_days from last_batch end_date
                        free_days = (last_batch.end_date - today).days if last_batch.end_date else None

                        # ✅ Filter trainers available within the next 90 days
                        if free_days is not None and 0 <= free_days <= 90:
                            future_availability_trainers.append({
                                'trainer_id': trainer.trainer_id,
                                'tr_id': trainer.id,
                                'name': trainer.name,
                                'languages': trainer.languages,
                                'location': getattr(trainer.location, 'locality', None),
                                'location_id': getattr(trainer.location, 'id', None),
                                'email': trainer.email,
                                'phone': trainer.phone,
                                'batch__id': last_batch.id,
                                'batch_id': last_batch.batch_id,
                                'batch_course': last_batch.course.name,
                                'batch_week': last_batch.preferred_week,
                                'start_date': last_batch.start_date,
                                'end_date': last_batch.end_date,
                                'free_days': free_days,
                                'start_time': timeslot.start_time,
                                'end_time': timeslot.end_time,
                                'week': timeslot.week_type
                            })

        # ✅ Sort by earliest availability
        future_availability_trainers.sort(key=lambda x: x['free_days'])

        return Response({
            'free_trainers': free_trainers,
            'future_availability_trainers': future_availability_trainers
        })





class AddTrainerAPIView(APIView):
    """API View to add a new trainer (without creating a user)"""
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        """Handle POST request to create a new trainer"""
        serializer = TrainerSerializer(data=request.data,  context={'request': request})

        if serializer.is_valid():
            # Get the currently logged-in coordinator
            try:
                last_update_user = request.user
            except CustomUser.DoesNotExist:
                return Response({'error': 'Coordinator not found'}, status=status.HTTP_400_BAD_REQUEST)

            trainer = serializer.save(last_update_user=last_update_user)

            
            trainer_data = {field.name: getattr(trainer, field.name, None) for field in Trainer._meta.fields}   
            changes_text = [f"Created field {field}: {value}" for field, value in trainer_data.items()]

            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Trainer),
                cid=cid,  # ✅ Now properly defined
                object_pk=trainer.id,
                object_id=trainer.id,
                object_repr=f"Trainer ID: {trainer.trainer_id} | Name: {trainer.name}",
                action=LogEntry.Action.CREATE,
                changes=f"Created Trainer: {trainer_data} by {request.user.username}",
                serialized_data=json.dumps(model_to_dict(trainer), default=str),  # ✅ JSON serialized trainer data
                changes_text=" ".join(changes_text),
                additional_data="Trainer",
                actor=request.user,
                timestamp=now()
            )
            return Response({
                'message': 'Trainer added successfully',
                'trainer_id': trainer.trainer_id,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class EditTrainerAPIView(APIView):
    """API View to edit an existing trainer"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        """Handle PUT request to update trainer details"""
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        trainer = get_object_or_404(Trainer, id=id)
        old_trainer_data = model_to_dict(trainer)  # Get all old field values

        serializer = TrainerSerializer(trainer, data=request.data, partial=True, context={'request': request})

        if serializer.is_valid():
            old_email = trainer.email 
            trainer = serializer.save(last_update_coordinator=request.user)
            new_trainer_data = model_to_dict(trainer)  # Get new field values
            
            # ✅ Generate a unique correlation ID for logging
            cid = str(uuid.uuid4())  

            # ✅ Update User email if changed
            if old_email != serializer.validated_data.get('email'):
                user = User.objects.filter(email=old_email).first()
                if user:
                    user.email = serializer.validated_data.get('email')
                    user.save()

            # ✅ Track what changed
            changes = {}
            for field, old_value in old_trainer_data.items():
                new_value = new_trainer_data.get(field)
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

            # ✅ Check if status changed to Inactive
            if old_trainer_data.get('status') == "Active" and trainer.status == "Inactive":
                trainer.status_change_date = now().date()
                trainer.real_status = True
                trainer.save()  

            # ✅ Calculate inactive days
            inactive_days = trainer.calculate_inactive_days()

            # ✅ Log detailed update action
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Trainer),
                cid=cid,  # ✅ Now properly defined
                object_pk=trainer.id,
                object_id=trainer.id,
                object_repr=f"Trainer ID: {trainer.trainer_id} | Name: {trainer.name}",
                action=LogEntry.Action.UPDATE,
                changes=f"Updated trainer: {trainer.name} by {request.user.username}. Changes: {changes}",  # ✅ JSON serialized changes
                serialized_data=json.dumps(model_to_dict(trainer), default=str),  # ✅ JSON serialized trainer data
                changes_text=" ".join(changes_text),
                additional_data="Trainer",
                actor=request.user,
                timestamp=now()
            )

            return Response({
                'message': 'Trainer updated successfully',
                'trainer_id': trainer.trainer_id,
                'inactive_days': inactive_days
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class DeleteTrainerAPIView(APIView):
    """API View to delete a trainer"""
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        """Handle DELETE request to remove a trainer"""
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        trainer = get_object_or_404(Trainer, id=id)
        # ✅ Store trainer details before deleting
        trainer_data = {field.name: getattr(trainer, field.name, None) for field in Trainer._meta.fields}
        trainer_id = trainer.id
        trainer_id_no = trainer.trainer_id
        trainer_name = trainer.name

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

        # ✅ Log deletion
        changes_text = [f"Deleted field {field}: {value}" for field, value in trainer_data.items()]


        # ✅ Log deletion
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Trainer),
            cid=cid,  # ✅ Now properly defined
            object_pk=trainer_id,
            object_id=trainer_id,
            object_repr=f"Trainer ID: {trainer_id_no} | Name: {trainer_name}",
            action=LogEntry.Action.DELETE,
            changes=f"Created Trainer: {trainer_data} by {request.user.username}",
            actor=request.user,
            serialized_data=json.dumps(model_to_dict(trainer), default=str),  # ✅ JSON serialized trainer data
            changes_text=" ".join(changes_text),
            additional_data="Trainer",
            timestamp=now()
        )
        
        return Response({'message': 'Trainer, user account, and authentication token deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    



class TrainerInfoAPIView(APIView):
    authentication_classes = [JWTAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]
    
    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
        trainer = get_object_or_404(Trainer, id=id)
        today = date.today()

        # Fetch all timeslots except Bootcamp
        timeslots = Timeslot.objects.exclude(special_time_slot='Special')
        timeslot_dict = {ts.id: ts for ts in timeslots}  # Store in a dictionary for quick access

        # Initialize free trainers dictionary
        free_trainers = {
            trainer.id: {ts.id: [trainer, None] for ts in timeslots}
        }

        # Step 2: Update free trainers with last batch info
        for ts_id, timeslot in timeslot_dict.items():
            last_batch = Batch.objects.filter(Q(trainer=trainer) & Q(batch_time=timeslot)).order_by('end_date').last()
            free_trainers[trainer.id][ts_id][1] = last_batch

        # Step 3: Remove occupied timeslots for trainer
        running_batches = Batch.objects.filter(Q(trainer=trainer) & (Q(status="Running") | Q(status="Upcoming")))
        for batch in running_batches:
            ts_id = batch.batch_time.id  # Ensure ID is used
            if ts_id in free_trainers[trainer.id]:
                del free_trainers[trainer.id][ts_id]  # Remove occupied timeslot

        # Step 4: Compile current free trainers list
        current_free_trainers = []
        for trainer_id, timeslot_data in free_trainers.items():
            for ts_id, (trainer, batch) in timeslot_data.items():
                timeslot = timeslot_dict[ts_id]  # Fetch from preloaded dictionary
                end_date = batch.end_date if batch else None
                free_days = (today - end_date).days if end_date else 'No past Batch'
                
                current_free_trainers.append({
                    'start_time': timeslot.start_time,
                    'time_id': timeslot.id,
                    'end_time': timeslot.end_time,
                    'trainer_id': trainer.id,
                    'name': trainer.name,
                    'languages': trainer.languages,
                    'location': trainer.location.locality if trainer.location else None,
                    'location_id': trainer.location.id if trainer.location else None,
                    'email': trainer.email,
                    'phone': trainer.phone,
                    'end_date': end_date if end_date else 'No past Batch',
                    'free_days': free_days,
                    'course': list(Course.objects.filter(trainer=trainer).values_list('id', 'name')),
                    'week': timeslot.week_type,
                })

        # Sort free trainers by max free days first
        current_free_trainers.sort(
            key=lambda x: x['free_days'] if isinstance(x['free_days'], int) else float('-inf'), reverse=True
        )


        future_availability_trainers = []

        # for trainer in trainers:
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

        # Fetch logs for this Trainer
        trainer_ct = ContentType.objects.get_for_model(Trainer)
        trainer_logs = LogEntry.objects.filter(content_type=trainer_ct, object_id=trainer.id).order_by('-timestamp')
        serialized_logs = LogEntrySerializer(trainer_logs, many=True).data

        # Fetch trainer's batch data
        trainer_batches = {
            'Upcoming': list(Batch.objects.filter(trainer=trainer, status='Upcoming').select_related('course', 'batch_time')),
            'Ongoing': list(Batch.objects.filter(trainer=trainer, status='Running').select_related('course', 'batch_time')),
            'Completed': list(Batch.objects.filter(trainer=trainer, status='Completed').select_related('course', 'batch_time')),
            'Hold': list(Batch.objects.filter(trainer=trainer, status='Hold').select_related('course', 'batch_time')),
            'Free_Batch': current_free_trainers,  # Store sorted free batch trainers
            'Future_Batch': future_availability_trainers,
        }

        trainer_data = {'trainer': TrainerSerializer(trainer).data}

        for batch_status, batches in trainer_batches.items():
            if batch_status in ["Free_Batch", "Future_Batch"]:
                trainer_data[f'trainer_batch_{batch_status.lower()}'] = batches
            else:
                trainer_data[f'trainer_batch_{batch_status.lower()}'] = [
                    {
                        'batch_id': batch.id,
                        'batch_name': batch.batch_id,
                        'course_name': batch.course.name,
                        'batch_time_start': batch.batch_time.start_time,
                        'batch_time_end': batch.batch_time.end_time,
                        'batch_start_date': batch.start_date,
                        'batch_end_date': batch.end_date,
                        'batch_mode': batch.mode,
                        'batch_language': batch.language,
                        'batch_location': batch.location.locality if batch.location else None,
                        'batch_preferred_week': batch.preferred_week,
                        'students': list(batch.student.values('id', 'name'))  # Use correct related_name
                    }
                    for batch in batches
                ]

        return Response({'Trainer_All': trainer_data, 
            'trainer_logs':serialized_logs,}, status=status.HTTP_200_OK)




class TrainerLogListView(APIView):
    authentication_classes = [JWTAuthentication] 
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trainer_ct = ContentType.objects.get_for_model(Trainer)
        logs = LogEntry.objects.filter(content_type=trainer_ct).order_by('-timestamp')
        serializer = LogEntrySerializer(logs, many=True)
        return Response(serializer.data)


{
# class EditTrainerAPIView(APIView):
#     """API View to edit an existing trainer"""
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def put(self, request, id):
#         """Handle PUT request to update trainer details"""
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         trainer = get_object_or_404(Trainer, id=id)
#         old_trainer_data = model_to_dict(trainer)  # Get all old field values

#         serializer = TrainerSerializer(trainer, data=request.data, partial=True, context={'request': request})

#         if serializer.is_valid():
#             trainer = serializer.save(last_update_coordinator=request.user)
#             new_trainer_data = model_to_dict(trainer)  # Get new field values

#             # ✅ Track what changed
#             changes = {}
#             for field, old_value in old_trainer_data.items():
#                 new_value = new_trainer_data.get(field)
#                 if old_value != new_value:  # Only log changes
#                     changes[field] = {"old": old_value, "new": new_value}

#             # ✅ Update User email if changed
#             if old_trainer_data['email'] != serializer.validated_data.get('email'):
#                 try:
#                     user = User.objects.get(email=old_trainer_data['email'])
#                     user.email = serializer.validated_data.get('email')
#                     user.save()
#                 except User.DoesNotExist:
#                     return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)

#             # ✅ Check if status changed to Inactive
#             if old_trainer_data['status'] == "Active" and trainer.status == "Inactive":
#                 trainer.status_change_date = now().date()
#                 trainer.save()

#             # ✅ Calculate inactive days
#             inactive_days = trainer.calculate_inactive_days()

#             # ✅ Log detailed update action
#             LogEntry.objects.create(
#                 content_type=ContentType.objects.get_for_model(Trainer),
#                 cid=cid,
#                 object_pk=trainer.id,
#                 object_id=trainer.id,
#                 object_repr=f"Trainer ID: {trainer.trainer_id} | Name: {trainer.name}",
#                 action=LogEntry.Action.UPDATE,
#                 changes=f"Updated trainer: {trainer.name} by {request.user.username}. Changes: {changes}",
#                 serialized_data=json.dumps(model_to_dict(trainer), default=str),
#                 actor=request.user,
#                 timestamp=now()
#             )

#             return Response({
#                 'message': 'Trainer updated successfully',
#                 'trainer_id': trainer.trainer_id,
#                 'inactive_days': inactive_days
#             }, status=status.HTTP_200_OK)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
}




# This is for sending email when trainer on one day and half day leave.....
class TrainerLeaveMail(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        leave_status = request.data.get('leave_status')
        cutoff_time = time(hour=14, minute=30)

        try:
            trainer = Trainer.objects.select_related('coordinator').get(id=id)
        except Trainer.DoesNotExist:
            return Response({'error': 'Trainer not found'}, status=status.HTTP_404_NOT_FOUND)

        # Determine applicable timeslots
        timeslot_filter = Q()
        if leave_status == "First Half off":
            timeslot_filter = Q(start_time__lte=cutoff_time)
        elif leave_status == "Second Half off":
            timeslot_filter = Q(start_time__gt=cutoff_time)
        elif leave_status != "Full Day off":
            return Response({'message': 'Invalid leave status'}, status=status.HTTP_400_BAD_REQUEST)

        timeslots = Timeslot.objects.filter(timeslot_filter) if leave_status != "Full Day off" else Timeslot.objects.all()
        trainer.leave_status = leave_status
        trainer.leave_end_date = date.today()
        trainer.save(update_fields=["leave_status", "leave_end_date"])

        related_batches = Batch.objects.filter(trainer=trainer, batch_time__in=timeslots, status="Running").select_related("course", "batch_time")

        if not related_batches.exists():
            return Response({'message': f'No batches found for this trainer in {leave_status.lower()}.'}, status=status.HTTP_200_OK)

        session_date = now().strftime("%d %B %Y")

        for batch in related_batches:
            student_emails = BatchStudentAssignment.objects.filter(
                batch=batch
            ).exclude(student__email__isnull=True).values_list('student__email', flat=True).distinct()

            if not student_emails:
                continue

            batch_name = batch.course.name
            session_topic = f"{batch_name} (Offline and Online Training)"
            session_time = f"{batch.batch_time.start_time.strftime('%I:%M %p')} - {batch.batch_time.end_time.strftime('%I:%M %p')}"
            trainer_name = trainer.name
            coordinator = trainer.coordinator
            coordinator_name = getattr(coordinator, 'name', 'N/A')
            coordinator_phone = getattr(coordinator, 'phone', 'N/A')

            subject = f"Cancellation of Today’s Session: {session_topic} - {session_time}"

            html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>{subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">

            <!-- Header with Logo -->
            <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
            </div>

            <!-- Body -->
            <div style="padding: 30px;">
                <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px; color: #000;">❗<span style="color: #000;">Session Cancellation Notice</span></h2>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    <span style="color: #000;">Dear Students,</span>
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    <span style="color: #000;">We regret to inform you that your session scheduled for today, </span>
                    <strong style="color: #000;">{session_date}</strong>
                    <span style="color: #000;">, under the batch </span>
                    <strong style="color: #000;">{batch_name}</strong>
                    <span style="color: #000;"> has been </span>
                    <strong style="color: #000;">cancelled</strong><span style="color: #000;">.</span>
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    <span style="color: #000;">This is due to an urgent matter that requires the immediate attention of our trainer, </span>
                    <strong style="color: #000;">{trainer_name}</strong>
                    <span style="color: #000;">. We understand the inconvenience this may cause and sincerely apologize.</span>
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    <span style="color: #000;">We appreciate your understanding and cooperation in this matter. Please stay tuned for the rescheduled session details.</span>
                </p>

                <p style="margin: 5px 0; font-size: 16px; color: #000;">
                    <span style="color: #000;">For any further assistance, feel free to reach out to your batch coordinator:</span><br>
                    <span style="color: #000;">👤 Name: <strong style="color: #000;">{coordinator_name}</strong></span><br>
                    <span style="color: #000;">📱 Phone: <strong style="color: #000;">{coordinator_phone}</strong></span>
                </p>  

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    <span style="color: #000;">Warm regards,</span><br>
                    <strong style="color: #000;">Craw Cyber Security Team</strong>
                </p>

                <div style="margin-top: 20px; font-size: 14px; line-height: 1.6;">
                    <p style="color: #000;"><strong style="color: #000;">📞 Contact:</strong> <span style="color: #000;">011-40394315 | +91-9650202445, +91-9650677445</span></p>
                    <p style="color: #000;"><strong>📧 Email:</strong> <a href="mailto:training@craw.in" style="text-decoration: underline;">training@craw.in</a></p>
                    <p style="color: #000;"><strong>🌐 Website:</strong> <a href="https://www.craw.in/" style="text-decoration: underline;">www.craw.in</a></p>
                    <p style="color: #000;">
                        <strong style="color: #000;">🏢 Address:</strong><br>
                        <span style="color: #000;">
                            1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                            Behind Saket Metro Station, New Delhi – 110030
                        </span>
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #000;">© 2025 <strong style="color: #000;">Craw Cyber Security Pvt Ltd</strong>. <span style="color: #000;">All Rights Reserved.</span></p>
                <p style="margin: 5px 0 0; color: #000;"><span style="color: #000;">This is an automated message. Please do not reply.</span></p>
            </div>
        </div>
        </body>
        </html>
                """

            try:
                email = EmailMessage(subject, html_message, "CRAW SECURITY BATCH <training@craw.in>", list(student_emails))
                email.content_subtype = "html"
                email.send(fail_silently=False)
                sleep_time.sleep(0.1)  # throttle control
            except Exception as e:
                return Response({'error': f"Failed to send email for batch {batch.id}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': f'Leave recorded and mail sent for {leave_status.lower()}.',
            'slots': list(timeslots.values('id', 'start_time', 'end_time')),
        }, status=status.HTTP_200_OK)




# This is for sending email when trainer on long leave
class TrainerLongLeaveMail(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        trainer = get_object_or_404(Trainer.objects.select_related('coordinator'), id=id)

        leave_status = request.data.get('leave_status')
        start_date = parse_date(request.data.get('start_date'))
        end_date = parse_date(request.data.get('end_date'))

        if not (leave_status == "custom" and start_date and end_date):
            return Response({'error': 'Missing or invalid leave_status/start_date/end_date.'}, status=status.HTTP_400_BAD_REQUEST)

        related_batches = Batch.objects.filter(
            trainer=trainer,
            start_date__lte=start_date,
            end_date__gte=end_date
        ).select_related('course', 'batch_time')

        trainer.leave_status = leave_status
        trainer.leave_end_date = end_date
        trainer.save(update_fields=["leave_status", "leave_end_date"])

        if not related_batches.exists():
            return Response({'message': 'No batches found for the given dates.'}, status=status.HTTP_404_NOT_FOUND)

        for batch in related_batches:
            student_emails = BatchStudentAssignment.objects.filter(
                batch=batch
            ).exclude(
                student__email__isnull=True
            ).values_list(
                'student__email', flat=True
            ).distinct()

            if not student_emails:
                continue

            session_topic = f"{batch.course.name} (Offline and Online Training)"
            session_time = f"{batch.batch_time.start_time.strftime('%I:%M %p')} - {batch.batch_time.end_time.strftime('%I:%M %p')}"
            trainer_name = trainer.name
            coordinator_name = getattr(trainer.coordinator, 'name', 'N/A')
            coordinator_phone = getattr(trainer.coordinator, 'phone', 'N/A')
            subject = f"Cancellation of Today’s Session: {session_topic} - {session_time}"

            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>{subject}</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                    <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
                </div>
                <div style="padding: 30px;">
                    <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px; color: #000;">❗Session Cancellation Notice</h2>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #000;">Dear Students,</p>

                    <p style="font-size: 16px; line-height: 1.6; color: #000;">
                        We regret to inform you that your classes scheduled between 
                        <strong style="color: #000;">{start_date.strftime('%d %B %Y')}</strong> and 
                        <strong style="color: #000;">{end_date.strftime('%d %B %Y')}</strong> 
                        have been put on hold due to a personal reason concerning your trainer, 
                        <strong style="color: #000;">{trainer_name}</strong>.
                    </p>

                    <p style="font-size: 16px; line-height: 1.6; color: #000;">
                        We understand this may cause inconvenience, and we sincerely apologize for the disruption. 
                        Please rest assured that we are working to reschedule the sessions, and we will update you with further information soon.
                    </p>

                    <p style="margin: 5px 0; font-size: 16px; color: #000;">
                        For any further assistance, feel free to reach out to your batch coordinator:<br>
                        <span style="color: #000;">👤 Name: <strong style="color: #000;">{coordinator_name}</strong></span><br>
                        <span style="color: #000;">📱 Phone: <strong style="color: #000;">{coordinator_phone}</strong></span>
                    </p>  

                    <p style="font-size: 16px; line-height: 1.6; color: #000;">Thank you for your patience and understanding.</p>

                    <p style="font-size: 16px; line-height: 1.6; color: #000;">
                        Best regards,<br>
                        <strong style="color: #000;">Craw Cyber Security Team</strong>
                    </p>

                    <div style="margin-top: 20px; font-size: 14px; line-height: 1.6;">
                        <p style="color: #000;"><strong style="color: #000;">📞 Contact:</strong> <span style="color: #000;">011-40394315 | +91-9650202445, +91-9650677445</span></p>
                        <p style="color: #000;"><strong>📧 Email:</strong> <a href="mailto:training@craw.in" style="text-decoration: underline;">training@craw.in</a></p>
                        <p style="color: #000;"><strong>🌐 Website:</strong> <a href="https://www.craw.in/" style="text-decoration: underline;">www.craw.in</a></p>
                        <p style="color: #000;">
                            <strong style="color: #000;">🏢 Address:</strong> 
                            <span style="color: #000;">
                                1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                                Behind Saket Metro Station, New Delhi – 110030
                            </span>
                        </p>
                    </div>
                </div>
                <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; border-top: 1px solid #ddd;">
                    <p style="margin: 0; color: #000;">© 2025 <strong style="color: #000;">Craw Cyber Security Pvt Ltd</strong>. All rights reserved.</p>
                    <p style="margin: 5px 0 0; color: #000;">This is an automated message. Please do not reply.</p>
                </div>
            </div>
            </body>
            </html>
        """
            try:
                email = EmailMessage(subject, html_message, "CRAW SECURITY BATCH <training@craw.in>", list(student_emails))
                email.content_subtype = "html"
                email.send()
                sleep_time.sleep(0.1)  # throttling for safety
            except Exception as e:
                return Response({'error': f"Failed to send email for batch {batch.id}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': f'Leave recorded and emails sent for {leave_status.lower()}.'
        }, status=status.HTTP_200_OK)
