# Built-in imports
import json  # For serializing data before saving logs
import uuid  # For generating unique correlation IDs

# Local app models
from .models import *  # Imports all models from the current app (Coordinator-related models)

# Related app models
from nexus.models import Batch  # For fetching batch data related to coordinators
from Trainer.models import Trainer  # To access Trainer model and data
from Student.models import Student  # To access Student model and data

# Logging/Audit trail
from auditlog.models import LogEntry  # For creating log entries for create/update/delete actions

# Django utilities
from django.utils.timezone import now  # To get current timestamp
from django.forms.models import model_to_dict  # To convert model instances to Python dictionaries
from django.shortcuts import get_object_or_404  # To fetch objects or raise 404 if not found
from django.contrib.auth import get_user_model  # To get the currently used User model
from django.contrib.contenttypes.models import ContentType  # To associate logs with model types

# DRF core
from rest_framework import status  # For standard HTTP status codes
from rest_framework.views import APIView  # For building class-based API views
from rest_framework.response import Response  # To return API responses
from rest_framework.permissions import IsAuthenticated  # To allow only authenticated users
from rest_framework.pagination import PageNumberPagination  # For paginating API results

# DRF Authentication
from rest_framework_simplejwt.authentication import JWTAuthentication  # For JWT-based authentication
from rest_framework.authtoken.models import Token  # Used for deleting tokens during coordinator deletion

# Serializers
from .serializer import CoordinatorSerializer  # Serializer for Coordinator data
from Student.serializer import StudentSerializer  # Serializer for Student model
from Trainer.serializer import TrainerSerializer  # Serializer for Trainer model
from nexus.serializer import LogEntrySerializer  # Serializer for LogEntry (logs)
from nexus.JWTCookie import JWTAuthFromCookie

# Initialize a global correlation ID (for example usage — not recommended globally in real apps)
User = get_user_model()  # Reference to custom User model
cid = str(uuid.uuid4())  # Generate a unique correlation ID



# API View to get a list of all Coordinators
class CoordinatorListView(APIView):
    # Use JWT authentication to verify user identity
    authentication_classes = [JWTAuthFromCookie]
    # Ensure that only authenticated users can access this view
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Allow access only to users with role 'admin' or 'coordinator'
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch all coordinator records from the database
        coordinators = Coordinator.objects.all()
        
        # Serialize the coordinator queryset into JSON format
        serializer = CoordinatorSerializer(coordinators, many=True)
        
        # Return serialized coordinator data with HTTP 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)











# This API view fetches all students assigned to a specific coordinator
class StudentsUnderCoordinatorView(APIView):
    # Enforce JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    # Allow only authenticated users to access the view
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """
        GET method to fetch all students under a specific coordinator.
        The coordinator ID is passed through the URL.
        """

        # Allow access only for users with role 'admin' or 'coordinator'
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Attempt to retrieve the coordinator by ID
        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'error': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all students who are assigned to this coordinator
        students = Student.objects.filter(support_coordinator=coordinator)

        # Serialize the list of student objects
        serializer = StudentSerializer(students, many=True)

        # Return the serialized data with HTTP 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)


 
# API view to get a list of trainers assigned under a specific coordinator
class TrainerUnderCoordinatorView(APIView):
    # Enforce JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    # Ensure only authenticated users can access the API
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """
        GET method to fetch all trainers under a specific coordinator.
        Coordinator ID is passed as a URL parameter.
        """

        # Allow access only to users with 'admin' or 'coordinator' roles
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Try to retrieve the coordinator with the given ID
        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'error': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all trainers assigned to this coordinator
        trainers = Trainer.objects.filter(coordinator=coordinator)

        # Serialize the list of trainer objects
        serializer = TrainerSerializer(trainers, many=True)

        # Return the serialized trainer data with HTTP 200 OK
        return Response(serializer.data, status=status.HTTP_200_OK)



