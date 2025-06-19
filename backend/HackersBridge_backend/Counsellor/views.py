# ✅ Standard Python libraries
import json                      # For serializing data (especially logs)
import uuid                      # For generating unique IDs (used in logs or tracking)

# ✅ App-specific models
from .models import Counsellor   # Counsellor model from current app
from Student.models import Student  # Student model from Student app

# ✅ Audit log model
from auditlog.models import LogEntry  # Model to log create/update/delete actions

# ✅ Django utilities
from django.utils.timezone import now  # For current timestamp in logs
from django.forms.models import model_to_dict  # Converts model instance to dictionary
from django.contrib.auth import get_user_model  # To fetch the custom User model
from django.shortcuts import get_object_or_404  # Helper to fetch objects or raise 404
from django.contrib.contenttypes.models import ContentType  # For content type in logs

# ✅ REST framework core components
from rest_framework.views import APIView        # Base class for API views
from rest_framework.response import Response    # To send responses
from rest_framework import status               # HTTP status codes
from rest_framework.permissions import IsAuthenticated  # Ensures only logged-in users access the view
from rest_framework.authtoken.models import Token        # DRF's token model (optional if using JWT)
from rest_framework_simplejwt.authentication import JWTAuthentication  # JWT auth class for token verification

# ✅ Serializers
from .serializer import CounsellorSerializer     # Serializer for Counsellor model
from Student.serializer import StudentSerializer # Serializer for Student model
from nexus.serializer import LogEntrySerializer  # Serializer for LogEntry audit logs

# ✅ Custom User model
User = get_user_model()                          # Assign your custom user model to `User`

# ✅ Global correlation ID for logging or tracking changes
cid = str(uuid.uuid4())                          # Generate a unique ID to trace log entries/actions



# API view to fetch the list of all counsellors
class CounsellorAPIView(APIView):
    # Require JWT authentication for accessing this view
    authentication_classes = [JWTAuthentication]
    # Ensure the user is authenticated
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Only users with 'admin' or 'coordinator' roles are allowed to access the counsellor list
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Fetch all counsellor records from the database
        counsellors = Counsellor.objects.all()
        
        # Serialize the queryset into JSON format
        serializer = CounsellorSerializer(counsellors, many=True)
        
        # Return the serialized data with HTTP 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)



