from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Student, Installment, FeesRecords, StudentCourse
from .serializer import StudentSerializer, InstallmentSerializer, StudentCourseSerializer
from nexus.models import Batch
from django.db.models import Q
from rest_framework.authtoken.models import Token
from nexus.serializer import BatchStudentAssignment
from django.utils.timezone import now
from django.http import FileResponse
import os
from django.core.mail import EmailMessage
from nexus.generate_certificate import generate_certificate, get_certificate_path


# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

# ✅ Student List API (Only for Coordinators)
class StudentListView(APIView):
    # authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        # if request.user.role == 'admin':  # Ensure `role` exists in the User model
        students = Student.objects.prefetch_related('courses').select_related('course_counsellor', 'support_coordinator')
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
        # return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

class StudentCrawListView(APIView):
    def get(self, request, *args, **kwargs):
        today = now().date()  # ✅ Get today's date
        
        total_students = Student.objects.count()
        
        active_students = Student.objects.filter(status='Active')
        active_students_count = active_students.count()
        
        inactive_students = Student.objects.exclude(status='Active')
        inactive_students_count = inactive_students.count()
        
        enrolled_students = Student.objects.filter(
            id__in=BatchStudentAssignment.objects.values('student')
        ).distinct()
        enrolled_students_count = enrolled_students.count()
        
        not_enrolled_students = Student.objects.exclude(
            id__in=BatchStudentAssignment.objects.values('student')
        )
        not_enrolled_students_count = not_enrolled_students.count()

        # ✅ Filter students added today
        today_students = Student.objects.filter(date_of_joining=today)
        today_students_count = today_students.count()

        # ✅ Serialize all categories
        active_students_serializer = StudentSerializer(active_students, many=True)
        inactive_students_serializer = StudentSerializer(inactive_students, many=True)
        enrolled_students_serializer = StudentSerializer(enrolled_students, many=True)
        not_enrolled_students_serializer = StudentSerializer(not_enrolled_students, many=True)
        today_serializer = StudentSerializer(today_students, many=True)  # ✅ Today's students

        # ✅ Return the response in a proper dictionary format
        return Response({
            "total_student": total_students,
            "active_student_count": active_students_count,
            "inactive_student_count": inactive_students_count,
            "enrolled_student_count": enrolled_students_count,
            "not_enrolled_student_count": not_enrolled_students_count,
            "today_added_student_count": today_students_count,

            # ✅ Lists of students
            "active_students": active_students_serializer.data,
            "inactive_students": inactive_students_serializer.data,
            "enrolled_students": enrolled_students_serializer.data,
            "not_enrolled_students": not_enrolled_students_serializer.data,
            "today_added_students": today_serializer.data,
        })
    

