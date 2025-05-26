# from rest_framework.response import Response
# from rest_framework.views import APIView
# from django.shortcuts import get_object_or_404
# from .models import *
# from .serializer import CoordinatorSerializer
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from nexus.serializer import UserRegistrationSerializer, LogEntrySerializer
# from Student.models import Student
# from Student.serializer import StudentSerializer
# from rest_framework.authentication import TokenAuthentication
# from rest_framework.authtoken.models import Token
# from nexus.models import Batch, CustomUser
# from Trainer.models import Trainer
# from Trainer.serializer import TrainerSerializer
# from django.contrib.auth import get_user_model
# from auditlog.models import LogEntry
# from django.contrib.contenttypes.models import ContentType
# from django.forms.models import model_to_dict
# from django.utils.timezone import now
# import json
# import uuid

# # from django.contrib.auth.models import User
# User = get_user_model()
# cid = str(uuid.uuid4())
# # Create your views here.

# class CoordinatorListView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         coordinators = Coordinator.objects.all()
#         serializer = CoordinatorSerializer(coordinators, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
        

# class StudentsUnderCoordinatorView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id):
#         """Fetch all students assigned under a specific coordinator"""
        
#         # Ensure only admins and coordinators can access
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         # Check if the coordinator exists
#         try:
#             coordinator = Coordinator.objects.get(id=id)
#         except Coordinator.DoesNotExist:
#             return Response({'error': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

#         # Retrieve students assigned under this coordinator
#         students = Student.objects.filter(support_coordinator=coordinator)

#         # Serialize student data
#         serializer = StudentSerializer(students, many=True)

#         return Response(serializer.data, status=status.HTTP_200_OK)
    


# class TrainerUnderCoordinatorView(APIView):
#     def get(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         try:
#             coordinator = Coordinator.objects.get(id=id)
#         except Coordinator.DoesNotExist:
#             return Response({'error': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

#         trainers = Trainer.objects.filter(coordinator=coordinator)

#         serializer = TrainerSerializer(trainers, many=True)

#         return Response(serializer.data, status=status.HTTP_200_OK)


# class CoordinatorCreateAPIView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         """Handle POST request to create a new coordinator"""
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         serializer = CoordinatorSerializer(data=request.data)
#         if serializer.is_valid():
#             coordinator = serializer.save()  # This also creates a User

#             # ✅ Generate a unique correlation ID
#             cid = str(uuid.uuid4())

#             # ✅ Store coordinator details
#             coordinator_data = {field.name: getattr(coordinator, field.name, None) for field in Coordinator._meta.fields}

#             # ✅ Generate changes text
#             changes_text = [f"Added field {field}: {value}" for field, value in coordinator_data.items()]

#             # ✅ Log creation
#             LogEntry.objects.create(
#                 content_type=ContentType.objects.get_for_model(Coordinator),
#                 cid=cid,
#                 object_pk=coordinator.id,
#                 object_id=coordinator.id,
#                 object_repr=f"Coordinator ID: {coordinator.coordinator_id} | Name: {coordinator.name}",
#                 action=LogEntry.Action.CREATE,
#                 changes=f"Created Trainer: {coordinator_data} by {request.user.username}",
#                 serialized_data=json.dumps(coordinator_data, default=str),
#                 changes_text=" ".join(changes_text),
#                 additional_data="Coordinator",
#                 actor=request.user,
#                 timestamp=now()
#             )

#             return Response({
#                 "message": "Coordinator created successfully",
#                 "coordinator_id": coordinator.coordinator_id
#             }, status=status.HTTP_201_CREATED)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# class CoordinatorEditAPIView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
    
#     def put(self, request, id):
#         """Handle PUT request to update an existing coordinator"""
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         try:
#             coordinator = Coordinator.objects.get(id=id)
#         except Coordinator.DoesNotExist:
#             return Response({'detail': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

#         old_email = coordinator.email  # Store old email
#         old_data = model_to_dict(coordinator)  # Store old field values
        
#         serializer = CoordinatorSerializer(coordinator, data=request.data, partial=True)

#         if serializer.is_valid():
#             coordinator = serializer.save()  # Save the updated data
#             new_data = model_to_dict(coordinator)  # Get new field values

#             # ✅ Generate a unique correlation ID
#             cid = str(uuid.uuid4())

