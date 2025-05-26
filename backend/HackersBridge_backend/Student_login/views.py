import os
import base64
from io import BytesIO
from pdf2image import convert_from_path

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
# from .serializer import StudentLoginSerializer
from Student.serializer import StudentSerializer
from nexus.serializer import BatchSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authtoken.models import Token
from Student.models import Student, StudentCourse, StudentNotes
from nexus.models import Batch, Attendance, StudentBatchRequest, Announcement, Ticket, TicketChat
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

User = get_user_model()


{

# class StudentLoginView(APIView):
#     def post(self, request):
#         serializer = StudentLoginSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.validated_data['user']
#             refresh = RefreshToken.for_user(user)
#             access_token = str(refresh.access_token)
#             role = user.role
#             username = user.username
#             useremail = user.email

#             student_id = Student.objects.filter(Q(enrollment_no = username) | Q(email = useremail)).values('id', 'enrollment_no', 'name')
#             user_info = {'role': role,
#                          'token':access_token}

#             response = Response({'message': 'Login successful',
#                                  'student_id': student_id,
#                                  'user_info':user_info}, status=status.HTTP_200_OK)

#             response.set_cookie(
#                 key='access_token',
#                 value=access_token,
#                 httponly=True,
#                 secure=False,  # ✅ Allow HTTP during local dev
#                 samesite='Lax'
#             )
#             response.set_cookie(
#                 key='user_role',
#                 value=role,
#                 httponly=False,  # ✅ Allows frontend to read
#                 secure=False,
#                 samesite='Lax'
#             )

#             return response

#         return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
    



# class JWTAuthFromCookie(JWTAuthentication):
#     def authenticate(self, request):
#         token = request.COOKIES.get('access_token')

#         if not token:
#             print("No access_token cookie found")
#             return None

#         try:
#             validated_token = self.get_validated_token(token)
#             user = self.get_user(validated_token)
#             return user, validated_token
#         except Exception as e:
#             print("JWT cookie authentication failed:", str(e))
#             raise AuthenticationFailed('Invalid or expired token')

}



class StudentMeView(APIView):

    # def get(self, request):
    #     return Response({'Error':'Nhi milega bhi'})
    # # authentication_classes = [JWTAuthFromCookie]
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("Cookies received:", request.COOKIES)  # ✅ debug line

        user = request.user
        return Response({
            'user_info': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
            }
        })



{
# class StudentMeView(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         return Response({
#             'user_info': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'role': user.role,
#                 'token': str(request.auth)  # Send back token if needed
#             }
#         })




# class StudentMeView(APIView):
#     def post(self, request):
#         serializer = StudentLoginSerializer(data=request.data)

#         if serializer.is_valid():
#             user = serializer.validated_data['user']
#             token, created = Token.objects.get_or_create(user=user)
            
            
#             # Redirect to password reset if it's first login
#             if serializer.validated_data.get('first_login'):
#                 return Response({
#                     'message': "First login detected. Please reset your password.",
#                     'redirect_to': "/reset-password/",
#                     'username':user.username,
#                     'token': token.key,
#                     'role':user.role
#                 }, status=status.HTTP_307_TEMPORARY_REDIRECT)

#             return Response({
#                 'username': user.username,
#                 'role': user.role,
#                 'token': token.key
#             }, status=status.HTTP_200_OK)

#         return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
}



class StudentInfoView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_email = request.user.email
        user_name = request.user.username

        try:
            student = Student.objects.get(Q(enrollment_no=user_name) | Q(email=user_email))
        except Student.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        def mask_phone(phone):
            if phone and len(phone) >= 4:
                return phone[:5] + 'X' * (len(phone) - 4)
            return phone

        def mask_email(email):
            if email and '@' in email:
                name, domain = email.split('@', 1)
                return name[:5] + 'X' * (len(name) - 5) + '@' + domain
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
            'course_counsellor': student.course_counsellor.name,
            'support_coordinator': student.support_coordinator.name,
            'address': student.address,
        }

        student_courses = StudentCourse.objects.filter(student=student).select_related('course')

        student_course_list = [
            {
                'id': course.id,
                'course_name': course.course.name if course.course else None,
                'course_status': course.status,
                'student_book_allotment': course.student_book_allotment,
                'course_certificate_date': course.certificate_date,
                'certificate_issued_at': course.certificate_issued_at,
                'course_taken': Batch.objects.filter(student=student, course=course.course).count() if course.course else 0,
            }
            for course in student_courses
        ]

        return Response({
            'studentinfo': student_info,
            'studentcourse': student_course_list
        }, status=status.HTTP_200_OK)
    