# ✅ Add Student API (Only for Coordinators)
class AddStudentView(APIView):
    def post(self, request):
        # if request.user.role == 'admin':
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save()
            return Response({'message': 'Student added successfully', 'student_id': student.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)



# ✅ Edit Student API with email update handling
class EditStudentView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def put(self, request, id):
        # if request.user.role == 'admin':
        student = get_object_or_404(Student, id=id)
        old_email = student.email  # Store old email before update
        
        serializer = StudentSerializer(student, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            # ✅ Update User email if changed
            new_email = serializer.validated_data.get('email')
            if old_email and new_email and old_email != new_email:
                try:
                    user = User.objects.get(email=old_email)
                    user.email = new_email
                    user.save()
                except User.DoesNotExist:
                    pass  # User record might not exist if not linked

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)



# ✅ Add Fees API
class AddFeesView(APIView):
    # authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    # permission_classes = [IsAuthenticated]

    def post(self, request, student_id):
        # if request.user.role == 'admin':
        student = get_object_or_404(Student, id=student_id)
        data = request.data
        payment = float(data['payment'])

        student.installment.paid_fees += payment
        student.installment.due_fees -= payment
        student.installment.ins_paid += 1
        student.installment.ins_rem -= 1
        if student.installment.paid_fees >= student.installment.total_fee:
            student.installment.is_completed = True
            student.installment.ins_rem = 0
        student.installment.save()

        FeesRecords.objects.create(
            student=student,
            installments=student.installment,
            counsellor_id=data['counsellor'],
            payment_date=data['payment_date'],
            payment=payment,
            pay_mode=data['pay_mode'],
            transition_id=data['transition_id']
        )

        return Response({'message': 'Fees added successfully'}, status=status.HTTP_201_CREATED)
        
        # else:
        #     return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)




# # ✅ Student Info API
# class StudentInfoView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id):
#         if request.user.role == 'admin':
#             student = get_object_or_404(Student, id=id)
#             serializer = StudentSerializer(student)
#             return Response(serializer.data, status=status.HTTP_200_OK)
        
#         else:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)





class StudentInfoAPIView(APIView):
    # authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        # Get the student by ID
        student = get_object_or_404(Student, id=id)

        # Fetch student's enrolled courses
        student_courses = StudentCourse.objects.filter(student=student).select_related('course')
        
        student_course_list = [
            {
                'id': course.id,
                'course_name': course.course.name,
                'course_taken': Batch.objects.filter(student=student, course=course.course).count(),
                'course_status': course.status,
                'course_certificate_date': course.certificate_date,
            }
            for course in student_courses
        ]

        # Fetch batches based on status
        batch_statuses = ['Upcoming', 'Completed', 'Running', 'Hold']
        student_batches = {
            status: Batch.objects.filter(student=student, status=status).select_related('course', 'trainer', 'batch_time')
            for status in batch_statuses
        }

        # Get all upcoming batches for the student's courses
        student_course_ids = student_courses.values_list("course_id", flat=True)
        all_upcoming_batches = Batch.objects.filter(course_id__in=student_course_ids, status='Upcoming')

        # Get completed and ongoing course IDs to exclude from upcoming batches
        student_completed_course_ids = student_courses.filter(status__in=['Completed', 'Ongoing']).values_list('course_id', flat=True)

        # Exclude already assigned upcoming batches
        filtered_upcoming_batches = all_upcoming_batches.exclude(
            course_id__in=student_completed_course_ids
        ).exclude(id__in=student_batches['Upcoming'].values_list("id", flat=True))

        # Update student course status based on batch status
        StudentCourse.objects.filter(student=student, course__in=student_batches['Upcoming'].values_list("course_id", flat=True)).update(status='Upcoming')

        # Get total student count
        student_count = Student.objects.count()

        # Build response data
        response_data = {
            "All_in_One": {
                'student_count': student_count,
                'student': StudentSerializer(student).data,
                'student_courses': student_course_list,
                'student_batch_upcoming': list(student_batches['Upcoming'].values(
                    *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
                )),
                'student_batch_hold': list(student_batches['Hold'].values(
                    *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
                )),
                'student_batch_ongoing': list(student_batches['Running'].values(
                    *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
                )),
                'student_batch_completed': list(student_batches['Completed'].values(
                    *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
                )),
                'all_upcoming_batch': list(filtered_upcoming_batches.values(
                    *[field.name for field in Batch._meta.fields], 'course__name', 'trainer__name', 'batch_time__start_time', 'batch_time__end_time'
                )),
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)


class StudentCourseEditAPIView(APIView):
    """API to edit an existing StudentCourse record."""
    # permission_classes = [IsAuthenticated]  # Uncomment to enable authentication

    def patch(self, request, id, *args, **kwargs):
        """Allows partial updates (e.g., only updating status or certificate_date)."""
        student_course = get_object_or_404(StudentCourse, id=id)
        serializer = StudentCourseSerializer(student_course, data=request.data, partial=True)  # Partial update

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "StudentCourse updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        # # Ensure status is "Complete" before processing
        # if student_course.status != "Completed":
        #     return Response({'error': 'Certificate can only be generated for completed courses'}, status=status.HTTP_400_BAD_REQUEST)




class GenerateCertificateAPIView(APIView):
    def patch(self, request, id, *args, **kwargs):
        student_course = get_object_or_404(StudentCourse, id=id)

        # Ensure course is marked as "Completed"
        if student_course.status != "Completed":
            return Response({'error': 'Certificate can only be generated for completed courses'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = StudentCourseSerializer(student_course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  # Save partial update first

            # Fetch necessary details
            student = student_course.student
            course = student_course.course
            certificate_no = student.enrollment_no
            certificate_date = student_course.certificate_date

            # Generate certificate
            file_path = generate_certificate(course.name, student.name, certificate_no, certificate_date)

            if os.path.exists(file_path):
                # ✅ Update student_certificate_allotment to True
                student_course.student_certificate_allotment = True
                student_course.save(update_fields=['student_certificate_allotment'])

                # 📧 Send Email Notification
                subject = f"🎉 Congratulations, {student.name}! Your {course.name} Certificate is Here!"
                message = f"""
Dear {student.name},

We’re thrilled to congratulate you on successfully completing the {course.name} course at Craw Cyber Security! 
Your dedication and hard work have paid off, and we are delighted to issue your official certificate.

🏷️ Student Enrollment Number: {student.enrollment_no}
📅 Date of Issue: {certificate_date}

Your certificate is attached to this email—feel free to showcase it in your portfolio, LinkedIn profile, or anywhere that highlights your achievements. 
This milestone is just the beginning of your journey in cybersecurity, and we’re excited to see where your skills take you next!

If you have any questions or need further assistance, don’t hesitate to reach out.

🚀 Keep learning, keep growing, and keep securing the digital world!

Best regards,  
🚀 Craw Cyber Security Team  
📧 training@craw.in  
📞 +919513805401  
🌐 https://www.craw.in/
                """

                from_email = "noreply@yourdomain.com"
                try:
                    email = EmailMessage(subject, message, from_email, [student.email])
                    email.attach_file(file_path)  # Attach generated certificate PDF
                    email.send()
                except Exception as e:
                    return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # ✅ Fix: Open file WITHOUT closing it prematurely
                certificate_file = open(file_path, 'rb')
                return FileResponse(certificate_file, content_type='application/pdf')

            return Response({'error': 'Certificate generation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# ✅ Delete Student API with user & token deletion
class DeleteStudentView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        # if request.user.role == 'admin':
        student = get_object_or_404(Student, id=id)

        # Attempt to get the associated user
        user = None
        if student.enrollment_no:
            user = User.objects.filter(username=student.enrollment_no).first()

        # Delete the student record
        student.delete()

        if user:
            # Delete associated token(s)
            Token.objects.filter(user=user).delete()
            # Delete the user account linked to the student
            user.delete()

        return Response(
            {'detail': 'Student, associated user, and authentication token deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

        # return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)




class DownloadCertificateAPIView(APIView):
    def get(self, request, id, *args, **kwargs):
        # Fetch the student course
        student_course = get_object_or_404(StudentCourse, id=id)

        # Ensure the certificate was allotted
        if not student_course.student_certificate_allotment:
            return Response({'error': 'Certificate not generated yet'}, status=status.HTTP_404_NOT_FOUND)

        # Get the file path of the certificate
        file_path = get_certificate_path(student_course.course.name, student_course.student.name, student_course.student.enrollment_no)

        # Ensure the file exists
        if os.path.exists(file_path):
            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        
        return Response({'error': 'Certificate file not found'}, status=status.HTTP_404_NOT_FOUND)