# API View to handle the creation of a new coordinator
class CoordinatorCreateAPIView(APIView):
    # Enforce JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    # Ensure only authenticated users can access the view
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        POST method to create a new Coordinator.
        Accessible only to users with 'admin' or 'coordinator' roles.
        """

        # Role-based access control
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Deserialize and validate incoming data
        serializer = CoordinatorSerializer(data=request.data)
        if serializer.is_valid():
            # Save coordinator (creates linked User as well if logic is in serializer)
            coordinator = serializer.save()

            # ✅ Generate a unique Correlation ID for tracking/logging
            cid = str(uuid.uuid4())

            # ✅ Extract all coordinator fields into a dictionary for logging
            coordinator_data = {
                field.name: getattr(coordinator, field.name, None)
                for field in Coordinator._meta.fields
            }

            # ✅ Format the change log as a list of "Added field ..." messages
            changes_text = [
                f"Added field {field}: {value}" for field, value in coordinator_data.items()
            ]

            # ✅ Create a log entry to keep audit trail of coordinator creation
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Coordinator),
                cid=cid,
                object_pk=coordinator.id,
                object_id=coordinator.id,
                object_repr=f"Coordinator ID: {coordinator.coordinator_id} | Name: {coordinator.name}",
                action=LogEntry.Action.CREATE,
                changes=f"Created Coordinator: {coordinator_data} by {request.user.username}",
                serialized_data=json.dumps(coordinator_data, default=str),
                changes_text=" ".join(changes_text),
                additional_data="Coordinator",
                actor=request.user,
                timestamp=now()
            )

            # ✅ Return a success response with coordinator ID
            return Response({
                "message": "Coordinator created successfully",
                "coordinator_id": coordinator.coordinator_id
            }, status=status.HTTP_201_CREATED)

        # ❌ Return validation errors if input data is not valid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# API view to handle coordinator updates
class CoordinatorEditAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        """
        Update an existing Coordinator's details.
        Allowed roles: admin, coordinator.
        """

        # ✅ Role-based access control
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Fetch the coordinator by ID
        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'detail': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        old_email = coordinator.email  # Save old email for comparison
        old_data = model_to_dict(coordinator)  # Convert current state to dict

        # ✅ Deserialize and validate incoming update data (partial=True allows partial update)
        serializer = CoordinatorSerializer(coordinator, data=request.data, partial=True)

        if serializer.is_valid():
            coordinator = serializer.save()  # Save updates to DB
            new_data = model_to_dict(coordinator)  # New state after update
            cid = str(uuid.uuid4())  # Unique log correlation ID

            # ✅ Track changes between old and new data
            changes = {}
            human_readable_changes = []
            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if str(old_value) != str(new_value):  # Detect actual change
                    changes[field] = {
                        "old": str(old_value),
                        "new": str(new_value)
                    }
                    human_readable_changes.append(
                        f"{request.user.username} changed '{field}' of Coordinator '{old_data.get('name')}' "
                        f"from '{old_value}' to '{new_value}'."
                    )

            # ✅ Update the associated user's email if it changed
            if old_email != serializer.validated_data.get('email'):
                user = User.objects.filter(email=old_email).first()
                if user:
                    user.email = serializer.validated_data.get('email')
                    user.save()

            # ✅ Log the update in LogEntry
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Coordinator),
                cid=cid,
                object_pk=coordinator.id,
                object_id=coordinator.id,
                object_repr=f"Coordinator ID: {coordinator.coordinator_id} | Name: {coordinator.name}",
                action=LogEntry.Action.UPDATE,
                changes=json.dumps(changes, indent=2),
                serialized_data=json.dumps(new_data, default=str),
                changes_text=" ".join(human_readable_changes),
                additional_data="Coordinator",
                actor=request.user,
                timestamp=now()
            )

            return Response({
                "message": "Coordinator updated successfully",
                "coordinator_id": coordinator.coordinator_id
            }, status=status.HTTP_200_OK)

        # ❌ Return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# API View to delete a Coordinator along with the associated User and auth tokens
class CoordinatorDeleteAPIView(APIView):
    # Enforce JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    # Allow only authenticated users
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        """
        DELETE method to remove a Coordinator and their associated User and auth tokens.
        Only users with 'admin' or 'coordinator' roles are allowed.
        """

        # Check if user has proper access rights
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Retrieve coordinator or return 404 if not found
        coordinator = get_object_or_404(Coordinator, id=id)

        # ✅ Backup coordinator data for logging before deletion
        coordinator_data = {
            field.name: getattr(coordinator, field.name, None)
            for field in Coordinator._meta.fields
        }
        coordinator_id = coordinator.id
        coordinator_id_no = coordinator.coordinator_id
        coordinator_name = coordinator.name

        # ✅ Attempt to fetch associated user using coordinator ID as username
        try:
            user = User.objects.get(username=coordinator_id_no)
        except User.DoesNotExist:
            return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Delete any authentication tokens associated with the user
        Token.objects.filter(user=user).delete()

        # ✅ Delete the coordinator record
        coordinator.delete()

        # ✅ Delete the linked user account
        user.delete()

        # ✅ Generate human-readable deletion log
        changes_text = [
            f"Deleted field {field}: {value}" for field, value in coordinator_data.items()
        ]

        # ✅ Log the deletion action
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Coordinator),
            cid=str(uuid.uuid4()),  # Unique correlation ID for tracking
            object_pk=coordinator_id,
            object_id=coordinator_id,
            object_repr=f"Coordinator ID: {coordinator_id_no} | Name: {coordinator_name}",
            action=LogEntry.Action.DELETE,
            changes=f"Deleted Coordinator: {coordinator_data} by {request.user.username}",
            actor=request.user,
            serialized_data=json.dumps(coordinator_data, default=str),  # Store complete backup
            changes_text=" ".join(changes_text),  # Human-readable change summary
            additional_data="Coordinator",
            timestamp=now()
        )

        # ✅ Return success response with 204 No Content
        return Response({
            'message': 'Coordinator, user account, and authentication token deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)



# 🔹 Pagination class...
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100



# API View to retrieve full information about a specific coordinator
class CoordinatorInfoAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    # Helper method to paginate any queryset
    def paginate_queryset(self, queryset, request):
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        return page, paginator

    # Helper method to append the log type to pagination URLs
    def append_type_param(self, link, type_value):
        if link:
            if "?" in link:
                return f"{link}&type={type_value}"
            return f"{link}?type={type_value}"
        return None

    def get(self, request, id):
        """
        GET method to retrieve:
        - Coordinator's full profile
        - Batches by status (Upcoming, Running, Completed, Hold)
        - Coordinator logs (created/updated/deleted)
        - Activity logs (actions performed by coordinator)
        - Paginated log data
        """
        
        # ✅ Only admin or coordinator can access
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Fetch coordinator by ID or return 404
        coordinator = get_object_or_404(Coordinator, id=id)

        # ✅ Extract log type from query parameters (optional)
        log_type = request.query_params.get('type')
        coordinator_ct = ContentType.objects.get_for_model(Coordinator)
        user = User.objects.get(username=coordinator.coordinator_id)

        # ✅ If only coordinator logs are requested
        if log_type == 'coordinator_logs':
            logs_qs = LogEntry.objects.filter(
                content_type=coordinator_ct,
                object_id=coordinator.id
            ).order_by('-timestamp')
            
            paginated, paginator = self.paginate_queryset(logs_qs, request)
            serializer = LogEntrySerializer(paginated, many=True)
            return paginator.get_paginated_response(serializer.data)

        # ✅ If only activity logs (performed by coordinator) are requested
        elif log_type == 'activity_logs':
            logs_qs = LogEntry.objects.filter(actor=user).order_by('-timestamp')
            paginated, paginator = self.paginate_queryset(logs_qs, request)
            serializer = LogEntrySerializer(paginated, many=True)
            return paginator.get_paginated_response(serializer.data)

        # ✅ Fetch all batches where the coordinator is assigned, grouped by status
        coordinator_batch_upcomimg = Batch.objects.filter(batch_coordinator=coordinator, status='Upcoming')
        coordinator_batch_completed = Batch.objects.filter(batch_coordinator=coordinator, status='Completed')
        coordinator_batch_ongoing = Batch.objects.filter(batch_coordinator=coordinator, status='Running')
        coordinator_batch_hold = Batch.objects.filter(batch_coordinator=coordinator, status='Hold')

        # ✅ Paginate coordinator logs
        coordinator_logs_qs = LogEntry.objects.filter(
            content_type=coordinator_ct,
            object_id=coordinator.id
        ).order_by('-timestamp')
        coordinator_logs_page, paginator_logs = self.paginate_queryset(coordinator_logs_qs, request)
        coordinator_logs_data = LogEntrySerializer(coordinator_logs_page, many=True).data

        # ✅ Paginate activity logs
        activity_logs_qs = LogEntry.objects.filter(actor=user).order_by('-timestamp')
        activity_logs_page, paginator_activities = self.paginate_queryset(activity_logs_qs, request)
        activity_logs_data = LogEntrySerializer(activity_logs_page, many=True).data

        # ✅ Construct response object with all required information
        Coordinator_Info = {
            'coordinator': CoordinatorSerializer(coordinator).data,

            # ✅ Batch details by status
            'coordinator_batch_upcomimg': list(coordinator_batch_upcomimg.values()),
            'coordinator_batch_ongoing': list(coordinator_batch_ongoing.values()),
            'coordinator_batch_completed': list(coordinator_batch_completed.values()),
            'coordinator_batch_hold': list(coordinator_batch_hold.values()),

            # ✅ Paginated Coordinator logs
            'coordinator_logs': coordinator_logs_data,
            'coordinator_logs_count': paginator_logs.page.paginator.count,
            'coordinator_logs_next': self.append_type_param(paginator_logs.get_next_link(), 'coordinator_logs'),
            'coordinator_logs_previous': self.append_type_param(paginator_logs.get_previous_link(), 'coordinator_logs'),

            # ✅ Paginated Activity logs
            'activity_logs': activity_logs_data,
            'activity_logs_count': paginator_activities.page.paginator.count,
            'activity_logs_next': self.append_type_param(paginator_activities.get_next_link(), 'activity_logs'),
            'activity_logs_previous': self.append_type_param(paginator_activities.get_previous_link(), 'activity_logs'),
        }

        # ✅ Send final response
        return Response({'Coordinator_Info': Coordinator_Info}, status=status.HTTP_200_OK)



# API View for fetching all logs related to Coordinator objects
class CoordinatorLogListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]
    
    # Serializer used for formatting the log entries
    serializer_class = LogEntrySerializer
    
    # Pagination class to paginate the result set
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """
        Returns a filtered queryset of LogEntry objects related to Coordinator,
        based on optional query parameters.
        """
        user = self.request.user

        # ✅ Restrict access to only admins and coordinators
        if user.role not in ['admin', 'coordinator']:
            return LogEntry.objects.none()

        # ✅ Get ContentType for the Coordinator model
        coordinator_ct = ContentType.objects.get_for_model(Coordinator)

        # ✅ Get all logs related to Coordinator model, sorted by most recent
        queryset = LogEntry.objects.filter(content_type=coordinator_ct).order_by('-timestamp')

        # ✅ Optional filters from query parameters
        action = self.request.query_params.get('action')  # e.g., 'CREATE', 'UPDATE', 'DELETE'
        actor_username = self.request.query_params.get('actor_username')  # Filter by username of actor
        actor_firstname = self.request.query_params.get('actor_firstname')  # Filter by actor's first name
        object_id = self.request.query_params.get('object_id')  # Filter logs for a specific coordinator by ID

        # ✅ Apply filters if present
        if action:
            queryset = queryset.filter(action__iexact=action)

        if actor_username:
            queryset = queryset.filter(actor__username__iexact=actor_username)

        if actor_firstname:
            queryset = queryset.filter(actor__first_name__iexact=actor_firstname)

        if object_id:
            queryset = queryset.filter(object_id=object_id)

        return queryset