{
# class StudentBatchListView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role != 'student':
#             return Response({'error':'User is not Authorized.'}, status=status.HTTP_401_UNAUTHORIZED)
        
#         user_email = request.user.email
#         user_name = request.user.username 

#         student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).values('id')

#         batches = Batch.objects.filter(student__id=student)
#         all_batchs = {
#             'Ongoing_batch':BatchSerializer(batches.filter(status='Running'), many=True).data,
#             'Shedule_batch':BatchSerializer(batches.filter(status='Upcoming'), many=True).data,
#             'Completed_batch':BatchSerializer(batches.filter(status='Completed'), many=True).data,
#         }


#         # serilaizer = BatchSerializer(batches, many=True).data
#         return Response({'batch':all_batchs})
}    


class StudentBatchListView(APIView):
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]
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
                    ]

        batch_data = Batch.objects.filter(id=id).values(*batch_fields)
        
        from datetime import date

        today = date.today() 

        student_attendance = Attendance.objects.filter(student=student, batch_id = id).values('id', 'date', 'attendance')

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
                         'overall_percentage':overall_percentage
                         }, status=status.HTTP_200_OK)



class BatchCertificateDownloadView(APIView):
    authentication_classes = [JWTAuthentication]
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



{

# class AllStudentCertificate(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id=None):
#         if request.user.role != 'student':
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         user_email = request.user.email
#         user_name = request.user.username

#         student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
#         if not student:
#             return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#         student_courses = StudentCourse.objects.filter(student=student).select_related('course')

#         certificates = []

#         for sc in student_courses:
#             file_path = get_certificate_path(sc.course.name, sc.student.name, sc.student.enrollment_no)

#             if os.path.exists(file_path):
#                 return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
#             else:
#                 certificates.append({
#                     'course_name': sc.course.name,
#                     'certificate_available': False,
#                     'message': 'Certificate not generated yet.'
#                 })

#         return Response({'certificates': certificates}, status=status.HTTP_200_OK)



# class AllStudentCertificate(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role != 'student':
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         user_email = request.user.email
#         user_name = request.user.username

#         student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
#         if not student:
#             return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#         student_courses = StudentCourse.objects.filter(student=student, status='Completed').select_related('course')
#         if not student_courses.exists():
#             return Response({'error': 'No completed courses found'}, status=status.HTTP_404_NOT_FOUND)

#         certificates = []

#         for sc in student_courses:
#             file_path = get_certificate_path(sc.course.name, sc.student.name, sc.student.enrollment_no)

#             if os.path.exists(file_path):
#                 download_url = request.build_absolute_uri(
#                     reverse('student_certificate_download', kwargs={'course_id': sc.course.id})
#                 )
#                 certificates.append({
#                     'course_name': sc.course.name,
#                     'certificate_available': True,
#                     'download_url': download_url
#                 })
#             else:
#                 certificates.append({
#                     'course_name': sc.course.name,
#                     'certificate_available': False,
#                     'message': 'Certificate not generated yet.'
#                 })

#         return Response({'certificates': certificates}, status=status.HTTP_200_OK)



# class DownloadStudentCertificate(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, course_id):
#         if request.user.role != 'student':
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         user_email = request.user.email
#         user_name = request.user.username

#         student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
#         if not student:
#             return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#         student_course = StudentCourse.objects.filter(student=student, course__id=course_id).select_related('course').first()
#         if not student_course:
#             return Response({'error': 'Course not found or not assigned to student'}, status=status.HTTP_404_NOT_FOUND)

#         file_path = get_certificate_path(student_course.course.name, student.name, student.enrollment_no)

#         if os.path.exists(file_path):
#             return FileResponse(open(file_path, 'rb'), content_type='application/pdf')

#         return Response({'error': 'Certificate not generated yet.'}, status=status.HTTP_404_NOT_FOUND)


}

