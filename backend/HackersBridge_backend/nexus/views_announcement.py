# Standard library imports
import json  # For serializing model data to JSON
import uuid  # For generating unique IDs (used for change tracking logs)

# Django imports
from django.utils.timezone import now  # To get the current timestamp
from django.forms.models import model_to_dict  # Converts model instances to Python dictionaries
from django.shortcuts import get_object_or_404  # Returns 404 if object does not exist
from django.contrib.contenttypes.models import ContentType  # Used to get model metadata for logging

# Django REST Framework (DRF) imports
from rest_framework import status  # For standard HTTP status codes
from rest_framework.views import APIView  # Base class for creating API views
from rest_framework.response import Response  # Used to return API responses
from rest_framework.permissions import IsAuthenticated  # Ensures user is authenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser  # To parse various content types
from rest_framework_simplejwt.authentication import JWTAuthentication  # JWT authentication for securing endpoints

# App-specific imports
from Trainer.models import Trainer  # Trainer model
from .models import Batch, Announcement  # Models used in this module
from .serializer_announcement import AnnouncementCreateSerializer  # Announcement Serializer for Announcement model

# Audit log model
from auditlog.models import LogEntry  # Model to store log entries (create, update, delete actions)
from .JWTCookie import JWTAuthFromCookie

# Global unique change ID (can be used for logging if needed globally)
cid = str(uuid.uuid4())