# API view to get a list of students who are assigned to a specific counsellor
class StudentsUnderCounsellorAPIView(APIView):
    # Require JWT authentication to access this view
    authentication_classes = [JWTAuthentication]
    # Ensure that the user is authenticated
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """
        GET method to fetch all students assigned to a specific counsellor.
        Only users with 'admin' or 'coordinator' roles are authorized.
        """
        
        # Check if the user has the proper role to access this data
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Try to fetch the counsellor with the given ID
        try:
            counsellor = Counsellor.objects.get(id=id)
        except Counsellor.DoesNotExist:
            # Return an error if the counsellor does not exist
            return Response({'error': 'Counsellor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Query all students who are assigned to this counsellor
        students = Student.objects.filter(course_counsellor=counsellor)

        # Serialize the list of students into a JSON response
        serializer = StudentSerializer(students, many=True)

        # Return the serialized data with HTTP 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)



# API view to handle the creation of a new Counsellor
class CounsellorCreateAPIView(APIView):
    # Require JWT authentication
    authentication_classes = [JWTAuthentication]
    # Ensure the user is authenticated
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        POST method to create a new counsellor.
        Only users with 'admin' or 'coordinator' roles are allowed.
        """
        
        # Check if the user has the required role
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Initialize serializer with incoming request data
        serializer = CounsellorSerializer(data=request.data)
        
        # Validate the input data
        if serializer.is_valid():
            # Save the new counsellor to the database
            counsellor = serializer.save()
            
            # ✅ Prepare data for logging: Get all model fields and their values
            counsellor_data = {
                field.name: getattr(counsellor, field.name, None)
                for field in Counsellor._meta.fields
            }

            # ✅ Generate readable change log
            changes_text = [
                f"Created field '{field}': '{value}'"
                for field, value in counsellor_data.items()
            ]

            # ✅ Create a log entry for this creation action
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Counsellor),  # Specifies the model type
                cid=cid,  # ❗Make sure 'cid' is defined before this if not already
                object_pk=counsellor.id,  # Primary key of the created object
                object_id=counsellor.id,  # Redundant but often used for reference
                object_repr=f"Counsellor ID: {counsellor.counsellor_id} | Name: {counsellor.name}",  # Human-readable representation
                action=LogEntry.Action.CREATE,  # Action type
                changes=f"Created Counsellor: {counsellor_data} by {request.user.username}",  # Raw data log
                serialized_data=json.dumps(model_to_dict(counsellor), default=str),  # JSON snapshot of the created object
                changes_text=" ".join(changes_text),  # Human-readable change text
                additional_data="Counsellor",  # Optional label/category
                actor=request.user,  # User who performed the action
                timestamp=now()  # Timestamp of the action
            )
            
            # Return success response with counsellor ID
            return Response({
                "message": "Counsellor created successfully",
                "counsellor_id": counsellor.counsellor_id
            }, status=status.HTTP_201_CREATED)
        
        # If validation fails, return error response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# ✅ API view to edit/update an existing counsellor's details
class CounsellorEditAPIView(APIView):
    # ✅ Use JWT for authentication
    authentication_classes = [JWTAuthentication]
    # ✅ Ensure user is authenticated
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        """
        PUT method to update a counsellor's details.
        Accessible only to users with 'admin' or 'coordinator' roles.
        """

        # ✅ Role-based access control
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # ✅ Try fetching the counsellor object
        try:
            counsellor = Counsellor.objects.get(id=id)
        except Counsellor.DoesNotExist:
            return Response({'detail': 'Counsellor not found'}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Store original email and model data for comparison and logging
        old_email = counsellor.email
        old_data = model_to_dict(counsellor)

        # ✅ Deserialize and validate updated data (partial update allowed)
        serializer = CounsellorSerializer(counsellor, data=request.data, partial=True)

        if serializer.is_valid():
            # ✅ Save updated counsellor and get the new data
            counsellor = serializer.save()
            new_data = model_to_dict(counsellor)

            # ✅ Generate a unique correlation ID for logging
            cid = str(uuid.uuid4())

            # ✅ Track changes field-by-field
            changes = {}  # For raw change data
            human_readable_changes = []  # For logs that are easier to read

            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if str(old_value) != str(new_value):  # Compare as string to avoid mismatches
                    changes[field] = {
                        "old": str(old_value),
                        "new": str(new_value)
                    }
                    human_readable_changes.append(
                        f"{request.user.username} changed '{field}' of Counsellor '{old_data.get('name')}' "
                        f"from '{old_value}' to '{new_value}'."
                    )

            # ✅ If email changed, update User model's email as well
            if old_email != serializer.validated_data.get('email'):
                user = User.objects.filter(email=old_email).first()
                if user:
                    user.email = serializer.validated_data.get('email')
                    user.save()

            # ✅ Log the update in the audit log
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Counsellor),  # Counsellor model type
                cid=cid,  # Unique log identifier
                object_pk=counsellor.id,  # Primary key of counsellor
                object_id=counsellor.id,
                object_repr=f"Counsellor ID: {counsellor.counsellor_id} | Name: {counsellor.name}",
                action=LogEntry.Action.UPDATE,  # Log action type: UPDATE
                changes=json.dumps(changes, indent=2),  # Raw JSON changes
                serialized_data=json.dumps(new_data, default=str),  # Full updated object
                changes_text=" ".join(human_readable_changes),  # Human-readable description
                additional_data="Counsellor",  # Optional context label
                actor=request.user,  # Who performed the update
                timestamp=now()  # Current timestamp
            )

            # ✅ Return success response
            return Response({
                "message": "Counsellor updated successfully",
                "counsellor_id": counsellor.counsellor_id
            }, status=status.HTTP_200_OK)

        # ❌ Return validation errors if any
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# API view to delete a counsellor along with their associated user and authentication token
class CounsellorDeleteAPIView(APIView):
    # Require JWT-based authentication
    authentication_classes = [JWTAuthentication]
    # Ensure user is authenticated
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, id):
        """
        DELETE method to remove a counsellor, their corresponding user account,
        and authentication tokens. Only accessible by 'admin' and 'coordinator'.
        """

        # ✅ Allow only admin or coordinator roles to perform deletion
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Fetch the counsellor object or return 404 if not found
        counsellor = get_object_or_404(Counsellor, id=id)

        # ✅ Backup counsellor data for logging purposes
        counsellor_data = {
            field.name: getattr(counsellor, field.name, None)
            for field in Counsellor._meta.fields
        }

        counsellor_id = counsellor.id
        counsellor_id_no = counsellor.counsellor_id
        counsellor_name = counsellor.name

        # ✅ Try to fetch the associated user based on counsellor ID (used as username)
        try:
            user = User.objects.get(username=counsellor.counsellor_id)
        except User.DoesNotExist:
            return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ Delete authentication tokens of the user
        Token.objects.filter(user=user).delete()

        # ✅ Delete the counsellor record from the database
        counsellor.delete()

        # ✅ Delete the associated user account
        user.delete()

        # ✅ Prepare a readable log of what was deleted
        changes_text = [
            f"Deleted field '{field}': '{value}'"
            for field, value in counsellor_data.items()
        ]

        # ✅ Log the deletion operation
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Counsellor),  # Counsellor model reference
            cid=str(uuid.uuid4()),  # Generate a unique correlation ID for tracking
            object_pk=counsellor_id,  # Primary key of the deleted object
            object_id=counsellor_id,  # Optional secondary object identifier
            object_repr=f"Counsellor ID: {counsellor_id_no} | Name: {counsellor_name}",  # Human-readable name
            action=LogEntry.Action.DELETE,  # Action type: DELETE
            changes=f"Deleted Counsellor: {counsellor_data} by {request.user.username}",  # Full raw change description
            actor=request.user,  # Who performed the action
            serialized_data=json.dumps(counsellor_data, default=str),  # JSON snapshot of deleted data
            changes_text=" ".join(changes_text),  # Readable change log
            additional_data="Counsellor",  # Optional label for category/type
            timestamp=now()  # Log timestamp
        )

        # ✅ Return success response
        return Response(
            {'message': 'Counsellor, user account, and authentication token deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )



# API view to get detailed information about a specific counsellor
class CousellorInfoAPIView(APIView):
    # Use JWT for user authentication
    authentication_classes = [JWTAuthentication]
    # Ensure the user is logged in
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """
        GET method to retrieve:
        - Counsellor profile information
        - Logs related to changes made to this counsellor
        - Activity logs performed by this counsellor
        Access restricted to 'admin' and 'coordinator' roles.
        """

        # ✅ Only 'admin' and 'coordinator' roles can access this data
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Fetch the counsellor object or return 404 if not found
        counsellor = get_object_or_404(Counsellor, id=id)

        # ✅ Get content type for logging queries related to this model
        counsellor_ct = ContentType.objects.get_for_model(Counsellor)

        # ✅ Fetch all log entries related to this specific counsellor (e.g. created, updated, deleted)
        counsellor_logs = LogEntry.objects.filter(
            content_type=counsellor_ct,
            object_id=counsellor.id
        ).order_by('-timestamp')

        # ✅ Serialize the counsellor logs
        serializer_logs = LogEntrySerializer(counsellor_logs, many=True).data

        # ✅ Fetch the User object associated with this counsellor using their counsellor_id as username
        user = User.objects.get(username=counsellor.counsellor_id)

        # ✅ Fetch all logs where this counsellor (user) acted (e.g. edited other records)
        activity_logs = LogEntry.objects.filter(actor=user).order_by('-timestamp')

        # ✅ Serialize the activity logs
        activity_serializer_logs = LogEntrySerializer(activity_logs, many=True).data

        # ✅ Combine all data into a single structured response
        Counsellor_Info = {
            'counsellor': CounsellorSerializer(counsellor).data,            # Basic counsellor info
            'counsellor_logs': serializer_logs,                             # Logs of changes made to this counsellor
            'activity_logs': activity_serializer_logs                       # Logs of actions this counsellor performed
        }

        # ✅ Return the combined data
        return Response({'Counsellor_Info': Counsellor_Info}, status=status.HTTP_200_OK)



# API view to retrieve all logs related to Counsellor actions (create, update, delete)
class CounsellorLogListView(APIView):
    # ✅ Use JWT-based authentication
    authentication_classes = [JWTAuthentication]
    # ✅ Ensure the request is made by an authenticated user
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        GET method to return all log entries related to the Counsellor model.
        Accessible only by users with the 'admin' or 'coordinator' role.
        """
        
        # ✅ Restrict access to only admin and coordinator roles
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # ✅ Get the ContentType object for the Counsellor model
        counsellor_ct = ContentType.objects.get_for_model(Counsellor)

        # ✅ Fetch all logs associated with the Counsellor model and sort by most recent first
        logs = LogEntry.objects.filter(content_type=counsellor_ct).order_by('-timestamp')

        # ✅ Serialize the log entries into JSON-compatible format
        serializer = LogEntrySerializer(logs, many=True)

        # ✅ Return the serialized log data
        return Response(serializer.data, status=status.HTTP_200_OK)