{
# class AllStudentCertificate(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role != 'student':
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         user_email = request.user.email
#         user_name = request.user.username

#         student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
#         if not student:
#             return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#         student_courses = StudentCourse.objects.filter(student=student).select_related('course')
#         # if not student_courses.exists():
#         #     return Response({'error': 'No completed courses found'}, status=status.HTTP_404_NOT_FOUND)

#         certificates = []

#         for sc in student_courses:
#             file_path = get_certificate_path(sc.course.name, sc.student.name, sc.student.enrollment_no)

#             if os.path.exists(file_path):
#                 download_url = request.build_absolute_uri(
#                     reverse('student_certificate_download', kwargs={'course_id': sc.course.id})
#                 )
#                 certificates.append({
#                     'course_name': sc.course.name,
#                     'certificate_available': True,
#                     'certificate_date': sc.certificate_date,
#                     'download_url': download_url
#                 })
#             else:
#                 certificates.append({
#                     'course_name': sc.course.name,
#                     'certificate_available': False,
#                     'certificate_date': sc.certificate_date,
#                     'message': 'Certificate not generated yet.'
#                 })

#         return Response({'certificates': certificates}, status=status.HTTP_200_OK)
}



class AllStudentCertificate(APIView):
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]
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
    


{

    # batch_fields = [
    #     'id',
    #     'batch_id',
    #     'batch_time__start_time',
    #     'batch_time__end_time',
    #     'start_date',
    #     'end_date',
    #     'course__name',
    # ]

    # def get(self, request, id):
    #     if request.user.role != 'student':
    #         return Response({'error':'User is not Authorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
    #     user_email = request.user.email
    #     user_name = request.user.username

    #     # Fetch a single student object
    #     student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).values('id')
        
    #     if not student:
    #         return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

    #     batch_list = Batch.objects.filter(student=student)

    #     print(batch_list)
    
}


### This is for creating all batch Attendance
{
# # views.py
# from utils import create_daily_attendance_records

# def create_attendance_for_all_batches_view(request):
#     if request.method != 'GET':
#         return JsonResponse({'error': 'Invalid method'}, status=405)

#     batches = Batch.objects.prefetch_related('student').all()
#     created_count = 0

#     for batch in batches:
#         students = batch.student.all()
#         if not students:
#             continue

#         existing_student_ids = Attendance.objects.filter(batch=batch) \
#                                 .values_list('student_id', flat=True).distinct()
#         students_to_add = [s for s in students if s.id not in existing_student_ids]

#         if students_to_add:
#             create_daily_attendance_records(
#                 batch=batch,
#                 students=students_to_add,
#                 start_date=batch.start_date,
#                 end_date=batch.end_date,
#                 preferred_week=batch.preferred_week
#             )
#             created_count += len(students_to_add)

#     return JsonResponse({'message': f'Attendance created for {created_count} students (if missing).'})
}

### For mark present those student whose batch completed 
{
# from .utils import mark_attendance_present_for_completed_batches

# def batch_attendance_present(request):
#     message = mark_attendance_present_for_completed_batches()
#     return JsonResponse({'message': message})
}


