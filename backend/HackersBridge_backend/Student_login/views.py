import os
import base64
from io import BytesIO
from pdf2image import convert_from_path
from rest_framework.generics import ListAPIView
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework_simplejwt.tokens import RefreshToken
from .serializer import TicketChatSerializer, TicketSerializer
from Student.serializer import StudentSerializer
from nexus.serializer import BatchSerializer, AllChatsSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authtoken.models import Token
from Student.models import Student, StudentCourse, StudentNotes, BookAllotment
from nexus.models import Batch, Attendance, StudentBatchRequest, Announcement, Ticket, TicketChat, Book, Chats, ChatMessage
from Coordinator.models import Coordinator
from django.db.models import Q
from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from Trainer.models import Trainer
from django.http import JsonResponse
# Create your views here.
from django.utils.timezone import now
from nexus.generate_certificate import get_certificate_path
from django.http import FileResponse
from django.urls import reverse
from HackersBridge.reCAPTCHA import verify_recaptcha
from django_filters.rest_framework import DjangoFilterBackend
from nexus.JWTCookie import JWTAuthFromCookie
User = get_user_model()





class StudentInfoView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_email = request.user.email
        user_name = request.user.username

        try:
            student = Student.objects.select_related('course_counsellor', 'support_coordinator').get(
                Q(enrollment_no=user_name) | Q(email=user_email)
            )
        except Student.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        def mask_phone(phone):
            return phone[:5] + 'X' * (len(phone) - 4) if phone and len(phone) >= 4 else phone

        def mask_email(email):
            if email and '@' in email:
                name, domain = email.split('@', 1)
                return name[:5] + 'X' * (len(name) - 5) + '@' + domain if len(name) > 5 else 'XXXXX@' + domain
            return email

        student_info = {
            'id': student.id,
            'name': student.name,
            'enrollment_no': student.enrollment_no,
            'date_of_joining': student.date_of_joining,
            'phone': mask_phone(student.phone),
            'email': mask_email(student.email),
            'mode': student.mode,
            'preferred_week': student.preferred_week,
            'language': student.language,
            'course_counsellor': student.course_counsellor.name if student.course_counsellor else None,
            'support_coordinator': student.support_coordinator.name if student.support_coordinator else None,
            'address': student.address,
        }

        student_courses = StudentCourse.objects.filter(student=student).select_related('course')

        student_course_list = []
        for course in student_courses:
            # Fetch book allotment date (if any)
            book_allotment = BookAllotment.objects.filter(student=student, book__course=course.course).first()
            book_date = book_allotment.allotment_datetime if book_allotment else None

            student_course_list.append({
                'id': course.id,
                'course_name': course.course.name if course.course else None,
                'course_status': course.status,
                'student_book_allotment': course.student_book_allotment,
                'student_book_date': book_date,
                'course_certificate_date': course.certificate_date,
                'certificate_issued_at': course.certificate_issued_at,
                'course_taken': Batch.objects.filter(student=student, course=course.course).count() if course.course else 0,
            })

        return Response({
            'studentinfo': student_info,
            'studentcourse': student_course_list
        }, status=status.HTTP_200_OK)




class StudentBatchListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_email = request.user.email
        user_name = request.user.username

        # Fetch a single student object
        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()

        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Now use student directly
        batches = Batch.objects.filter(student=student)

        all_batches = {
            'Ongoing_batch': BatchSerializer(batches.filter(status='Running'), many=True).data,
            'Scheduled_batch': BatchSerializer(batches.filter(status='Upcoming'), many=True).data,
            'Completed_batch': BatchSerializer(batches.filter(status='Completed'), many=True).data,
        }

        return Response({'batch': all_batches}, status=status.HTTP_200_OK)



class StudentUpcomingBatchListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_email = request.user.email
        user_name = request.user.username

        # Fetch a single student object
        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()

        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch student's courses
        student_courses = StudentCourse.objects.filter(student=student).select_related('course')

        student_course_ids = student_courses.values_list("course_id", flat=True)

        # Get student's existing batch IDs for 'Upcoming' status
        student_upcoming_batch_ids = Batch.objects.filter(student=student, status='Upcoming').values_list('id', flat=True)

        # Get completed and ongoing course IDs
        completed_or_ongoing_course_ids = student_courses.filter(status__in=['Completed', 'Ongoing']).values_list('course_id', flat=True)

        # Get all upcoming batches for the student's courses
        all_upcoming_batches = Batch.objects.filter(course_id__in=student_course_ids, status='Upcoming')

        # Exclude already assigned batches and completed/ongoing course batches
        filtered_upcoming_batches = all_upcoming_batches.exclude(
            course_id__in=completed_or_ongoing_course_ids
        ).exclude(id__in=student_upcoming_batch_ids)

        batch_list = filtered_upcoming_batches.select_related('course', 'trainer', 'batch_time').values(
            'id',
            'batch_id', 
            'course__name', 
            'preferred_week',
            'batch_time__end_time', 
            'batch_time__start_time', 
            'start_date',
            'end_date',
            'language',
            'status',
            'mode',
        )
        # Get batch request statuses for the student
        requested_batches = StudentBatchRequest.objects.filter(student=student).values('batch_id', 'request_status')
        request_map = {item['batch_id']: item['request_status'] for item in requested_batches}

        # Inject request_status into batch_list
        for batch in batch_list:
            batch['request_status'] = request_map.get(batch['id'], None)  # None if not requested

        return Response({'all_upcoming_batch': batch_list}, status=status.HTTP_200_OK)



class StudentBatchInfoView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role != 'student':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        
        user_email = request.user.email
        user_name = request.user.username

        # Fetch a single student object
        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()

        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Fetching Batch Data...
        batch = get_object_or_404(Batch, id=id)

        batch_fields = [
                        'id',
                        'batch_id', 
                        'batch_time__start_time', 
                        'batch_time__end_time', 
                        'start_date',
                        'end_date', 
                        'course__name', 
                        'mode', 
                        'preferred_week',
                        'location__locality',
                        'language',
                        'trainer__name',
                        'trainer__weekoff',
                        'trainer__status',
                        'trainer__leave_status',
                        'trainer__leave_end_date',
                        'trainer__leave_start_date',
                        'batch_link',
                    ]

        batch_data = Batch.objects.filter(id=id).values(*batch_fields)
        
        from datetime import date

        today = date.today() 

        student_attendance = Attendance.objects.filter(student=student, batch_id = id).values('id', 'date', 'attendance')
        student_certificate = StudentCourse.objects.filter(student=student, course=batch.course).select_related('course')

        certificates = []

        for sc in student_certificate:
            file_path = get_certificate_path(sc.course.name, sc.student.name, sc.student.enrollment_no)

            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    base64_pdf = base64.b64encode(f.read()).decode("utf-8")

                download_url = request.build_absolute_uri(
                    reverse('student_certificate_download', kwargs={'course_id': sc.course.id})
                )

                certificates.append({
                    'course_name': sc.course.name,
                    'certificate_available': True,
                    'certificate_date': sc.certificate_date,
                    'pdf_base64': base64_pdf,
                    'download_url': download_url,
                    'message': 'Certificate'
                })
            else:
                certificates.append({
                    'course_name': sc.course.name,
                    'certificate_available': False,
                    'message': 'Certificate not generated yet.'
                })

        # Percentage DATA on  Attendance...
        total_count = student_attendance.count()
        present_count = student_attendance.filter(attendance="Present").count()
        absent_count = student_attendance.filter(attendance="Absent").count()

        overall_percentage = round((present_count / total_count) * 100, 1) if total_count > 0 else 0.0

        return Response({'batch': batch_data,
                         'attendance':student_attendance,
                         'total_absent':absent_count,
                         'total_present':present_count,
                         'total_days':total_count,
                         'overall_percentage':overall_percentage,
                         'certificate':certificates
                         }, status=status.HTTP_200_OK)



class BatchCertificateDownloadView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        batch = get_object_or_404(Batch, id=id)

        if batch.status != 'Completed':
            return Response({'error': 'Batch not completed yet'}, status=status.HTTP_403_FORBIDDEN)

        student_course = StudentCourse.objects.filter(student=student, course=batch.course).first()
        if not student_course:
            return Response({'error': 'Course record not found'}, status=status.HTTP_404_NOT_FOUND)

        file_path = get_certificate_path(student_course.course.name, student_course.student.name, student_course.student.enrollment_no)

        if os.path.exists(file_path):
            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        else:
            return Response({'error': 'Certificate file not found'}, status=status.HTTP_404_NOT_FOUND)