#             # ✅ Track changes
#             changes = {}
#             for field, old_value in old_data.items():
#                 new_value = new_data.get(field)
#                 if old_value != new_value:
#                     changes[field] = {"old": str(old_value), "new": str(new_value)}

#             changes_text = [f"Updated {field} from {change['old']} to {change['new']}" for field, change in changes.items()]


#             # ✅ Update User email if changed
#             if old_email != serializer.validated_data.get('email'):
#                 user = User.objects.filter(email=old_email).first()
#                 if user:
#                     user.email = serializer.validated_data.get('email')
#                     user.save()

#             # ✅ Log update
#             LogEntry.objects.create(
#                 content_type=ContentType.objects.get_for_model(Coordinator),
#                 cid=cid,
#                 object_pk=coordinator.id,
#                 object_id=coordinator.id,
#                 object_repr=f"Coordinator ID: {coordinator.coordinator_id} | Name: {coordinator.name}",
#                 action=LogEntry.Action.UPDATE,
#                 changes=f"Updated trainer: {coordinator.name} by {request.user.username}. Changes: {changes}",
#                 serialized_data=json.dumps(new_data, default=str),
#                 changes_text=" ".join(changes_text),
#                 additional_data="Coordinator",
#                 actor=request.user,
#                 timestamp=now()
#             )

#             return Response({"message": "Coordinator updated successfully", "coordinator_id": coordinator.coordinator_id}, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# class CoordinatorDeleteAPIView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
    
#     def delete(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         coordinator = get_object_or_404(Coordinator, id=id)
        
#         # ✅ Store coordinator details before deleting
#         coordinator_data = {field.name: getattr(coordinator, field.name, None) for field in Coordinator._meta.fields}
#         coordinator_id = coordinator.id
#         coordinator_id_no = coordinator.coordinator_id
#         coordinator_name = coordinator.name
        
#         try:
#             user = User.objects.get(username=coordinator.coordinator_id)  # Get user by coordinator ID
#         except User.DoesNotExist:
#             return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)
        
#         # ✅ Delete authentication tokens
#         Token.objects.filter(user=user).delete()
        
#         # ✅ Delete coordinator record
#         coordinator.delete()
        
#         # ✅ Delete associated user
#         user.delete()
        
#         # ✅ Log deletion
#         changes_text = [f"Deleted field {field}: {value}" for field, value in coordinator_data.items()]
        
#         LogEntry.objects.create(
#             content_type=ContentType.objects.get_for_model(Coordinator),
#             cid=str(uuid.uuid4()),  # ✅ Generate a unique correlation ID
#             object_pk=coordinator_id,
#             object_id=coordinator_id,
#             object_repr=f"Coordinator ID: {coordinator_id_no} | Name: {coordinator_name}",
#             action=LogEntry.Action.DELETE,
#             changes=f"Deleted Coordinator: {coordinator_data} by {request.user.username}",
#             actor=request.user,
#             serialized_data=json.dumps(coordinator_data, default=str),  # ✅ JSON serialized coordinator data
#             changes_text=" ".join(changes_text),
#             additional_data="Coordinator",
#             timestamp=now()
#         )
        
#         return Response({'message': 'Coordinator, user account, and authentication token deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# class CoordinatorInfoAPIView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
                
#         coordinator = get_object_or_404(Coordinator, id=id)

#         coordinator_batch_upcomimg = Batch.objects.filter(batch_coordinator=coordinator, status = 'Upcoming')
#         coordinator_batch_completed = Batch.objects.filter(batch_coordinator=coordinator, status = 'Completed')
#         coordinator_batch_ongoing = Batch.objects.filter(batch_coordinator=coordinator, status='Running')
#         coordinator_batch_hold = Batch.objects.filter(batch_coordinator=coordinator, status='Hold')

#         # Fetch logs for this coordinator
#         coordinator_ct = ContentType.objects.get_for_model(Coordinator)
#         coordinator_logs = LogEntry.objects.filter(content_type=coordinator_ct, object_id=coordinator.id).order_by('-timestamp')
#         serializer_logs = LogEntrySerializer(coordinator_logs, many=True).data

#         # Fetch activity logs for this coordinator
#         user = User.objects.get(username=coordinator.coordinator_id)
#         activity_logs = LogEntry.objects.filter(actor=user).order_by('-timestamp')
#         activity_serializer_logs = LogEntrySerializer(activity_logs, many=True).data

