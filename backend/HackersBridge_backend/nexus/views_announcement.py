import  os
import json
import uuid
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from .models import Batch, BatchStudentAssignment, Attendance, Course, Timeslot, Announcement
from .serializer import AnnouncementCreateSerializer
from Trainer.serializer import TrainerSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Q, Count, Min, Prefetch
from Student.models import StudentCourse, Student
from Student.serializer import StudentSerializer, StudentCourseSerializer
from Trainer.models import Trainer
from Coordinator.models import Coordinator
from rest_framework.authentication import TokenAuthentication
from rest_framework import serializers
from nexus.generate_certificate import generate_certificate, get_certificate_path
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.utils.timezone import now
from pathlib import Path
from django.utils.dateparse import parse_date
from collections import defaultdict
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

cid = str(uuid.uuid4())

# This is for Get all announcement for coordinator......
class AnnouncementListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:   
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        announcement = Announcement.objects.all()
        serializer = AnnouncementCreateSerializer(announcement.order_by('-gen_time'), many=True)
        return Response({'announcement':serializer.data}, status=status.HTTP_200_OK)



# This is for Create a new announcement.....
class AnnouncementCreateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]  # Add JSONParser

    def post(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AnnouncementCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            announcement = serializer.save()

            # ✅ Log entry
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(announcement),
                cid=str(uuid.uuid4()),
                object_pk=str(announcement.id),
                object_id=announcement.id,
                object_repr=f"Announcement Subject: {announcement.subject}",
                action=LogEntry.Action.CREATE,
                changes=f"Created Announcement by {request.user.username}",
                serialized_data=json.dumps(model_to_dict(announcement), default=str),
                changes_text=f"Announcement created with subject '{announcement.subject}' and Text '{announcement.text}'",
                additional_data="Announcement",
                actor=request.user,
                timestamp=now()
            )
            return Response({'message': 'Announcement created successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



# This is for Edit the announcement......
class AnnouncementEditAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error':'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            announcement = Announcement.objects.get(id=id)
        except Announcement.DoesNotExist:
            return Response({'error': 'Announcement not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AnnouncementCreateSerializer(
            announcement, data=request.data, context={'request': request}, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Announcement updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# This is for deleting announcement.......
class AnnouncementDeleteAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        # Only allow admin and coordinator roles
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'You do not have permission to delete announcements.'},
                            status=status.HTTP_403_FORBIDDEN)

        announcement = get_object_or_404(Announcement, id=id)
        announcement.delete()

        return Response({'message': 'Announcement deleted successfully.'},
                        status=status.HTTP_200_OK)



# This is for Send Trainer Batch list......
class AnnouncementTrainerBatchesAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = []

        trainers = Trainer.objects.all()
        for trainer in trainers:
            trainer_batches = Batch.objects.filter(trainer=trainer)
            batch_list = [{'id': batch.id, 'batch_id': batch.batch_id} for batch in trainer_batches]

            data.append({
                'trainer_id': trainer.trainer_id,
                'trainer_name': trainer.name,
                'batches': batch_list
            })

        return Response(data, status=status.HTTP_200_OK)
    