{
# class StudentBatchRequestAPI(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         # Only students allowed
#         if getattr(request.user, 'role', None) != 'student':
#             return Response({'error': 'Unauthorized access. Only students are allowed.'}, status=status.HTTP_401_UNAUTHORIZED)

#         email = request.user.email
#         username = request.user.username
#         request_batch_code = request.data.get('batch_code')

#         if not request_batch_code:
#             return Response({'error': 'Batch code is required.'}, status=status.HTTP_400_BAD_REQUEST)

#         # Get student instance
#         student = Student.objects.filter(Q(enrollment_no=username) | Q(email=email)).first()
#         if not student:
#             return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

#         # Get student courses
#         student_courses = StudentCourse.objects.filter(student=student).select_related('course')
#         student_course_ids = student_courses.values_list("course_id", flat=True)

#         # Get batch IDs where student is already enrolled in "Upcoming" batches
#         student_upcoming_batch_ids = Batch.objects.filter(
#             student=student, status='Upcoming'
#         ).values_list('id', flat=True)

#         # Get course IDs that are already completed or ongoing
#         completed_or_ongoing_course_ids = student_courses.filter(
#             status__in=['Completed', 'Ongoing']
#         ).values_list('course_id', flat=True)

#         # Fetch all upcoming batches for the student's courses
#         all_upcoming_batches = Batch.objects.filter(
#             course_id__in=student_course_ids,
#             status='Upcoming'
#         )

#         # Filter out already assigned batches and completed/ongoing course batches
#         filtered_upcoming_batches = all_upcoming_batches.exclude(
#             course_id__in=completed_or_ongoing_course_ids
#         ).exclude(id__in=student_upcoming_batch_ids)

#         # Find batch by code
#         matching_batches = filtered_upcoming_batches.filter(batch_id=request_batch_code)

#         if matching_batches.exists():
#             batch_instance = matching_batches.first()

#             # Check if a request already exists
#             if StudentBatchRequest.objects.filter(student=student, batch=batch_instance).exists():
#                 return Response({'message': 'Request for this batch already submitted.'}, status=status.HTTP_409_CONFLICT)

#             # Create StudentBatchRequest entry
#             StudentBatchRequest.objects.create(
#                 student=student,
#                 batch=batch_instance,
#                 request_type='Batch Request',
#                 batch_request='Pending'
#             )

#             return Response({'message': 'Batch request submitted successfully.'}, status=status.HTTP_201_CREATED)

#         else:
#             return Response({'message': 'Student is not eligible or already enrolled in this batch.'}, status=status.HTTP_404_NOT_FOUND)
}

        
class StudentBatchRequestAPI(APIView):
    authentication_classes = [JWTAuthentication]
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

{

# class StudentTicketCreateAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if request.user.role != 'student':
#             return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

#         user_email = request.user.email
#         user_name = request.user.username
#         issue_type = request.data.get('issue_type')
#         title = request.data.get('title')
#         description = request.data.get('description')

#         # Fetch a single student object
#         student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()

#         if not student:
#             return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)
        
#         Ticket.objects.create(
#             student=student,
#             issue_type=issue_type,
#             title=title,
#             description=description,
#             status='In Progress',
#             is_active=True
#         )

#         return Response({'message':'Ticket Send...'}, status=status.HTTP_201_CREATED)
    }


class StudentAnnouncementAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        user_email = request.user.email
        user_name = request.user.username

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        
        All_Announcement = Announcement.objects.all().values('subject', 
                                                                'text', 
                                                                'file', 
                                                                'batch__batch_id', 
                                                                'student', 
                                                                'created_by', 
                                                                'announcement_type',
                                                                'gen_time'
                                                                )

        return Response({'All_Announcement' : All_Announcement}, status=status.HTTP_200_OK)


class StudentRecommendedAPIView(APIView):
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        user_email = request.user.email
        user_name = request.user.username
        user_role = request.user.role

        student = Student.objects.filter(Q(enrollment_no=user_name) | Q(email=user_email)).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title')
        issue_type = request.data.get('issue_type')
        message = request.data.get('message')

        if not title or not issue_type or not message:
            return Response({'error': 'Title, issue_type, and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create ticket
        ticket = Ticket.objects.create(
            student=student,
            title=title,
            issue_type=issue_type,
            status='Raise'
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
            'title': ticket.title,
            'issue_type': ticket.issue_type,
            'status': ticket.status
        }, status=status.HTTP_201_CREATED)
    

class StudentTicketChatAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        return Response("Hello")