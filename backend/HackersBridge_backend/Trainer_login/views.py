from urllib import request
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from nexus.models import  Batch, Attendance, Announcement, BatchStudentAssignment,Course,Chats,ChatMessage
from Student.models import Student
from datetime import datetime, date as dt_date
from django.utils import timezone
from django.contrib.auth import get_user_model
from Trainer.models import Trainer
from django.utils import timezone
from nexus.serializer_announcement import AnnouncementCreateSerializer
from django.db.models import Q
from django.utils.timezone import localdate,localtime
from django.utils.timezone import now
import logging
from rest_framework.parsers import MultiPartParser, FormParser
from nexus.JWTCookie import JWTAuthFromCookie


User = get_user_model()


from datetime import timedelta

def get_valid_class_days(batch):
    """
    Return all valid class dates based on batch's preferred_week.
    """
    if not (batch.start_date and batch.end_date):
        return []

    total_days = (batch.end_date - batch.start_date).days + 1
    all_dates = [batch.start_date + timedelta(days=i) for i in range(total_days)]

    if batch.preferred_week == 'Weekdays':
        return [d for d in all_dates if d.weekday() < 5]  # Mon–Fri
    elif batch.preferred_week == 'Weekends':
        return [d for d in all_dates if d.weekday() >= 5]  # Sat–Sun
    else:
        return all_dates  # fallback


class TrainerInfoAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'Trainer':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            trainer = Trainer.objects.select_related('coordinator', 'location', 'teamleader').get(
                Q(email=request.user.email) & Q(trainer_id=request.user.username)
            )
        except Trainer.DoesNotExist:
            return Response({'error': 'Trainer not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Masking utilities
        def mask_phone(phone):
            return phone[:5] + 'X' * (len(phone) - 4) if phone and len(phone) >= 4 else phone

        def mask_email(email):
            if email and '@' in email:
                name, domain = email.split('@', 1)
                masked_name = name[:5] + 'X' * max(len(name) - 5, 0) if len(name) > 5 else 'XXXXX'
                return f"{masked_name}@{domain}"
            return email

        # Trainer info
        trainer_info = {
            'trainer_id': trainer.trainer_id,
            'name': trainer.name,
            'phone': mask_phone(trainer.phone),
            'email': mask_email(trainer.email),
            'week_off': trainer.weekoff,
            'coordinator': trainer.coordinator.name if trainer.coordinator else None,
            'leave_status': trainer.leave_status,
            'experience': trainer.experience,
            'date_of_joining': trainer.date_of_joining.strftime('%Y-%m-%d') if trainer.date_of_joining else None,
            'location': trainer.location.locality if trainer.location else None,
            'team_leader': trainer.teamleader.name if trainer.teamleader else None,
            'is_teamleader': trainer.is_teamleader,
        }

        # All courses assigned to trainer
        trainer_courses = Course.objects.filter(batch__trainer=trainer).distinct()

        trainer_course_list = []

        for course in trainer_courses:
            # All batches for this trainer & course
            batches = Batch.objects.filter(trainer=trainer, course=course).select_related(
                'location', 'batch_time', 'batch_coordinator', 'trainer'
            ).prefetch_related('student')

            batch_list = []

            for batch in batches:
                # Get students assigned to this batch
                assignments = BatchStudentAssignment.objects.filter(batch=batch).select_related(
                    'student', 'coordinator', 'student__support_coordinator'
                )

                student_list = []
                for assignment in assignments:
                    student = assignment.student
                    coordinator_name = (
                        student.support_coordinator.name if student.support_coordinator
                        else (assignment.coordinator.name if assignment.coordinator else None)
                    )

                    student_list.append({
                        'student_id': student.id,
                        'student_name': student.name,
                        'status': student.status,
                        'enrollment_no': student.enrollment_no,
                        'coordinator': coordinator_name,
                    })

                batch_list.append({
                    "id": batch.id,
                    "batch_id": batch.batch_id,
                    "mode": batch.mode,
                    "status": batch.status,
                    "language": batch.language,
                    "start_date": batch.start_date,
                    "end_date": batch.end_date,
                    "batch_link": batch.batch_link,
                    "preferred_week": batch.preferred_week,
                    "course": batch.course.name if batch.course else None,
                    "trainer_name": batch.trainer.name if batch.trainer else None,
                    "location": batch.location.locality if batch.location else None,
                    "start_time": batch.batch_time.start_time if batch.batch_time else None,
                    "end_time": batch.batch_time.end_time if batch.batch_time else None,
                    "batch_coordinator": batch.batch_coordinator.name if batch.batch_coordinator else None,
                    
                    "student_count": assignments.count(),
                    "students": student_list,
                })

            trainer_course_list.append({
                'id': course.id,
                'course_name': course.name,
                'batch_count': Batch.objects.filter(trainer=trainer, course=course).count(),
                'batches': batch_list
            })

        return Response({
            'trainerinfo': trainer_info,
            'trainercourses': trainer_course_list
        }, status=status.HTTP_200_OK)








{
# # TrainerBatchInfoAPIView: Fetches batches assigned to the trainer
# class TrainerBatchInfoAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request): 
#         if request.user.role != 'Trainer':
#             return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

#         try:
#             trainer = Trainer.objects.get(email=request.user.email)
#         except Trainer.DoesNotExist:
#             return Response({'error': 'Trainer not found.'}, status=status.HTTP_404_NOT_FOUND)

#         batches = Batch.objects.filter(trainer=trainer).select_related('course', 'batch_time')

#         if not batches.exists():
#             return Response({'error': 'No batches found for this trainer.'}, status=status.HTTP_404_NOT_FOUND)

#         batch_data = []
#         for batch in batches:
#             students = []
#             total_batch_attendance = 0
#             counted_students = 0

#             assignments = BatchStudentAssignment.objects.filter(batch=batch).select_related('student', 'coordinator')

#             for assign in assignments:
#                 student = assign.student

#                 # Latest attendance
#                 latest_attendance = Attendance.objects.filter(
#                     student=student,
#                     batch=batch,
#                     date__lte=timezone.localdate()
#                 ).order_by('-date', '-id').first()

#                 # Attendance percentage
#                 total_classes = Attendance.objects.filter(student=student, batch=batch).count()
#                 present_classes = Attendance.objects.filter(student=student, batch=batch, attendance="Present").count()

#                 attendance_percentage = None
#                 if total_classes > 0:
#                     attendance_percentage = round((present_classes / total_classes) * 100, 2)
#                     total_batch_attendance += attendance_percentage
#                     counted_students += 1

#                 students.append({
#                     'student_id': student.id,
#                     'student_name': student.name,
#                     'enrollment_no': student.enrollment_no,
#                     'coordinator': assign.coordinator.name if assign.coordinator else None,
#                     'status': student.status,
#                     'mode': student.mode,
#                     'preferred_week': student.preferred_week,
#                     'student_batch_status': assign.student_batch_status,
#                     'attendance_id': latest_attendance.id if latest_attendance else None,
#                     'latest_attendance_date': latest_attendance.date if latest_attendance else None,
#                     'attendance_status': latest_attendance.attendance if latest_attendance else "Not Marked",
#                     'attendance_percentage': attendance_percentage
#                 })

#             # Batch-wise attendance percentage
#             batch_attendance_percentage = None
#             if counted_students > 0:
#                 batch_attendance_percentage = round(total_batch_attendance / counted_students, 2)

#             batch_info = {
#                 'id': batch.id,
#                 'batch_id': batch.batch_id,
#                 'start_date': batch.start_date,
#                 'end_date': batch.end_date,
#                 'status': batch.status,
#                 'course_name': batch.course.name if batch.course else None,
#                 'start_time': batch.batch_time.start_time if batch.batch_time else None,
#                 'end_time': batch.batch_time.end_time if batch.batch_time else None,
#                 'batch_mode': getattr(batch, 'mode', None),
#                 'batch_attendance_percentage': batch_attendance_percentage,  
#                 'students': students
#             }

#             batch_data.append(batch_info)

#         return Response(batch_data, status=status.HTTP_200_OK)    

}


# This is for geting trainer's Batch list......
class TrainerAllBatchesAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'Trainer':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_email = request.user.email
        user_name = request.user.username

        try:
            trainer = Trainer.objects.select_related('coordinator').get(
                Q(email=user_email) & Q(trainer_id=user_name)
            )
        except Trainer.DoesNotExist:
            return Response({'error': 'Trainer not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all batches assigned to the trainer
        batches = Batch.objects.filter(trainer=trainer).select_related(
            'course', 'location', 'batch_time', 'batch_coordinator'
        )

        batch_data = []
        for batch in batches:
            batch_data.append({
                "id": batch.id,
                "batch_id": batch.batch_id,
                "status": batch.status,
                "start_date": batch.start_date,
                "end_date": batch.end_date,
                "course": batch.course.name if batch.course else None,
                "mode": batch.mode,
                "language": batch.language,
                "preferred_week": batch.preferred_week,
                "location": batch.location.locality if batch.location else None,
                "batch_coordinator": batch.batch_coordinator.name if batch.batch_coordinator else None,
                "batch_link": batch.batch_link,
                "start_time": batch.batch_time.start_time if batch.batch_time else None,
                "end_time": batch.batch_time.end_time if batch.batch_time else None,
                "student_count": batch.student.count()
            })

        grouped_batches = {
            'Hold_batch': [b for b in batch_data if b['status'] == 'Hold'],
            'Ongoing_batch': [b for b in batch_data if b['status'] == 'Running'],
            'Scheduled_batch': [b for b in batch_data if b['status'] == 'Upcoming'],
            'Cancelled_batch': [b for b in batch_data if b['status'] == 'Cancelled'],
            'Completed_batch': [b for b in batch_data if b['status'] == 'Completed'],
        }

        return Response({'batches': grouped_batches}, status=status.HTTP_200_OK)

{


# class TrainerBatchInfoAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, batch_id):
#         if request.user.role != 'Trainer':
#             return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

#         user_email = request.user.email
#         user_name = request.user.username

#         try:
#             trainer = Trainer.objects.select_related('coordinator').get(
#                 Q(email=user_email) & Q(trainer_id=user_name)
#             )
#         except Trainer.DoesNotExist:
#             return Response({'error': 'Trainer not found.'}, status=status.HTTP_404_NOT_FOUND)
        
#         # Validate batch_id
#         try:
#             batch = Batch.objects.select_related('course', 'location', 'batch_time', 'batch_coordinator') \
#                                     .prefetch_related('student') \
#                                     .get(id=batch_id, trainer=trainer)
#         except Batch.DoesNotExist:
#             return Response({'error': 'Batch not found or not assigned to this trainer.'}, status=status.HTTP_404_NOT_FOUND)
        
#         # Optional date filters
#         start_date_str = request.query_params.get('start_date')
#         end_date_str = request.query_params.get('end_date')

#         try:
#             start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else None
#             end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date() if end_date_str else None
#         except ValueError:
#             return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
        
#         # batch-info 
#         batch_info = {
#                 "id": batch.id,
#                 "mode": batch.mode,
#                 "status": batch.status,
#                 "batch_id": batch.batch_id,
#                 "language": batch.language,
#                 "end_date": batch.end_date,
#                 "start_date": batch.start_date,
#                 "batch_link": batch.batch_link,
#                 "student_count": batch.student.count(),
#                 "preferred_week": batch.preferred_week,
#                 "course": batch.course.name if batch.course else None,
#                 "trainer_name": batch.trainer.name if batch.trainer else None,
#                 "location": batch.location.locality if batch.location else None,
#                 "end_time": batch.batch_time.end_time if batch.batch_time else None,
#                 "start_time": batch.batch_time.start_time if batch.batch_time else None,
#                 "batch_coordinator": batch.batch_coordinator.name if batch.batch_coordinator else None,
#         }


#         # batch_student list
#         batch_students = BatchStudentAssignment.objects.filter(batch=batch).select_related('student', 'coordinator')
#         batch_student_attendance = Attendance.objects.filter(batch=batch).select_related('student')
#         students = []
#         student_att = []
        
#         total_students = batch_students.count()


#         total_classes = batch_student_attendance.count()
#         present_students = batch_student_attendance.filter(attendance='Present').count()
#         absent_students = batch_student_attendance.filter(attendance='Absent').count()

#         present_students_in_percentage = round((present_students / total_classes) * 100, 2) if total_classes > 0 else 0
#         absent_students_in_percentage = round((absent_students / total_classes) * 100, 2) if total_classes > 0 else 0
        
#         # Get total classes 
#         class_date = Attendance.objects.filter(batch=batch, date=datetime.now().date()).values_list('date', flat=True).distinct()
#         class_total = class_date.count()

#         if class_total == 0:
#             return Response({
#                 'batch_info': batch_info,
#                 'total_students': total_students,
#                 'class_total': 0,
#                 'message': 'No classes found for this batch.'
#             }, status=status.HTTP_200_OK)

#         if batch.status == 'Completed':

#             # This is only for student list..
#             for batch_student in batch_students:
#                 student = batch_student.student

#                 # attendance percentage
#                 total_attendance = batch_student_attendance.filter(student=student).count()

#                 student_present = batch_student_attendance.filter(attendance='Present', student=student).count()
#                 student_absent = batch_student_attendance.filter(attendance='Absent', student=student).count()

#                 student_present_in_percentage = round((student_present / total_attendance) * 100, 2) if total_attendance > 0 else 0
#                 student_absent_in_percentage = round((student_absent / total_attendance) * 100, 2) if total_attendance > 0 else 0

#                 # student-list with overall persentage in the batch
#                 print(batch_student.coordinator.name if batch_student.coordinator else None,)
#                 student_list= {
#                     'student_id': student.id,
#                     'student_name': student.name,
#                     'enrollment_no': student.enrollment_no,
#                     'present_percentage': f"{student_present_in_percentage} %",
#                     'absent_percentage': f"{student_absent_in_percentage} %",
#                     'coordinator': batch_student.coordinator.name if batch_student.coordinator else None,
#                 }

#                 students.append(student_list)

#             return Response({
#                 'batch_info': batch_info,
#                 'students': students,
#                 'total_students': total_students,
#                 'present_students_in_percentage': f"{present_students_in_percentage} %",
#                 'absent_students_in_percentage': f"{absent_students_in_percentage} %",
#             }, status=status.HTTP_200_OK)
#         else:
#             for batch_student in batch_students:
#                 student = batch_student.student

#                 # latest attendance
#                 latest_attendance = batch_student_attendance.filter(student=student, date=datetime.now().date()).order_by('-date', '-id').first()

#                 student_attendance = Attendance.objects.filter(student=student, batch=batch)
#                 present_count = student_attendance.filter(attendance='Present').count()
#                 absent_count = student_attendance.filter(attendance='Absent').count()

#                 # student-list with overall persentage in the batch
#                 student_list= {
#                     'student_id': student.id,
#                     'student_name': student.name,
#                     'enrollment_no': student.enrollment_no,
#                     'total_classes': class_total,
#                     'present_count': present_count,
#                     'absent_count': absent_count,
#                     'coordinator': batch_student.coordinator.name if batch_student.coordinator else None,
#                 }

#                 student_attendance = {
#                     'student_id': student.id,
#                     'student_name': student.name,
#                     'enrollment_no': student.enrollment_no,
#                     'attendance_date': latest_attendance.date if latest_attendance else None,
#                     'student_attendance_status': latest_attendance.attendance if latest_attendance else "Not Marked",
#                 }

#                 students.append(student_list)
#                 student_att.append(student_attendance)

#             return Response({
#                 'batch_info': batch_info,
#                 'students': students,
#                 'student_attendance': student_att,
#                 'total_students': total_students,
#                 'class_total': class_total,
#                 'present_students_in_percentage': f"{present_students_in_percentage} %",
#                 'absent_students_in_percentage': f"{absent_students_in_percentage} %",
#             }, status=status.HTTP_200_OK)


}

class TrainerBatchInfoAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, batch_id):
        if request.user.role != 'Trainer':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            trainer = Trainer.objects.get(email=request.user.email, trainer_id=request.user.username)
        except Trainer.DoesNotExist:
            return Response({'error': 'Trainer not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            batch = Batch.objects.select_related('course', 'location', 'batch_time', 'batch_coordinator', 'trainer') \
                                 .prefetch_related('student') \
                                 .get(id=batch_id, trainer=trainer)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found or not assigned to the trainer.'}, status=status.HTTP_404_NOT_FOUND)

        valid_class_days = get_valid_class_days(batch)
        total_batch_classes = len(valid_class_days)

        batch_info = {
            "id": batch.id,
            "mode": batch.mode,
            "status": batch.status,
            "batch_id": batch.batch_id,
            "language": batch.language,
            "start_date": batch.start_date,
            "end_date": batch.end_date,
            "total_batch_classes": total_batch_classes,
            "batch_link": batch.batch_link,
            "student_count": batch.student.count(),
            "preferred_week": batch.preferred_week,
            "course": batch.course.name if batch.course else None,
            "trainer_name": batch.trainer.name if batch.trainer else None,
            "location": batch.location.locality if batch.location else None,
            "start_time": batch.batch_time.start_time if batch.batch_time else None,
            "end_time": batch.batch_time.end_time if batch.batch_time else None,
            "batch_coordinator": batch.batch_coordinator.name if batch.batch_coordinator else None,
        }

        batch_students = BatchStudentAssignment.objects.filter(batch=batch).select_related('student', 'coordinator', 'student__support_coordinator')
        attendance_qs = Attendance.objects.filter(batch=batch, date__in=valid_class_days).select_related('student')

        total_students = batch_students.count()
        working_days = len(valid_class_days)

        total_present = attendance_qs.filter(attendance='Present').count()
        total_absent = attendance_qs.filter(attendance='Absent').count()
        expected_total_records = total_students * working_days

        present_pct = round((total_present / expected_total_records) * 100, 2) if expected_total_records else 0
        absent_pct = round((total_absent / expected_total_records) * 100, 2) if expected_total_records else 0

        overall_attendance = {
            'total_classes': working_days,
            'total_present': total_present,
            'total_absent': total_absent,
            'total_students': total_students,
            'total_batch_classes': working_days,
            'total_batch_classes_scheduled': total_batch_classes,
            'batch_present_students_in_percentage': f"{present_pct} %",
            'batch_absent_students_in_percentage': f"{absent_pct} %",
        }

        # --- Student-wise Attendance ---
        student_list_overall = []
        for assignment in batch_students:
            student = assignment.student
            student_attendance = attendance_qs.filter(student=student)

            student_present = student_attendance.filter(attendance='Present').count()
            student_absent = student_attendance.filter(attendance='Absent').count()
            latest_attendance = student_attendance.order_by('-date', '-id').first()

            present_pct = round((student_present / working_days) * 100, 2) if working_days else 0
            absent_pct = round((student_absent / working_days) * 100, 2) if working_days else 0

            # Use student's own support coordinator
            coordinator_name = student.support_coordinator.name if student.support_coordinator else (
                assignment.coordinator.name if assignment.coordinator else None
            )

            student_list_overall.append({
                'student_id': student.id,
                'student_name': student.name,
                'status': student.status,
                'enrollment_no': student.enrollment_no,
                "total_batch_classes": working_days,
                'coordinator': coordinator_name,
                'total_classes': working_days,
                'total_present': student_present,
                'total_absent': student_absent,
                'total_attendance': student_attendance.count(),
                'latest_attendance_date': latest_attendance.date if latest_attendance else None,
                'present_percentage': f"{present_pct} %",
                'absent_percentage': f"{absent_pct} %",
            })

        # --- Daily Attendance by Date ---
        student_list_attendance = []
        if batch.status == 'Running':
            date_str = request.query_params.get('date')
            selected_date = localdate()
            if date_str:
                try:
                    selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                except ValueError:
                    return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

            if selected_date <= localdate():
                daily_qs = Attendance.objects.filter(batch=batch, date=selected_date).select_related('student')
                daily_map = {att.student.id: att for att in daily_qs}
            else:
                daily_map = {}

            for assignment in batch_students:
                student = assignment.student
                record = daily_map.get(student.id)

                # Coordinator resolution
                coordinator_name = student.support_coordinator.name if student.support_coordinator else (
                    assignment.coordinator.name if assignment.coordinator else None
                )

                student_list_attendance.append({
                    'student_id': student.id,
                    'student_name': student.name,
                    'status': student.status,
                    'enrollment_no': student.enrollment_no,
                    'attendance_status': record.attendance if record else 'Absent',
                    'attendance_date': str(selected_date),
                    "total_batch_classes": working_days,
                    'coordinator': coordinator_name,
                })

        return Response({
            'batch_data': {
                'batch_info': batch_info,
                'overall_attendance': overall_attendance,
                'student_list_overall': student_list_overall,
                'student_list_attendance': student_list_attendance,
            }
        }, status=status.HTTP_200_OK)




{

        # for batch_student in batch_students:
        #     student = batch_student.student


        #         continue

            # students.append({
            #     'student_id': student.id,
            #     'student_name': student.name,
            #     'enrollment_no': student.enrollment_no,
            #     'coordinator': batch_student.coordinator.name if batch_student.coordinator else None,
            #     'status': student.status,
            #     'mode': student.mode,
            #     'preferred_week': student.preferred_week,
            #     'student_batch_status': batch_student.student_batch_status,
            #     'attendance_id': latest_attendance.id if latest_attendance else None,
            #     'latest_attendance_date': latest_attendance.date if latest_attendance else None,
            #     'attendance_status': latest_attendance.attendance if latest_attendance else "Not Marked",
            #     'attendance_percentage': attendance_percentage
            # })

        # return Response(batch_info, status=status.HTTP_200_OK)







    # def batch_data(self, batch, start_date=None, end_date=None):
    #     students = []
    #     total_present = 0
    #     total_absent = 0
    #     total_students_all = 0

    #     # Preload all attendance records for the batch (with optional date filter)
    #     attendance_qs = Attendance.objects.filter(batch=batch)
    #     if start_date and end_date:
    #         attendance_qs = attendance_qs.filter(date__range=(start_date, end_date))

    #     attendance_by_student = {}
    #     for att in attendance_qs:
    #         attendance_by_student.setdefault(att.student_id, []).append(att)

    #     # Preload coordinator map
    #     assignments = BatchStudentAssignment.objects.select_related('coordinator') \
    #         .filter(batch=batch)
    #     coordinator_map = {a.student_id: a.coordinator.name if a.coordinator else None for a in assignments}

    #     for student in batch.student.all():
    #         student_att = attendance_by_student.get(student.id, [])
    #         present_count = sum(1 for a in student_att if a.attendance == "Present")
    #         absent_count = sum(1 for a in student_att if a.attendance == "Absent")
    #         total_classes = len(student_att)
    #         latest_attendance = max(student_att, key=lambda x: (x.date, x.id), default=None)

    #         total_present += present_count
    #         total_absent += absent_count
    #         total_classes_all += total_classes

    #         attendance_percentage = round((present_count / total_classes) * 100, 2) if total_classes > 0 else 0

    #         students.append({
    #             "student_id": student.id,
    #             "enrollment_no": student.enrollment_no,
    #             "coordinator": coordinator_map.get(student.id),
    #             "latest_attendance_status": latest_attendance.attendance if latest_attendance else "Not Marked",
    #             "last_attendance_date": latest_attendance.date if latest_attendance else None,
    #             "present_count": present_count,
    #             "absent_count": absent_count,
    #             "total_classes": total_classes,
    #             "attendance_percentage": attendance_percentage
    #         })

    #     total_students = batch.student.count()

    #     # Today's attendance stats
    #     today = timezone.localdate()
    #     today_attendance = Attendance.objects.filter(batch=batch, date=today)
    #     total_students_today = today_attendance.values('student').distinct().count()
    #     total_present_today = today_attendance.filter(attendance="Present").count()
    #     total_absent_today = today_attendance.filter(attendance="Absent").count()
    #     today_present_percentage = round((total_present_today / total_students_today) * 100, 2) if total_students_today > 0 else 0

    #     return {
    #         "id": batch.id,
    #         "batch_id": batch.batch_id,
    #         "status": batch.status,
    #         "start_date": batch.start_date,
    #         "end_date": batch.end_date,
    #         "course": batch.course.name if batch.course else None,
    #         "mode": batch.mode,
    #         "language": batch.language,
    #         "preferred_week": batch.preferred_week,
    #         "location": batch.location.locality if batch.location else None,
    #         "batch_coordinator": batch.batch_coordinator.name if batch.batch_coordinator else None,
    #         "batch_link": batch.batch_link,
    #         "start_time": batch.batch_time.start_time if batch.batch_time else None,
    #         "end_time": batch.batch_time.end_time if batch.batch_time else None,
    #         "student_count": total_students,

    #         # Overall totals
    #         "total_present": total_present,
    #         "total_absent": total_absent,
    #         "overall_present_percentage": round((total_present / total_classes_all) * 100, 2) if total_classes_all > 0 else 0,

    #         # Today's stats
    #         "today_total_students": total_students_today,
    #         "today_present_count": total_present_today,
    #         "today_absent_count": total_absent_today,
    #         "today_present_percentage": today_present_percentage,

    #         # Per-student details
    #         "students": students
    #     }


    #     # Generate batch info
    #     batch_info = self.batch_data(batch, start_date, end_date)

    #     grouped_batches = {
    #         batch.status + "_batch": [batch_info]
    #     }
    #     return Response({"batches": grouped_batches}, status=status.HTTP_200_OK)

}

class TrainerAttendanceMarkView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated] 

    def post(self, request, id):
        if request.user.role != 'Trainer':
            return Response({'error': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            trainer = Trainer.objects.get(
                Q(email=request.user.email) & Q(trainer_id=request.user.username)
            )
        except Trainer.DoesNotExist:
            return Response({'error': 'Trainer not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        batch_id = request.data.get("batch_id")
        attendance_status = request.data.get("status")  # 'Present' or 'Absent'
        date_str = request.data.get("date")  # 'YYYY-MM-DD'

        if not (batch_id and attendance_status and date_str):
            return Response({'error': 'Batch ID, status, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        if date_obj > localdate():
            return Response({'error': 'You cannot mark attendance for a future date.'}, status=status.HTTP_400_BAD_REQUEST)

        batch = Batch.objects.filter(id=batch_id, trainer=trainer).first()
        if not batch:
            return Response({'error': 'Batch not found or not assigned to this trainer.'}, status=status.HTTP_404_NOT_FOUND)

        # Always use BatchStudentAssignment for true student enrollment
        assignment = BatchStudentAssignment.objects.filter(batch=batch, student_id=id).first()
        if not assignment:
            return Response({'error': 'Student is not enrolled in this batch.'}, status=status.HTTP_404_NOT_FOUND)

        student = assignment.student

        attendance, created = Attendance.objects.get_or_create(
            student=student,
            batch=batch,
            date=date_obj,
            defaults={'attendance': attendance_status}
        )

        if not created:
            attendance.attendance = attendance_status
            attendance.save()

        # Auto-fill "Absent" for all *other* assigned students not already marked
        all_assignments = BatchStudentAssignment.objects.filter(batch=batch)
        for assign in all_assignments:
            other_student = assign.student
            if other_student.id == student.id:
                continue  # Skip the one we just marked above
            Attendance.objects.get_or_create(
                student=other_student,
                batch=batch,
                date=date_obj,
                defaults={'attendance': 'Absent'}
            )

        return Response({'success': 'Attendance marked successfully, absentees auto-filled.'}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


{

# # Re-created 
# # AllBatchesListView this view is giving batch info only
# class AllBatchesListView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role != 'Trainer':
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         try:
#             trainer = Trainer.objects.get(email=request.user.email)
#         except Trainer.DoesNotExist:
#             return Response({'error': 'Trainer profile not found'}, status=status.HTTP_404_NOT_FOUND)

#         batches = Batch.objects.filter(trainer=trainer).select_related('course', 'batch_time')
#         batch_list = []
#         for batch in batches:
#             batch_list.append({
#                 "id": batch.id,
#                 "batch_id": batch.batch_id,
#                 "course_name": batch.course.name if batch.course else None,
#                 "status": batch.status,
#                 "start_date": batch.start_date,
#                 "end_date": batch.end_date,
#                 "start_time": batch.batch_time.start_time if batch.batch_time else None,
#                 "end_time": batch.batch_time.end_time if batch.batch_time else None,
#                 "batch_mode": getattr(batch, 'mode', None)
#             })

#         return Response({"trainer_name": trainer.name, "batches": batch_list}, status=status.HTTP_200_OK)

# No, need
# class BatchStudentListAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, batch_id):
#         if request.user.role != 'Trainer':
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         try:
#             batch = Batch.objects.get(id=batch_id)
#         except Batch.DoesNotExist:
#             return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

#         students_data = []
#         for student in batch.student.all():
#             students_data.append({
#                 "student_id": student.id,
#                 "enrollment_no": student.enrollment_no,
#                 "student_name": student.name
#             })

#         return Response({"batch_id": batch.batch_id, "students": students_data}, status=status.HTTP_200_OK)


# # Don't work on this right now
# class StudentAttendanceDetailAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, student_id, batch_id):
#         if request.user.role != 'Trainer':
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         try:
#             student = Student.objects.get(id=student_id)
#         except Student.DoesNotExist:
#             return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#         try:
#             batch = Batch.objects.get(id=batch_id)
#         except Batch.DoesNotExist:
#             return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

#         # Optional date filter
#         start_date_str = request.query_params.get('start_date')
#         end_date_str = request.query_params.get('end_date')

#         try:
#             start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else None
#             end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date() if end_date_str else None
#         except ValueError:
#             return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

#         attendance_qs = Attendance.objects.filter(student=student, batch=batch)

#         if start_date and end_date:
#             attendance_qs = attendance_qs.filter(date__range=(start_date, end_date))

#         latest_attendance = attendance_qs.filter(date__lte=timezone.localdate()).order_by('-date', '-id').first()
#         history = attendance_qs.order_by('-date').values( 'id', 'date', 'attendance')

#         data = {
#             "student_id": student.id,
#             "enrollment_no": student.enrollment_no,
#             "coordinator": getattr(student.support_coordinator, 'name', None),
#             "latest_attendance_status": latest_attendance.attendance if latest_attendance else "Not Marked",
#             "last_attendance_date": latest_attendance.date if latest_attendance else None,
#             "present_count": attendance_qs.filter(attendance="Present").count(),
#             "total_classes": attendance_qs.count(),
#             "attendance_history": list(history)
#         }

#         return Response(data, status=status.HTTP_200_OK)

}


# trainer view for anouncement 
class TrainerAnnouncementListView(APIView):
    """
    API view for trainers to fetch announcements.
    """
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Allow only trainers
        if request.user.role != 'Trainer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Optionally filter trainer-specific announcements


        # For now, we fetch all announcements
        announcements = Announcement.objects.all().order_by('-gen_time')

        serializer = AnnouncementCreateSerializer(announcements, many=True)
        return Response({'announcements': serializer.data}, status=status.HTTP_200_OK)








#Batch Chats of Trainer 

class TrainerAllBatchChatsAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'Trainer':
            return Response({'error': 'Unauthorized'}, status=403)

        trainer = Trainer.objects.filter(email=request.user.email, trainer_id=request.user.username).first()
        if not trainer:
            return Response({'error': 'Trainer not found'}, status=404)

        # ✅ Accept both ?status= and ?batch__status= for filtering
        status_filter = request.GET.get('status') or request.GET.get('batch_status')
        search_query = request.GET.get('search', '').strip().lower()

        batches = Batch.objects.filter(trainer=trainer).select_related('course')

        if status_filter:
            batches = batches.filter(status__iexact=status_filter)

        if search_query:
            batches = batches.filter(
                Q(course__name__icontains=search_query) |
                Q(batch_id__icontains=search_query)
            )

        batch_list = []
        for batch in batches:
            chat = Chats.objects.filter(batch=batch).first()
            last_msg = ChatMessage.objects.filter(chat=chat).order_by('-gen_time').first() if chat else None

            batch_list.append({
                "batch_id": batch.id,
                "batch_code": batch.batch_id,
                "batch_name": f"{batch.course.name} | {batch.batch_id}",
                "batch_status": batch.status,
                "last_message": {
                    "message": last_msg.message if last_msg else "",
                    "send_by": last_msg.send_by.first_name if last_msg and last_msg.send_by else "",
                    "time": localtime(last_msg.gen_time).strftime('%I:%M %p') if last_msg else ""
                } if last_msg else None
            })

        return Response({'all_batch_chats': batch_list}, status=status.HTTP_200_OK)












class TrainerBatchChatsMessageAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if request.user.role != 'Trainer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        trainer = Trainer.objects.filter(
            Q(email=request.user.email) & Q(trainer_id=request.user.username)
        ).first()

        if not trainer:
            return Response({'error': 'Trainer not found'}, status=status.HTTP_404_NOT_FOUND)

        batch = Batch.objects.filter(id=id, trainer=trainer).first()
        if not batch:
            return Response({'error': 'Batch not found or not assigned to this trainer'}, status=status.HTTP_404_NOT_FOUND)

        chat_ids = Chats.objects.filter(batch=batch).values_list('id', flat=True)
        if not chat_ids:
            return Response({'error': 'No chat found for this batch'}, status=status.HTTP_404_NOT_FOUND)

        messages_queryset = ChatMessage.objects.filter(chat__in=chat_ids).select_related('send_by', 'chat__batch', 'reply_to')

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
                'gen_time': msg.gen_time,
                'reply_to': msg.reply_to.id if msg.reply_to else None,
                'reply_to_message': msg.reply_to.message if msg.reply_to else None,
                'reply_to_send_by': msg.reply_to.send_by.first_name if (msg.reply_to and msg.reply_to.send_by) else None,
            }
            final_messages.append(message_data)
            if msg.send_by == request.user:
                self_messages.append(message_data)

        return Response({
            'messages': final_messages,
            'self_message': self_messages
        }, status=status.HTTP_200_OK)





class TrainerBatchChatsMessageSenderAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # <-- THIS IS IMPORTANT

    def post(self, request, id):
        if request.user.role != 'Trainer':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get('message', '')
        file_obj = request.FILES.get('file')  # <-- THIS IS IMPORTANT
        file_name = file_obj.name if file_obj else request.data.get('file_name')
        file_size = file_obj.size if file_obj else request.data.get('file_size', 0)
        reply_to_id = request.data.get('reply_to')
        is_forwarded = request.data.get('is_forwarded', False)
        forwarded_from_id = request.data.get('forwarded_from')

        if not message and not file_obj:
            return Response({'error': 'Message or file required'}, status=400)

        trainer = Trainer.objects.filter(
            Q(email=request.user.email) & Q(trainer_id=request.user.username)
        ).first()
        if not trainer:
            return Response({'error': 'Trainer not found'}, status=status.HTTP_404_NOT_FOUND)

        batch = Batch.objects.filter(id=id, trainer=trainer).first()
        if not batch:
            return Response({'error': 'Batch not found or not assigned to this trainer'}, status=status.HTTP_404_NOT_FOUND)

        chat = Chats.objects.filter(batch=batch).first()
        if not chat:
            return Response({'error': 'No chat found for this batch'}, status=status.HTTP_404_NOT_FOUND)

        # Reply and Forward handling
        reply_to = ChatMessage.objects.filter(id=reply_to_id).first() if reply_to_id else None
        forwarded_from = ChatMessage.objects.filter(id=forwarded_from_id).first() if forwarded_from_id else None

        # Save the chat message with file
        chat_message = ChatMessage.objects.create(
            chat=chat,
            sender=request.user.role,
            send_by=request.user,
            message=message,
            file=file_obj,         # <-- THE ACTUAL UPLOADED FILE
            file_name=file_name,
            file_size=file_size,
            reply_to=reply_to,
            is_forwarded=is_forwarded,
            forwarded_from=forwarded_from,
        )

        logger.info(
            f"Trainer {request.user.username} sent message (id {chat_message.id}) "
            f"in batch {chat.batch.batch_id} at {timezone.now()} "
            f"{'(reply to message #' + str(reply_to.id) + ')' if reply_to else ''}"
        )

        return Response({
            'success': 'Message sent successfully',
            'id': chat_message.id,
            'file_url': chat_message.file.url if chat_message.file else None,
            'reply_to': chat_message.reply_to.id if chat_message.reply_to else None,
            'reply_to_message': chat_message.reply_to.message if chat_message.reply_to else None,
        }, status=status.HTTP_201_CREATED)




# Logger setup

logger = logging.getLogger(__name__)

class TrainerBatchChatMessageDeleteAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        print(f"🟡 DELETE request received | message_id: {message_id} | user: {request.user}")
        return self.perform_deletion(request.user, message_id)

    @staticmethod
    def perform_deletion(user, message_id):
        print(f"🔐 Authenticated User: {user} | Role: {getattr(user, 'role', None)}")

        if user.role != 'Trainer':
            print("❌ Unauthorized - Not a Trainer")
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        trainer = Trainer.objects.filter(
            Q(email=user.email), Q(trainer_id=user.username)
        ).first()

        if not trainer:
            print("❌ Trainer not found")
            return Response({'error': 'Trainer not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            message = ChatMessage.objects.select_related('chat__batch').get(id=message_id)
        except ChatMessage.DoesNotExist:
            print("❌ Message not found")
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

        if message.chat.batch.trainer != trainer:
            print("❌ Trainer mismatch with message batch")
            return Response({'error': 'You do not have permission to delete this message'}, status=status.HTTP_403_FORBIDDEN)

        if message.send_by != user:
            print("❌ Message not sent by this user")
            return Response({'error': 'You can only delete your own messages'}, status=status.HTTP_403_FORBIDDEN)

        message.delete()
        print(f"✅ Message {message_id} deleted successfully by Trainer {user.username}")

        logger.info(f"Trainer {user.username} deleted message {message_id} from batch {message.chat.batch.batch_id} at {now()}")

        return Response({'success': 'Message deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