class AllStudentCertificate(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        student_courses = StudentCourse.objects.filter(student=student).select_related('course')

        certificates = []

        for sc in student_courses:
            file_path = get_certificate_path(sc.course.name, sc.student.name, sc.student.enrollment_no)

            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    base64_pdf = base64.b64encode(f.read()).decode("utf-8")

                download_url = request.build_absolute_uri(
                    reverse('student_certificate_download', kwargs={'course_id': sc.course.id})
                )

                certificates.append({
                    'course_name': sc.course.name,
                    'certificate_available': True,
                    'certificate_date': sc.certificate_date,
                    'pdf_base64': base64_pdf,
                    'download_url': download_url,
                    'message': 'Certificate'
                })
            else:
                certificates.append({
                    'course_name': sc.course.name,
                    'certificate_available': False,
                    'message': 'Certificate not generated yet.'
                })

        return Response({'certificates': certificates}, status=status.HTTP_200_OK)



class DownloadStudentCertificate(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        student_course = StudentCourse.objects.filter(student=student, course__id=course_id).select_related('course').first()
        if not student_course:
            return Response({'error': 'Course not found or not assigned to student'}, status=status.HTTP_404_NOT_FOUND)

        # Get the certificate file path
        file_path = get_certificate_path(student_course.course.name, student_course.student.name, student_course.student.enrollment_no)

        # Check if the file exists and return it
        if os.path.exists(file_path):
            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        else:
            return Response({'error': 'Certificate file not found'}, status=status.HTTP_404_NOT_FOUND)



class StudentAttendanceListView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized access. Only students are allowed.'}, status=status.HTTP_401_UNAUTHORIZED)

        email = request.user.email
        username = request.user.username

        student = Student.objects.filter(Q(enrollment_no=username) | Q(email=email)).first()
        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        student_batches = Batch.objects.filter(student=student)

        # Exclude upcoming batches for overall percentage
        valid_batches = student_batches.exclude(status='Upcoming')
        valid_batch_ids = valid_batches.values_list('id', flat=True)

        all_batch_attendance = Attendance.objects.filter(student=student, batch_id__in=valid_batch_ids)
        all_present = all_batch_attendance.filter(attendance="Present").count()
        all_absent = all_batch_attendance.filter(attendance="Absent").count()
        all_total = all_batch_attendance.count()

        overall_attendance = round((all_present / all_total) * 100, 1) if all_total > 0 else 0.0

        def get_batch_data(batch_queryset):
            batch_list = []
            for batch in batch_queryset:
                attendance_qs = Attendance.objects.filter(student=student, batch_id=batch.id)
                total = attendance_qs.count()
                present = attendance_qs.filter(attendance="Present").count()
                percentage = round((present / total * 100), 2) if total > 0 else 0

                batch_info = {
                    'id': batch.id,
                    'batch_id': batch.batch_id,
                    'start_time': batch.batch_time.start_time if batch.batch_time else None,
                    'end_time': batch.batch_time.end_time if batch.batch_time else None,
                    'start_date': batch.start_date,
                    'end_date': batch.end_date,
                    'course_name': batch.course.name if batch.course else None,
                    'attendance_summary': {'attendance_percentage': percentage }
                }
                batch_list.append(batch_info)
            return batch_list

        all_batches = {
            'ongoing_batches': get_batch_data(student_batches.filter(status='Running').order_by('start_date')),
            'completed_batches': get_batch_data(student_batches.filter(status='Completed')),
        }

        return Response({'batch': all_batches,
                         'all_present':all_present,
                         'all_absent':all_absent,
                         'all_total':all_total,
                         'overall_attendance':overall_attendance
                         }, status=status.HTTP_200_OK)
    

# This is for Creating Batch Request..
class StudentBatchRequestAPI(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, 'role', None) != 'student':
            return Response({'error': 'Unauthorized access. Only students are allowed.'}, status=status.HTTP_401_UNAUTHORIZED)

        email = request.user.email
        username = request.user.username
        request_batch_code = request.data.get('batch_code')

        if not request_batch_code:
            return Response({'error': 'Batch code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get student instance
        student = Student.objects.filter(Q(enrollment_no=username) | Q(email=email)).first()
        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Get batch with that batch_code
        batch_instance = Batch.objects.filter(batch_id=request_batch_code).select_related('course').first()
        if not batch_instance:
            return Response({'error': 'Batch not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the student is enrolled in the course of the requested batch
        has_course = StudentCourse.objects.filter(student=student, course=batch_instance.course).exists()
        if not has_course:
            return Response({'error': 'You are not enrolled in the course of this batch.'}, status=status.HTTP_403_FORBIDDEN)

        # Check if a request already exists
        if StudentBatchRequest.objects.filter(student=student, batch=batch_instance).exists():
            return Response({'message': 'Request for this batch already submitted.'}, status=status.HTTP_409_CONFLICT)

        # Create the batch request
        StudentBatchRequest.objects.create(
            student=student,
            batch=batch_instance,
            request_type='Batch Request',
            request_status='Pending'
        )

        return Response({'message': 'Batch Request Sent Successfully.'}, status=status.HTTP_201_CREATED)



class StudentAnnouncementAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        
        All_Announcement = Announcement.objects.filter(student=student).values(
                                                                                'subject',
                                                                                'text',
                                                                                'gen_time'
                                                                                )

        return Response({'All_Announcement' : All_Announcement}, status=status.HTTP_200_OK)


class StudentRecommendedAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        email = request.user.email
        username = request.user.username
        re_want = request.data.get('re_want')

        if not re_want:
            return Response({'error': 'Recommendation status not provided'}, status=status.HTTP_400_BAD_REQUEST)

        student = Student.objects.filter(Q(enrollment_no=username) | Q(email=email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        student.re_permission = re_want
        student.save()

        return Response({'message': 'Your status was updated successfully'}, status=status.HTTP_202_ACCEPTED)
            


# This is for view student ticket...
class StudentTicketAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        
        def mask_email(email):
            if email and '@' in email:
                name, domain = email.split('@', 1)
                return name[:5] + 'X' * (len(name) - 5) + '@' + domain
            return email

        student_tickets = Ticket.objects.filter(student=student).order_by('-created_at').values(
            'id',
            'ticket_id',
            'issue_type',
            'title',
            'status',
            'created_at'
        )
        user_info = {
            'name':student.name,
            'email':mask_email(student.email)
        }

        return Response({'tickets': student_tickets,
                         'user_info':user_info}, status=status.HTTP_200_OK)



# This is for creating ticket...
class StudentTicketCreateAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        recaptcha_token = request.data.get('recaptcha_token')
        if not recaptcha_token:
            return Response({'error': 'reCAPTCHA token missing'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ First verify reCAPTCHA
        verify_recaptcha(recaptcha_token)

        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user_email = request.user.email
        user_name = request.user.username
        user_role = request.user.role

        # Get the student
        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_403_FORBIDDEN)

        # Extract ticket fields
        title = request.data.get('title')
        issue_type = request.data.get('issue_type')
        message = request.data.get('message')
        priority = request.data.get('priority', 'Medium')  # default priority if not provided
        print(title)
        print(issue_type)
        print(message)
        print(priority)

        if not title or not issue_type or not message:
            return Response({'error': 'Title, issue_type, and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the assigned coordinator (User) based on student.support_coordinator
        coordinator = getattr(student, 'support_coordinator', None)
        assigned_user = None
        if coordinator and coordinator.email:
            assigned_user = User.objects.filter(email=coordinator.email).first()
            print(assigned_user.id)

        # Create ticket
        ticket = Ticket.objects.create(
            student=student,
            title=title,
            issue_type=issue_type,
            priority=priority,
            status='Open',
            assigned_to=assigned_user
        )

        # Add initial chat message
        TicketChat.objects.create(
            ticket=ticket,
            sender=user_role,
            message=message
        )

        return Response({
            'success': True,
            'ticket_id': ticket.id,
            'ticket_ref': ticket.ticket_id,
            'title': ticket. title,
            'issue_type': ticket.issue_type,
            'priority': ticket.priority,
            'status': ticket.status
        }, status=status.HTTP_201_CREATED)

    

# This is for Geting Chats in Ticket
class StudentTicketChatAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            ticket = Ticket.objects.get(id=id)

        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        chats = TicketChat.objects.filter(ticket=ticket)
        

        for chat in chats:
            if chat.sender in ['admin', 'coordinator']:
                chat.message_status = 'Open'
                chat.save()

        chat_serializer = TicketChatSerializer(chats, many=True)
        ticket_serializer = TicketSerializer(ticket)

        return Response({
            'all_message': chat_serializer.data,
            'ticket_info': ticket_serializer.data
        }, status=status.HTTP_200_OK)
    



class StudentTicketChatMessageAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get('message')
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        ticket = get_object_or_404(Ticket, id=id)
        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()

        # Optional: Make sure the ticket belongs to the logged-in student
        if ticket.student != student:
            return Response({'error': 'This ticket does not belong to you.'}, status=status.HTTP_403_FORBIDDEN)

        # Update ticket status based on current state
        if ticket.status == 'Answered':
            ticket.status = 'Your-Query'
            ticket.save()
        elif ticket.status == 'Closed':
            ticket.status = 'Open'
            ticket.save()

        # Create the chat message
        chat = TicketChat.objects.create(
            ticket=ticket,
            sender=request.user.role,
            message=message
        )

        serializer = TicketChatSerializer(chat)

        return Response({
            'success': True,
            'ticket_id': ticket.id,
            'ticket_title': ticket.title,
            'issue_type': ticket.issue_type,
            'ticket_status': ticket.status,
            'message_info': serializer.data
        }, status=status.HTTP_201_CREATED)




class StudentTicketstatus(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        update_status = 'Closed'
        
        if not update_status:
            return Response({'error': 'Missing update_status in request'}, status=status.HTTP_400_BAD_REQUEST)

        ticket = get_object_or_404(Ticket, id=id)
        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        # Optionally: Check if the ticket belongs to the student making the request
        if ticket.student != student:
            return Response({'error': 'You do not have permission to update this ticket.'}, status=status.HTTP_403_FORBIDDEN)

        ticket.status = update_status
        ticket.save()

        return Response({'message': 'Status updated successfully.'}, status=status.HTTP_200_OK)





class StudentALLBatchChatsAPIView(ListAPIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]
    serializer_class = AllChatsSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['batch__batch_id', 'batch__status', 'batch__trainer__name', 'batch__course__name']
    filterset_fields = ['batch__status']

    def get_queryset(self):
        if self.request.user.role != 'student':
            return Chats.objects.none()

        student = Student.objects.filter(
            Q(enrollment_no=self.request.user.username) | Q(email=self.request.user.email)
        ).first()

        if not student:
            return Chats.objects.none()

        batches = Batch.objects.filter(student=student)
        if not batches.exists():
            return Chats.objects.none()

        return Chats.objects.filter(batch__in=batches).select_related(
            'batch', 'batch__trainer', 'batch__course', 'batch__batch_time'
        ).prefetch_related('messages')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if not queryset.exists():
            return Response({'error': 'No batch chats found for student'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Optional: sort by batch_status color
        status_priority = {'Green': 0, 'Yellow': 1, 'Red': 2}
        sorted_data = sorted(data, key=lambda x: status_priority.get(x['batch_status'], 3))

        return Response({'all_batch_chats': sorted_data}, status=status.HTTP_200_OK)




class StudentBatchChatsMessage(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Identify the student
        student = Student.objects.filter(
            Q(enrollment_no=request.user.username) | Q(email=request.user.email)
        ).first()

        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure batch is assigned to this student
        batch = Batch.objects.filter(id=id, student=student).first()
        if not batch:
            return Response({'error': 'Batch not found or not assigned to the student'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch chat associated with the batch
        chat_ids = Chats.objects.filter(batch=batch).values_list('id', flat=True)
        if not chat_ids:
            return Response({'error': 'No chat found for this batch'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch messages once
        messages_queryset = ChatMessage.objects.filter(chat__in=chat_ids).select_related('send_by', 'chat__batch')

        final_messages = []
        self_messages = []

        for msg in messages_queryset:
            sender_name = "CRAW Support" if msg.sender in ['coordinator', 'admin'] else (msg.send_by.first_name if msg.send_by else "Unknown")

            message_data = {
                'id': msg.id,
                'chat__batch__batch_id': msg.chat.batch.batch_id,
                'sender': msg.sender,
                'send_by': sender_name,
                'message': msg.message,
                'gen_time': msg.gen_time
            }

            final_messages.append(message_data)

            # If message was sent by the logged-in student
            if msg.send_by == request.user:
                self_messages.append(message_data)

        return Response({
            'messages': final_messages,
            'self_message': self_messages
        }, status=status.HTTP_200_OK)




class StudentBatchChatsMessageSender(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, id):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get('message')
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Identify the student
        student = Student.objects.filter(
            Q(enrollment_no=request.user.username) | Q(email=request.user.email)
        ).first()
        
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure batch is assigned to this student
        batch = Batch.objects.filter(id=id, student=student).first()
        if not batch:
            return Response({'error': 'Batch not found or not assigned to the student'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch chat associated with the batch
        chat = Chats.objects.filter(batch=batch).first()
        if not chat:
            return Response({'error': 'No chat found for this batch'}, status=status.HTTP_404_NOT_FOUND)

        # Create the message
        ChatMessage.objects.create(
            chat=chat,
            sender=request.user.role ,
            send_by=request.user,    # Ensure this aligns with your SENDER_CHOICES
            message=message,
        )

        return Response({'success': 'Message sent successfully'}, status=status.HTTP_201_CREATED)

