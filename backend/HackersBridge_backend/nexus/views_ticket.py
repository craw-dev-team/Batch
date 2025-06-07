import  os
import json
import uuid
import logging
from pathlib import Path
from django.utils import timezone
from Trainer.models import Trainer
from collections import defaultdict
from datetime import timedelta, date
from auditlog.models import LogEntry
from django.utils.html import escape
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework.views import APIView
from django.core.mail import EmailMessage
from nexus.models import Course, Timeslot
from Coordinator.models import Coordinator
from rest_framework import status, filters
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.forms.models import model_to_dict
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from Trainer.serializer import TrainerSerializer
from Student.models import StudentCourse, Student
from django.db.models import Q, Count, Min, Prefetch
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.contenttypes.models import ContentType
from rest_framework.exceptions import AuthenticationFailed
from .models import Ticket, TicketChat
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from Student.serializer import StudentSerializer, StudentCourseSerializer
from nexus.generate_certificate import generate_certificate, get_certificate_path
from .serializer import BatchSerializer, BatchCreateSerializer, BatchStudentAssignmentSerializer, LogEntrySerializer, AttendanceSerializer


class TicketAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        tickets = Ticket.objects.all().values(
            'id',
            'ticket_id',
            'student__enrollment_no',
            'student__name',  # change to actual name field if different
            'issue_type',
            'title',
            'status',
            'created_at'
        ).order_by('-created_at')

        return Response({'tickets': tickets}, status=status.HTTP_200_OK)
    

# THIS IS FOR UPDATING TICKET 
class TicketStatusUpdate(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        ticket_status = request.data.get('status')
        
        if ticket_status:
            ticket = Ticket.objects.filter(id=id).first()
            ticket.status = ticket_status
            ticket.save()
            return Response({'message': 'Ticket Status Updated successfully'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Ticket status not provided'}, status=status.HTTP_400_BAD_REQUEST)




class TicketChatAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            ticket = Ticket.objects.get(id=id)

        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        chats = TicketChat.objects.filter(ticket=ticket)
        ticket_info = Ticket.objects.filter(id=id).values('student', 'title', 'ticket_id', 'issue_type', 'status', 'priority', 'assigned_to', 'is_active', 'created_at', 'updated_at')

        for chat in chats:
            if chat.sender == 'student':
                chat.message_status = 'Open'
                chat.save()

        return Response({
            'all_message': chats.values('ticket', 'sender', 'message', 'message_status', 'gen_time', 'open_by'),
            'ticket_info': ticket_info
        }, status=status.HTTP_200_OK)
    



class TicketChatMessageAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        message = request.data.get('message')
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        ticket = Ticket.objects.filter(id=id).first()
        # Update ticket status based on current state
        if ticket.status in ['Open', 'Customer-Reply']:
            ticket.status = 'Answered'
            ticket.save()
        elif ticket.status == 'Closed':
            ticket.status = 'Open'
            ticket.save()
        
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)


        TicketChat.objects.create(
            ticket=ticket,
            sender=request.user.role,
            message=message
        )

        # Optional: Add log entry if you want audit trail
        # LogEntry.objects.create(...)

        return Response({
            'success': True,
            'ticket_id': ticket.id,
            'title': ticket.title,
            'issue_type': ticket.issue_type,
            'status': ticket.status
        }, status=status.HTTP_201_CREATED)
