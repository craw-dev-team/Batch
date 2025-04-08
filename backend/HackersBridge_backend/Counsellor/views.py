from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Counsellor
from .serializer import CounsellorSerializer
from nexus.serializer import LogEntrySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from Student.models import Student
from Student.serializer import StudentSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.utils.timezone import now
import json
import uuid

# from django.contrib.auth.models import User
User = get_user_model()
cid = str(uuid.uuid4())

class CounsellorListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        counsellors = Counsellor.objects.all()
        serializer = CounsellorSerializer(counsellors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class StudentsUnderCounsellorView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """Fetch all students assigned under a specific counsellor"""
        # Ensure only admins and counsellors can access
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the counsellor exists
        try:
            counsellor = Counsellor.objects.get(id=id)
        except Counsellor.DoesNotExist:
            return Response({'error': 'Counsellor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve students assigned under this counsellor
        students = Student.objects.filter(course_counsellor=counsellor)

        # Serialize student data
        serializer = StudentSerializer(students, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)



class CounsellorCreateAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CounsellorSerializer(data=request.data)
        if serializer.is_valid():
            counsellor = serializer.save()
            
            # ✅ Store counsellor details
            counsellor_data = {field.name: getattr(counsellor, field.name, None) for field in Counsellor._meta.fields}   
            changes_text = [f"Created field {field}: {value}" for field, value in counsellor_data.items()]

            # ✅ Log creation
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(Counsellor),
                cid=cid,  # ✅ Now properly defined
                object_pk=counsellor.id,
                object_id=counsellor.id,
                object_repr=f"Counsellor ID: {counsellor.counsellor_id} | Name: {counsellor.name}",
                action=LogEntry.Action.CREATE,
                changes=f"Created Counsellor: {counsellor_data} by {request.user.username}",
                serialized_data=json.dumps(model_to_dict(counsellor), default=str),  # ✅ JSON serialized counsellor data
                changes_text=" ".join(changes_text),
                additional_data="Counsellor",
                actor=request.user,
                timestamp=now()
            )
            
            return Response({
                "message": "Counsellor created successfully",
                "counsellor_id": counsellor.counsellor_id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CounsellorEditAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            counsellor = Counsellor.objects.get(id=id)
        except Counsellor.DoesNotExist:
            return Response({'detail': 'Counsellor not found'}, status=status.HTTP_404_NOT_FOUND)

        old_email = counsellor.email  # Store old email
        old_data = model_to_dict(counsellor)  # Store old field values
        
        serializer = CounsellorSerializer(counsellor, data=request.data, partial=True)

        if serializer.is_valid():
            counsellor = serializer.save()  # Save the updated data
            new_data = model_to_dict(counsellor)  # Get new field values

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
                content_type=ContentType.objects.get_for_model(Counsellor),
                cid=cid,
                object_pk=counsellor.id,
                object_id=counsellor.id,
                object_repr=f"Counsellor ID: {counsellor.counsellor_id} | Name: {counsellor.name}",
                action=LogEntry.Action.UPDATE,
                changes=f"Updated Counsellor: {counsellor.name} by {request.user.username}. Changes: {changes}",
                serialized_data=json.dumps(new_data, default=str),
                changes_text=" ".join(changes_text),
                additional_data="Counsellor",
                actor=request.user,
                timestamp=now()
            )

            return Response({"message": "Counsellor updated successfully", "counsellor_id": counsellor.counsellor_id}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CounsellorDeleteAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        counsellor = get_object_or_404(Counsellor, id=id)
        
        # ✅ Store counsellor details before deleting
        counsellor_data = {field.name: getattr(counsellor, field.name, None) for field in Counsellor._meta.fields}
        counsellor_id = counsellor.id
        counsellor_id_no = counsellor.counsellor_id
        counsellor_name = counsellor.name
        
        try:
            user = User.objects.get(username=counsellor.counsellor_id)  # Get user by counsellor ID
        except User.DoesNotExist:
            return Response({'error': 'Associated user not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ Delete authentication tokens
        Token.objects.filter(user=user).delete()
        
        # ✅ Delete counsellor record
        counsellor.delete()
        
        # ✅ Delete associated user
        user.delete()
        
        # ✅ Log deletion
        changes_text = [f"Deleted field {field}: {value}" for field, value in counsellor_data.items()]
        
        LogEntry.objects.create(
            content_type=ContentType.objects.get_for_model(Counsellor),
            cid=str(uuid.uuid4()),  # ✅ Generate a unique correlation ID
            object_pk=counsellor_id,
            object_id=counsellor_id,
            object_repr=f"Counsellor ID: {counsellor_id_no} | Name: {counsellor_name}",
            action=LogEntry.Action.DELETE,
            changes=f"Deleted Counsellor: {counsellor_data} by {request.user.username}",
            actor=request.user,
            serialized_data=json.dumps(counsellor_data, default=str),  # ✅ JSON serialized counsellor data
            changes_text=" ".join(changes_text),
            additional_data="Counsellor",
            timestamp=now()
        )
        
        return Response({'message': 'Counsellor, user account, and authentication token deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class CousellorInfoAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        counsellor = get_object_or_404(Counsellor, id=id)

        # Fetch logs for this coordinator
        counsellor_ct = ContentType.objects.get_for_model(Counsellor)
        counsellor_logs = LogEntry.objects.filter(content_type=counsellor_ct, object_id=counsellor.id).order_by('-timestamp')
        serializer_logs = LogEntrySerializer(counsellor_logs, many=True).data


        # Fetch activity logs for this counsellor
        user = User.objects.get(username=counsellor.counsellor_id)
        activity_logs = LogEntry.objects.filter(actor=user).order_by('-timestamp')
        activity_serializer_logs = LogEntrySerializer(activity_logs, many=True).data

        Counsellor_Info = {
            'counsellor':CounsellorSerializer(counsellor).data,
            'counsellor_logs':serializer_logs,
            'activity_logs':activity_serializer_logs,
        } 

        return Response({'Counsellor_Info':Counsellor_Info}, status=status.HTTP_200_OK)



class CounsellorLogListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error':'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        counsellor_ct = ContentType.objects.get_for_model(Counsellor)
        logs = LogEntry.objects.filter(content_type=counsellor_ct).order_by('=timestamp')
        serializer = LogEntrySerializer(logs, many=True)
        return Response(serializer.data)