#         Coordinator_Info = {
#             'coordinator':CoordinatorSerializer(coordinator).data,
#             'coordinator_batch_upcomimg':list(coordinator_batch_upcomimg.values()),
#             'coordinator_batch_ongoing':list(coordinator_batch_ongoing.values()),
#             'coordinator_batch_completed':list(coordinator_batch_completed.values()),
#             'coordinator_batch_hold':list(coordinator_batch_hold.values()),
#             'coordinator_logs':serializer_logs,
#             'activity_logs':activity_serializer_logs,
#         }


#         return Response({'Coordinator_Info':Coordinator_Info}, status=status.HTTP_200_OK)
    

# class CoordinatorLogListView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error':'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         coordinator_ct = ContentType.objects.get_for_model(Coordinator)
#         logs = LogEntry.objects.filter(content_type=coordinator_ct).order_by('=timestamp')
#         serializer = LogEntrySerializer(logs, many=True)
#         return Response(serializer.data)
    

from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import *
from .serializer import CoordinatorSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from nexus.serializer import UserRegistrationSerializer, LogEntrySerializer
from Student.models import Student
from Student.serializer import StudentSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from nexus.models import Batch, CustomUser
from Trainer.models import Trainer
from Trainer.serializer import TrainerSerializer
from django.contrib.auth import get_user_model
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from rest_framework.pagination import PageNumberPagination
from django.forms.models import model_to_dict
from django.utils.timezone import now
import json
import uuid
from rest_framework_simplejwt.authentication import JWTAuthentication


# from django.contrib.auth.models import User
User = get_user_model()
cid = str(uuid.uuid4())
# Create your views here.

class CoordinatorListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        coordinators = Coordinator.objects.all()
        serializer = CoordinatorSerializer(coordinators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        

class StudentsUnderCoordinatorView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """Fetch all students assigned under a specific coordinator"""
        
        # Ensure only admins and coordinators can access
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the coordinator exists
        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'error': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve students assigned under this coordinator
        students = Student.objects.filter(support_coordinator=coordinator)

        # Serialize student data
        serializer = StudentSerializer(students, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    


class TrainerUnderCoordinatorView(APIView):
    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'error': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        trainers = Trainer.objects.filter(coordinator=coordinator)

        serializer = TrainerSerializer(trainers, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class CoordinatorCreateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle POST request to create a new coordinator"""
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CoordinatorSerializer(data=request.data)
        if serializer.is_valid():
            coordinator = serializer.save()  # This also creates a User

            # ✅ Generate a unique correlation ID
            cid = str(uuid.uuid4())

            # ✅ Store coordinator details
            coordinator_data = {field.name: getattr(coordinator, field.name, None) for field in Coordinator._meta.fields}

            # ✅ Generate changes text
            changes_text = [f"Added field {field}: {value}" for field, value in coordinator_data.items()]

            # ✅ Log creation
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Coordinator),
                cid=cid,
                object_pk=coordinator.id,
                object_id=coordinator.id,
                object_repr=f"Coordinator ID: {coordinator.coordinator_id} | Name: {coordinator.name}",
                action=LogEntry.Action.CREATE,
                changes=f"Created Trainer: {coordinator_data} by {request.user.username}",
                serialized_data=json.dumps(coordinator_data, default=str),
                changes_text=" ".join(changes_text),
                additional_data="Coordinator",
                actor=request.user,
                timestamp=now()
            )

            return Response({
                "message": "Coordinator created successfully",
                "coordinator_id": coordinator.coordinator_id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class CoordinatorEditAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        """Handle PUT request to update an existing coordinator"""
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'detail': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        old_email = coordinator.email  # Store old email
        old_data = model_to_dict(coordinator)  # Store old field values
        
        serializer = CoordinatorSerializer(coordinator, data=request.data, partial=True)

        if serializer.is_valid():
            coordinator = serializer.save()  # Save the updated data
            new_data = model_to_dict(coordinator)  # Get new field values

            # ✅ Generate a unique correlation ID
            cid = str(uuid.uuid4())

            # ✅ Track changes
            changes = {}
            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if old_value != new_value:
                    changes[field] = {"old": str(old_value), "new": str(new_value)}

            changes_text = [f"Updated {field} from {change['old']} to {change['new']}" for field, change in changes.items()]


            # ✅ Update User email if changed
            if old_email != serializer.validated_data.get('email'):
                user = User.objects.filter(email=old_email).first()
                if user:
                    user.email = serializer.validated_data.get('email')
                    user.save()

            # ✅ Log update
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Coordinator),
                cid=cid,
                object_pk=coordinator.id,
                object_id=coordinator.id,
                object_repr=f"Coordinator ID: {coordinator.coordinator_id} | Name: {coordinator.name}",
                action=LogEntry.Action.UPDATE,
                changes=f"Updated trainer: {coordinator.name} by {request.user.username}. Changes: {changes}",
                serialized_data=json.dumps(new_data, default=str),
                changes_text=" ".join(changes_text),
                additional_data="Coordinator",
                actor=request.user,
                timestamp=now()
            )

            return Response({"message": "Coordinator updated successfully", "coordinator_id": coordinator.coordinator_id}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class CoordinatorDeleteAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        coordinator = get_object_or_404(Coordinator, id=id)
        
        # ✅ Store coordinator details before deleting
        coordinator_data = {field.name: getattr(coordinator, field.name, None) for field in Coordinator._meta.fields}
        coordinator_id = coordinator.id
        coordinator_id_no = coordinator.coordinator_id
        coordinator_name = coordinator.name
        
        try:
            user = User.objects.get(username=coordinator.coordinator_id)  # Get user by coordinator ID
        except User.DoesNotExist:
            return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ Delete authentication tokens
        Token.objects.filter(user=user).delete()
        
        # ✅ Delete coordinator record
        coordinator.delete()
        
        # ✅ Delete associated user
        user.delete()
        
        # ✅ Log deletion
        changes_text = [f"Deleted field {field}: {value}" for field, value in coordinator_data.items()]
        
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Coordinator),
            cid=str(uuid.uuid4()),  # ✅ Generate a unique correlation ID
            object_pk=coordinator_id,
            object_id=coordinator_id,
            object_repr=f"Coordinator ID: {coordinator_id_no} | Name: {coordinator_name}",
            action=LogEntry.Action.DELETE,
            changes=f"Deleted Coordinator: {coordinator_data} by {request.user.username}",
            actor=request.user,
            serialized_data=json.dumps(coordinator_data, default=str),  # ✅ JSON serialized coordinator data
            changes_text=" ".join(changes_text),
            additional_data="Coordinator",
            timestamp=now()
        )
        
        return Response({'message': 'Coordinator, user account, and authentication token deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# class CoordinatorInfoAPIView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
                
#         coordinator = get_object_or_404(Coordinator, id=id)

#         coordinator_batch_upcomimg = Batch.objects.filter(batch_coordinator=coordinator, status = 'Upcoming')
#         coordinator_batch_completed = Batch.objects.filter(batch_coordinator=coordinator, status = 'Completed')
#         coordinator_batch_ongoing = Batch.objects.filter(batch_coordinator=coordinator, status='Running')
#         coordinator_batch_hold = Batch.objects.filter(batch_coordinator=coordinator, status='Hold')

#         # Fetch logs for this coordinator
#         coordinator_ct = ContentType.objects.get_for_model(Coordinator)
#         coordinator_logs = LogEntry.objects.filter(content_type=coordinator_ct, object_id=coordinator.id).order_by('-timestamp')
#         serializer_logs = LogEntrySerializer(coordinator_logs, many=True).data

#         # Fetch activity logs for this coordinator
#         user = User.objects.get(username=coordinator.coordinator_id)
#         activity_logs = LogEntry.objects.filter(actor=user).order_by('-timestamp')
#         activity_serializer_logs = LogEntrySerializer(activity_logs, many=True).data

#         Coordinator_Info = {
#             'coordinator':CoordinatorSerializer(coordinator).data,
#             'coordinator_batch_upcomimg':list(coordinator_batch_upcomimg.values()),
#             'coordinator_batch_ongoing':list(coordinator_batch_ongoing.values()),
#             'coordinator_batch_completed':list(coordinator_batch_completed.values()),
#             'coordinator_batch_hold':list(coordinator_batch_hold.values()),
#             'coordinator_logs':serializer_logs,
#             'activity_logs':activity_serializer_logs,
#         }


#         return Response({'Coordinator_Info':Coordinator_Info}, status=status.HTTP_200_OK)


# 🔹 Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100





class CoordinatorInfoAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def paginate_queryset(self, queryset, request):
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        return page, paginator

    def append_type_param(self, link, type_value):
        if link:
            if "?" in link:
                return f"{link}&type={type_value}"
            return f"{link}?type={type_value}"
        return None

    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        coordinator = get_object_or_404(Coordinator, id=id)

        log_type = request.query_params.get('type')
        coordinator_ct = ContentType.objects.get_for_model(Coordinator)
        user = User.objects.get(username=coordinator.coordinator_id)

        # Separate paginated fetch for logs or activity logs
        if log_type == 'coordinator_logs':
            logs_qs = LogEntry.objects.filter(content_type=coordinator_ct, object_id=coordinator.id).order_by('-timestamp')
            paginated, paginator = self.paginate_queryset(logs_qs, request)
            serializer = LogEntrySerializer(paginated, many=True)
            return paginator.get_paginated_response(serializer.data)

        elif log_type == 'activity_logs':
            logs_qs = LogEntry.objects.filter(actor=user).order_by('-timestamp')
            paginated, paginator = self.paginate_queryset(logs_qs, request)
            serializer = LogEntrySerializer(paginated, many=True)
            return paginator.get_paginated_response(serializer.data)

        # Default full coordinator info with paginated logs
        coordinator_batch_upcomimg = Batch.objects.filter(batch_coordinator=coordinator, status='Upcoming')
        coordinator_batch_completed = Batch.objects.filter(batch_coordinator=coordinator, status='Completed')
        coordinator_batch_ongoing = Batch.objects.filter(batch_coordinator=coordinator, status='Running')
        coordinator_batch_hold = Batch.objects.filter(batch_coordinator=coordinator, status='Hold')

        # Paginate coordinator logs
        coordinator_logs_qs = LogEntry.objects.filter(content_type=coordinator_ct, object_id=coordinator.id).order_by('-timestamp')
        coordinator_logs_page, paginator_logs = self.paginate_queryset(coordinator_logs_qs, request)
        coordinator_logs_data = LogEntrySerializer(coordinator_logs_page, many=True).data

        # Paginate activity logs
        activity_logs_qs = LogEntry.objects.filter(actor=user).order_by('-timestamp')
        activity_logs_page, paginator_activities = self.paginate_queryset(activity_logs_qs, request)
        activity_logs_data = LogEntrySerializer(activity_logs_page, many=True).data

        Coordinator_Info = {
            'coordinator': CoordinatorSerializer(coordinator).data,
            'coordinator_batch_upcomimg': list(coordinator_batch_upcomimg.values()),
            'coordinator_batch_ongoing': list(coordinator_batch_ongoing.values()),
            'coordinator_batch_completed': list(coordinator_batch_completed.values()),
            'coordinator_batch_hold': list(coordinator_batch_hold.values()),

            # Coordinator Logs with paginated URLs
            'coordinator_logs': coordinator_logs_data,
            'coordinator_logs_count': paginator_logs.page.paginator.count,
            'coordinator_logs_next': self.append_type_param(paginator_logs.get_next_link(), 'coordinator_logs'),
            'coordinator_logs_previous': self.append_type_param(paginator_logs.get_previous_link(), 'coordinator_logs'),

            # Activity Logs with paginated URLs
            'activity_logs': activity_logs_data,
            'activity_logs_count': paginator_activities.page.paginator.count,
            'activity_logs_next': self.append_type_param(paginator_activities.get_next_link(), 'activity_logs'),
            'activity_logs_previous': self.append_type_param(paginator_activities.get_previous_link(), 'activity_logs'),
        }

        return Response({'Coordinator_Info': Coordinator_Info}, status=status.HTTP_200_OK)






class CoordinatorLogListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = LogEntrySerializer
    pagination_class = StandardResultsSetPagination


    def get_queryset(self):
        user = self.request.user

        if user.role not in ['admin', 'coordinator']:
            return LogEntry.objects.none()
        
        coordinator_ct = ContentType.objects.get_for_model(Coordinator)
        queryset = LogEntry.objects.filter(content_type=coordinator_ct).order_by('-timestamp')

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