# API View to get all announcements (for admin and coordinator roles only)
class AnnouncementListView(APIView):
    # Enable JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    
    # Ensure the user is authenticated before accessing this view
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        GET method to retrieve all announcements.
        Only accessible by users with 'admin' or 'coordinator' roles.
        Returns the announcements ordered by most recent generation time.
        """
        # Check if the user has the correct role
        if request.user.role not in ['admin', 'coordinator']:   
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch all announcements from the database
        announcement = Announcement.objects.all()

        # Serialize the announcements, ordering them by generation time (newest first)
        serializer = AnnouncementCreateSerializer(announcement.order_by('-gen_time'), many=True)

        # Return serialized announcement data with a 200 OK status
        return Response({'announcement': serializer.data}, status=status.HTTP_200_OK)



# API View to create a new announcement (accessible by admin and coordinator roles)
class AnnouncementCreateAPIView(APIView):
    # Enable JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    
    # Ensure the user is authenticated
    permission_classes = [IsAuthenticated]
    
    # Accept data in JSON, multipart form (for files), or regular form format
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        """
        POST method to create a new announcement.
        Only users with 'admin' or 'coordinator' roles can access this.
        """
        # Check if user has the required role
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Deserialize and validate the incoming data
        serializer = AnnouncementCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Save the announcement to the database
            announcement = serializer.save()

            # ✅ Create a log entry for auditing
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(announcement),  # Type of the model
                cid=str(uuid.uuid4()),  # Unique change ID
                object_pk=str(announcement.id),  # Primary key as string
                object_id=announcement.id,  # Object ID
                object_repr=f"Announcement Subject: {announcement.subject}",  # Brief representation
                action=LogEntry.Action.CREATE,  # Action type: CREATE
                changes=f"Created Announcement by {request.user.username}",  # Change description
                serialized_data=json.dumps(model_to_dict(announcement), default=str),  # Full data snapshot
                changes_text=f"Announcement created with subject '{announcement.subject}' and Text '{announcement.text}'",  # Human-readable change description
                additional_data="Announcement",  # Additional context or tag
                actor=request.user,  # The user who performed the action
                timestamp=now()  # Time of action
            )

            # Return a success response
            return Response({'message': 'Announcement created successfully'}, status=status.HTTP_200_OK)
        
        # If the input data is invalid, return the errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# API View to handle updating an existing announcement
class AnnouncementEditAPIView(APIView):
    # Use JWT authentication for securing the endpoint
    authentication_classes = [JWTAuthFromCookie]
    # Ensure only authenticated users can access
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        """
        PATCH method to update an existing announcement.
        - Accessible only to users with roles 'admin' or 'coordinator'.
        - Supports partial updates.
        - Logs the changes made for auditing.
        """
        # Check if the user has proper role access
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Try to fetch the existing announcement by ID
        try:
            announcement = Announcement.objects.get(id=id)
        except Announcement.DoesNotExist:
            return Response({'error': 'Announcement not found'}, status=status.HTTP_404_NOT_FOUND)

        # Store old announcement data for comparison
        old_data = model_to_dict(announcement)

        # Use serializer for validating and updating the announcement
        serializer = AnnouncementCreateSerializer(
            announcement, data=request.data, context={'request': request}, partial=True
        )

        if serializer.is_valid():
            # Save updated announcement and get new data
            announcement = serializer.save()
            new_data = model_to_dict(announcement)

            # ✅ Generate a unique correlation ID for this update operation
            cid = str(uuid.uuid4())

            # ✅ Track the fields that were changed
            changes = {}  # Dictionary to store raw changes
            human_readable_changes = []  # Readable messages for logging

            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if str(old_value) != str(new_value):  # Compare as strings to avoid type mismatch
                    changes[field] = {
                        "old": str(old_value),
                        "new": str(new_value)
                    }
                    human_readable_changes.append(
                        f"{request.user.username} changed '{field}' of Announcement '{old_data.get('title', '')}' "
                        f"from '{old_value}' to '{new_value}'."
                    )

            # ✅ Log the update in the audit log
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Announcement),
                cid=cid,
                object_pk=announcement.id,
                object_id=announcement.id,
                object_repr=f"Announcement ID: {announcement.id} | Title: {announcement.title}",
                action=LogEntry.Action.UPDATE,
                changes=json.dumps(changes, indent=2),
                serialized_data=json.dumps(new_data, default=str),
                changes_text=" ".join(human_readable_changes),
                additional_data="Announcement",
                actor=request.user,
                timestamp=now()
            )

            # Return success response
            return Response({'message': 'Announcement updated successfully'}, status=status.HTTP_200_OK)

        # If validation fails, return errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# API View to delete an announcement (accessible by admin and coordinator roles)
class AnnouncementDeleteAPIView(APIView):
    # Enable JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    
    # Ensure the user is authenticated
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        """
        DELETE method to remove an existing announcement.
        Only users with 'admin' or 'coordinator' roles can perform this operation.
        Logs the deletion for audit purposes.
        """
        # Check if the user has the proper role to delete announcements
        if request.user.role not in ['admin', 'coordinator']:
            return Response(
                {'error': 'You do not have permission to delete announcements.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Retrieve the announcement object or return 404 if not found
        announcement = get_object_or_404(Announcement, id=id)

        # Capture the data of the announcement before deletion for logging purposes
        serialized_announcement = model_to_dict(announcement)

        # ✅ Create a log entry to track the deletion
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(announcement),  # Model type
            cid=str(uuid.uuid4()),  # Unique change ID
            object_pk=str(announcement.id),  # Object's primary key
            object_id=announcement.id,  # Object ID
            object_repr=f"Announcement Subject: {announcement.subject}",  # Brief description
            action=LogEntry.Action.DELETE,  # Action type: DELETE
            changes=f"Deleted Announcement by {request.user.username}",  # Change summary
            serialized_data=json.dumps(serialized_announcement, default=str),  # Full data snapshot
            changes_text=f"Announcement with subject '{announcement.subject}' and text '{announcement.text}' was deleted",  # Human-readable summary
            additional_data="Announcement",  # Optional metadata/tag
            actor=request.user,  # User performing the action
            timestamp=now()  # Timestamp of deletion
        )

        # Delete the announcement from the database
        announcement.delete()

        # Return a success response
        return Response(
            {'message': 'Announcement deleted successfully.'},
            status=status.HTTP_200_OK
        )



# API View to send list of trainers along with their assigned batches
class AnnouncementTrainerBatchesAPIView(APIView):
    # Enable JWT-based authentication
    authentication_classes = [JWTAuthFromCookie]
    
    # Ensure the user is authenticated
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        GET method to retrieve all trainers and their associated batches.
        Only accessible by 'admin' or 'coordinator' roles.
        Returns a list of trainers with batch IDs and names.
        """
        # Check user permission
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = []  # List to store trainers and their batch data

        # Get all trainers from the database
        trainers = Trainer.objects.all()

        # Loop through each trainer to fetch their batches
        for trainer in trainers:
            # Get all batches associated with the current trainer
            trainer_batches = Batch.objects.filter(trainer=trainer)

            # Create a simplified list of batch info
            batch_list = [{'id': batch.id, 'batch_id': batch.batch_id} for batch in trainer_batches]

            # Append trainer info along with their batches to the response list
            data.append({
                'trainer_id': trainer.trainer_id,
                'trainer_name': trainer.name,
                'batches': batch_list
            })

        # Return the complete data with HTTP 200 OK
        return Response(data, status=status.HTTP_200_OK)
