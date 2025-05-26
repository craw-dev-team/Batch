

NAME_SAVER = {
# from django.shortcuts import render

# # Create your views here.
# from django.http import HttpRequest

# def test(request):
#     return HttpRequest("hello bhai kya haal")


# from Coordinator.models import Coordinator
# from Trainer.models import Trainer
# from Student.models import Student
# from Counsellor.models import Counsellor


# from django.contrib.auth import get_user_model
# User = get_user_model()

# for i in User.objects.all():
#     for j in Counsellor.objects.all():
#         if i.username == j.counsellor_id:
#             print(j.name)
#             i.first_name = j.name
#             i.save()


}


# Batch views...
EMAILSENDER =  {

# Completed Email....
  
# # This is for Sending Email when Batch is Completed
# class BatchCompletedEmail(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, id):
#         students = request.data.get('students', [])
#         if not students:
#             return Response({'error': 'No students provided.'}, status=status.HTTP_400_BAD_REQUEST)

#         batch = get_object_or_404(Batch, id=id)

#         for student_id in students:
#             student_info = Student.objects.filter(id=student_id).first()
#             if not student_info:
#                 continue  # Skip if student not found

#             email_address = student_info.email
#             if not email_address:
#                 continue  # Skip if no email
#             start_time = batch.batch_time.start_time.strftime("%I:%M %p")  # e.g., "01:00 PM"
#             end_time = batch.batch_time.end_time.strftime("%I:%M %p")


#         #     subject = f"Your {batch.course} ({batch.batch_id}) is Completed"
#         #     html_message = f""" 
#         # <!DOCTYPE html>
#         # <html>
#         # <head>
#         # <meta charset="UTF-8">
#         # <title>Batch Completion</title>
#         # </head>
#         # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
#         # <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
            
#         #     <!-- Header with Logo -->
#         #     <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
#         #     <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
#         #     </div>

#         #     <!-- Body -->
#         #     <div style="padding: 30px; color: #000;">
#         #     <h2 style="text-align: center; color: #000; font-size: 24px; margin-bottom: 20px;">🎉 Congratulations on reaching this milestone!</h2>

#         #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
#         #         Dear <strong style="font-weight: bold; color: #000;">{student_info.name}</strong>,
#         #     </p>

#         #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
#         #         We are pleased to announce that you have successfully completed the 
#         #         <strong style="font-weight: bold; color: #000;">{batch.course}</strong> 🚀
#         #     </p>

#         #     <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
#         #         <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">📘 Batch ID:</strong> {batch.batch_id}</p>
#         #         <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">📅 Start Date:</strong> {batch.start_date}</p>
#         #         <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">🏁 End Date:</strong> {batch.end_date}</p>
#         #         <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">🕒 Batch Timing:</strong> {start_time} - {end_time}</p>
#         #         <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">👨‍🏫 Trainer Name:</strong> {batch.trainer.name}</p>
#         #     </div>

#         #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
#         #         We hope this course has equipped you with valuable skills and knowledge for your future endeavors ✨<br>
#         #         If you have any questions or need further assistance, feel free to reach out to us.
#         #     </p>

#         #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
#         #         💬 Kindly support us by writing a quick Google review:  
#         #         <a href="https://g.page/CrawSec/review?m" target="_blank" text-decoration: underline;">https://g.page/CrawSec/review?m</a>
#         #     </p>

#         #     <p style="font-size: 15px; margin-top: 30px; line-height: 1.6; color: #000;">
#         #         📍 <strong style="font-weight: bold;">Our Address:</strong><br>
#         #         1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
#         #         Behind Saket Metro Station, New Delhi 110030
#         #     </p>

#         #     <p style="font-size: 15px; line-height: 1.6; color: #000;">
#         #         📞 <strong style="font-weight: bold;">Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
#         #         📧 <strong style="font-weight: bold;">Email:</strong> training@craw.in<br>
#         #         🌐 <strong style="font-weight: bold;">Website:</strong> 
#         #         <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
#         #     </p>

#         #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
#         #         Warm regards,<br>
#         #         <strong style="font-weight: bold; color: #000;">Craw Cyber Security Pvt Ltd</strong> 🛡️
#         #     </p>
#         #     </div>

#         #     <!-- Footer -->
#         #     <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
#         #         <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
#         #         <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
#         #     </div>
#         # </div>
#         # </body>
#         # </html>
#         #     """
      
#         #     from_email = "CRAW SECURITY BATCH <training@craw.in>"
#         #     try:
#         #         email = EmailMessage(subject, html_message, from_email, [email_address])
#         #         email.content_subtype = "html"
#         #         email.send()

#         #         # ✅ Update email status in BatchStudentAssignment
#         #         BatchStudentAssignment.objects.filter(batch=batch, student=student_info).update(
#         #             batch_completed_email_sent=True,
#         #             batch_completed_email_sent_at=now()
#         #         )
#         #     except Exception as e:
#         #         return Response({'error': f"Failed to send email to {email_address}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         return Response({'message': 'Emails sent successfully.'}, status=status.HTTP_200_OK)




# Batch Start Email....

# # This For sending Mail to student witch added in the batch
# class BatchAddStudentMailAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         students = request.data.get('students', [])

#         batch = Batch.objects.filter(id=id).first()
#         if not batch:
#             return Response({'error': 'Batch not found'}, status=status.HTTP_404_NOT_FOUND)

#         start_time = batch.batch_time.start_time.strftime("%I:%M %p")
#         end_time = batch.batch_time.end_time.strftime("%I:%M %p")

#         student_info_list = []

#         for student_id in students:
#             student = Student.objects.filter(id=student_id).first()
#             if not student:
#                 continue

#             student_info_list.append({
#                 'id': student.id,
#                 'enrollment_no': student.enrollment_no,
#                 'name': student.name,
#                 'email': student.email
#             })

# #             # Send email
# #             subject = f"You have been enrolled in {batch.course} ({batch.batch_id})"
# #             html_message = f"""
# # <!DOCTYPE html>
# # <html>
# # <head><meta charset="UTF-8"><title>Batch Assigned</title></head>
# # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
# #     <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
# #         <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
# #             <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
# #         </div>
# #         <div style="padding: 30px; font-size: 18px; color: #000;">
# #             <h2 style="text-align: center; font-size: 24px;">📢 Welcome to Your New Batch!</h2>
# #             <p>Dear <strong>{student.name}</strong>,</p>
# #             <p>You have been successfully enrolled in the <strong>{batch.course}</strong> course.</p>
# #             <div style="background-color: #f1f1f1; padding: 18px; border-radius: 6px; margin: 20px 0;">
# #                 <p><strong>📘 Batch ID:</strong> {batch.batch_id}</p>
# #                 <p><strong>📅 Start Date:</strong> {batch.start_date}</p>
# #                 <p><strong>🏁 End Date:</strong> {batch.end_date}</p>
# #                 <p><strong>🕒 Timing:</strong> {start_time} - {end_time}</p>
# #                 <p><strong>👨‍🏫 Trainer:</strong> {batch.trainer.name}</p>
# #             </div>
# #             <p>We look forward to your participation and learning journey with Craw Security.</p>
# #             <p>💬 Leave a review: 
# #                 <a href="https://g.page/CrawSec/review?m" target="_blank">https://g.page/CrawSec/review?m</a>
# #             </p>
# #             <p style="margin-top: 30px;">
# #                 📍 <strong>Our Address:</strong><br>
# #                 1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
# #                 Behind Saket Metro Station, New Delhi 110030
# #             </p>
# #             <p>
# #                 📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
# #                 📧 <strong>Email:</strong> training@craw.in<br>
# #                 🌐 <strong>Website:</strong> 
# #                 <a href="https://www.craw.in">www.craw.in</a>
# #             </p>
# #             <p>
# #                 Warm regards,<br>
# #                 <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
# #             </p>
# #         </div>
# #         <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px;">
# #             <p>© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
# #             <p>This is an automated message. Please do not reply.</p>
# #         </div>
# #     </div>
# # </body>
# # </html>
# # """
# #             from_email = "CRAW SECURITY BATCH <training@craw.in>"
# #             try:
# #                 email = EmailMessage(subject, html_message, from_email, [student.email])
# #                 email.content_subtype = "html"
# #                 email.send()

                
# #                 # ✅ Update email status in BatchStudentAssignment
# #                 BatchStudentAssi  gnment.objects.filter(batch=batch, student=student).update(
# #                         add_in_batch_email_sent=True,
# #                         add_in_batch_email_sent_at=now()
# #                     )
                
# #             except Exception as e:
# #                 print(f"Failed to send email to {student.email}: {str(e)}")

#         return Response({'students': student_info_list}, status=status.HTTP_200_OK)




# Batch Cancelation Email....

# # This is for Batch Cancelation...
# class BatchCancelTodayAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         batch = Batch.objects.filter(id=id).first()
#         if not batch:
#             return Response({'error': 'Batch not found.'}, status=status.HTTP_404_NOT_FOUND)

#         students = batch.student.all()
#         start_time = batch.batch_time.start_time.strftime('%I:%M %p') if batch.batch_time and batch.batch_time.start_time else 'N/A'
#         end_time = batch.batch_time.end_time.strftime('%I:%M %p') if batch.batch_time and batch.batch_time.end_time else 'N/A'

#         session_date = timezone.now().strftime('%d %B %Y')  # e.g., "11 May 2025"
#         batch_name = f"{batch.course} ({batch.batch_id})"
#         trainer_name = batch.trainer.name if batch.trainer else "Trainer"
#         coordinator_name = getattr(batch.trainer.coordinator, 'name', 'N/A')
#         coordinator_phone = getattr(batch.trainer.coordinator, 'phone', 'N/A')


# #         for student in students:
# #             subject = f"Today's {batch_name} Batch is Cancelled"

# #             html_message = f"""
        # <!DOCTYPE html>
        # <html>
        # <head>
        # <meta charset="UTF-8">
        # <title>{subject}</title>
        # </head>
        # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
        # <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
            
        #     <!-- Header with Logo -->
        #     <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
        #     <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
        #     </div>

        #     <!-- Body -->
        #     <div style="padding: 30px; color: #000;">
        #     <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px; color: #000;">❗Session Cancellation Notice</h2>

        #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
        #         Dear {student.name},
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
        #         We regret to inform you that your session scheduled for today, <strong>{session_date}</strong>, under the batch <strong>{batch_name}</strong> has been <strong>cancelled</strong>.
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
        #         This is due to an urgent matter that requires the immediate attention of our trainer, <strong>{trainer_name}</strong>. We understand the inconvenience this may cause and sincerely apologize.
        #     </p>

        #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
        #         We appreciate your understanding and cooperation in this matter. Please stay tuned for the rescheduled session details.
        #     </p>

        #     <p style="margin: 5px 0; font-size: 16px; line-height: 1.6; color: #000;">
        #         For any further assistance, feel free to reach out to your batch coordinator:<br>
        #         👤 Name: <strong>{coordinator_name}</strong><br>
        #         📱 Phone: <strong>{coordinator_phone}</strong>
        #     </p> 

        #     <p style="font-size: 16px; line-height: 1.6; color: #000;">
        #         Warm regards,<br>
        #         <strong>Craw Cyber Security Team</strong>
        #     </p>

        #     <div style="margin-top: 20px; font-size: 14px; line-height: 1.6; color: #000;">
        #         <p><strong>📞 Contact:</strong> 011-40394315 | +91-9650202445, +91-9650677445</p>
        #         <p><strong>📧 Email:</strong> <a href="mailto:training@craw.in" style="color: #000; text-decoration: underline;">training@craw.in</a></p>
        #         <p><strong>🌐 Website:</strong> <a href="https://www.craw.in/" style="color: #000; text-decoration: underline;">www.craw.in</a></p>
        #         <p><strong>🏢 Address:</strong> 1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
        #         Behind Saket Metro Station, New Delhi – 110030</p>
        #     </div>
        #     </div>

        #     <!-- Footer -->
        #     <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
        #     <p style="margin: 0; color: #000;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
        #     <p style="margin: 5px 0 0; color: #000;">This is an automated message. Please do not reply.</p>
        #     </div>
        # </div>
        # </body>
        # </html>
# # """

# #             try:
# #                 email = EmailMessage(subject, html_message, "CRAW SECURITY BATCH <training@craw.in>", [student.email])
# #                 email.content_subtype = "html"
# #                 email.send()

                
# #             except Exception as e:
# #                 return Response({'error': f"Failed to send to {student.email}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         return Response({'message': 'Batch cancellation emails sent successfully.'}, status=status.HTTP_200_OK)


}

BATCHGET = {


# class BatchAPIView(APIView):
#     """
#     API View for fetching batch details with filtering and trainer availability.
#     """
#     authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         batches = Batch.objects.prefetch_related('student').select_related('trainer', 'course', 'location', 'batch_time')
#         now = timezone.now()
#         today = date.today()

#         # Update batch statuses
#         for batch in batches:
#             students = batch.student.all()
#             if batch.status not in ['Hold', 'Cancelled']:
#                 if batch.start_date <= today < batch.end_date:
#                     batch.status = 'Running'
#                     batch.save()
#                     StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Ongoing')
#                 elif batch.start_date >= today and batch.end_date >= today:
#                     batch.status = 'Upcoming'
#                     batch.save()
#                     StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Upcoming')
#                 elif batch.end_date < today:
#                     batch.status = 'Completed'
#                     batch.save()
#                     StudentCourse.objects.filter(student__in=students, course=batch.course).update(status='Completed')

#         seven_days_later = now + timedelta(days=10)
#         batches_ending_soon = Batch.objects.filter(end_date__lte=seven_days_later, end_date__gte=now, status='Running').order_by('end_date')
#         # for batch in batches_ending_soon:
#         #     print(batch.end_date, batch.id)
#         #     print(" ")
#         running_batch = Batch.objects.filter(status='Running').order_by('-gen_time')
#         scheduled_batch = Batch.objects.filter(status='Upcoming')
#         completed_batch = Batch.objects.filter(status='Completed')
#         hold_batch = Batch.objects.filter(status='Hold')
#         cancelled_batch = Batch.objects.filter(status='Cancelled')

#         # Serialize the batches using the updated BatchSerializer
#         all_batches_data = {
#             'batches': BatchSerializer(batches, many=True).data,
#             'running_batch': BatchSerializer(running_batch, many=True).data,
#             'batches_ending_soon': BatchSerializer(batches_ending_soon, many=True).data,
#             'scheduled_batch': BatchSerializer(scheduled_batch, many=True).data,
#             'completed_batch': BatchSerializer(completed_batch, many=True).data,
#             'hold_batch': BatchSerializer(hold_batch, many=True).data,
#             'cancelled_batch': BatchSerializer(cancelled_batch, many=True).data,
#         }

#         return Response({'All_Type_Batch': all_batches_data}, status=200)



# class BatchAPIView(GenericAPIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardResultsSetPagination
#     serializer_class = BatchSerializer

#     STATUS_MAPPING = {
#         'Running': 'Ongoing',
#         'Upcoming': 'Upcoming',
#         'Completed': 'Completed',
#         'Hold': 'Not Started',
#         'Cancelled': 'Denied',
#     }

#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         today = now().date()
#         upcoming_threshold = today + timedelta(days=10)

#         batches = Batch.objects.select_related(
#             'trainer', 'course', 'location', 'batch_time'
#         ).prefetch_related(
#             Prefetch('student', queryset=Batch.student.rel.model.objects.only('id'))
#         )

#         updated_batches = []
#         student_course_updates = []

#         for batch in batches:
#             old_status = batch.status
#             if old_status in ['Hold', 'Cancelled']:
#                 continue

#             if batch.start_date <= today < batch.end_date:
#                 new_status = 'Running'
#             elif batch.start_date > today:
#                 new_status = 'Upcoming'
#             else:
#                 new_status = 'Completed'

#             if new_status != old_status:
#                 batch.status = new_status
#                 updated_batches.append(batch)

#                 student_ids = list(batch.student.values_list('id', flat=True))
#                 if student_ids:
#                     student_course_updates.append({
#                         'student_ids': student_ids,
#                         'course_id': batch.course_id,
#                         'status': new_status
#                     })

#         if updated_batches:
#             Batch.objects.bulk_update(updated_batches, ['status'])

#         for update in student_course_updates:
#             mapped_status = self.STATUS_MAPPING.get(update['status'])
#             if mapped_status:
#                 StudentCourse.objects.filter(
#                     student_id__in=update['student_ids'],
#                     course_id=update['course_id']
#                 ).update(status=mapped_status)

#         serializer = self.get_serializer(batches, many=True)
#         batch_data_map = {data['id']: data for data in serializer.data}

#         all_batches_data = []
#         running, ending_soon, scheduled, completed, hold, cancelled = [], [], [], [], [], []

#         for batch in batches:
#             data = batch_data_map.get(batch.id)
#             if not data:
#                 continue

#             all_batches_data.append(data)

#             if batch.status == 'Running':
#                 running.append(data)
#                 if batch.end_date <= upcoming_threshold:
#                     ending_soon.append(data)
#             elif batch.status == 'Upcoming':
#                 scheduled.append(data)
#             elif batch.status == 'Completed':
#                 completed.append(data)
#             elif batch.status == 'Hold':
#                 hold.append(data)
#             elif batch.status == 'Cancelled':
#                 cancelled.append(data)

#         # Apply pagination only to all_batches_data
#         # paginated = self.paginate_queryset(all_batches_data)
#         # paginated_batches = self.get_paginated_response(paginated).data if paginated else all_batches_data

#         paginated_running = self.paginate_queryset(running)
#         paginated_running_batch = self.get_paginated_response(paginated_running).data if paginated_running else running

#         return Response({
#             'All_Type_Batch': {
#                 # 'batches': paginated_batches,  # Paginated list
#                 'running_batch': paginated_running_batch,      # Full lists (not paginated)
#                 'batches_ending_soon': ending_soon,
#                 'scheduled_batch': scheduled,
#                 'completed_batch': completed,
#                 'hold_batch': hold,
#                 'cancelled_batch': cancelled,
#             }
#         }, status=status.HTTP_200_OK)



}

STUDENTAVAILABE = {
    # class AvailableStudentsAPIView(APIView):
#     """API to get available students for a batch."""
#     authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
#     permission_classes = [IsAuthenticated]

#     def get(self, request, batch_id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


#         batch = get_object_or_404(Batch, id=batch_id)

#         # Base filter for active students in the same course
#         filters = Q(courses__id=batch.course.id, status='Active')

#         # Language filter
#         if batch.language != "Both":
#             filters &= Q(language__in=[batch.language, "Both"])

#         # Week filter
#         if batch.preferred_week != "Both":
#             filters &= Q(preferred_week__in=[batch.preferred_week, "Both"])

#         # Mode filter
#         if batch.mode != "Hybrid":
#             filters &= Q(mode__in=[batch.mode, "Hybrid"])

#         # Location filter (Ensure location comparison is valid)
#         if hasattr(batch.location, 'locality') and batch.location.locality != "Both":
#             filters &= Q(location__locality__in=[batch.location.locality, "Both"])


#         # Exclude students who are in a Running or Upcoming batch of the same course
#         ongoing_batches = Batch.objects.filter(course=batch.course, status__in=['Running', 'Upcoming'])
#         ongoing_students = Student.objects.filter(batch__in=ongoing_batches).values_list('id', flat=True)
#         filters &= ~Q(id__in=ongoing_students)


#         # ✅ Exclude students who have completed the course
#         completed_batches = Batch.objects.filter(course=batch.course, status='Completed')
#         completed_students = Student.objects.filter(batch__in=completed_batches).values_list('id', flat=True)
#         filters &= ~Q(id__in=completed_students)

        
#         # ❌ Exclude students whose course status is completed in StudentCourse model
#         completed_course_students = StudentCourse.objects.filter(
#             course=batch.course,
#             status='Completed'
#         ).values_list('student_id', flat=True)
#         filters &= ~Q(id__in=completed_course_students)

#         # Query the filtered students
#         students = Student.objects.filter(filters)

#         # ✅ Apply Ethical Hacking required pre-requisite check

#         prerequisites = {
#             "Ethical Hacking": ['Basic Networking', 'Linux Essentials'],
#             "AWS Associate": ['Basic Networking', 'Linux Essentials'],
#             "AWS Security": ['AWS Associate'],
#             "Advanced Penetration Testing": ['Ethical Hacking'],
#             "Web Application Security":['Advanced Penetration Testing'],
#             "Mobile Application Security": ['Web Application Security'],
#             "Cyber Forensics Investigation": ['Ethical Hacking'],
#         }

#         required_courses = prerequisites.get(batch.course.name)

#         if required_courses:
#             course_statuses = StudentCourse.objects.filter(
#                 student__in=students,
#                 course__name__in=required_courses
#             ).values('student_id', 'course__name', 'status')

#             student_course_map = defaultdict(dict)
#             for entry in course_statuses:
#                 student_course_map[entry['student_id']][entry['course__name']] = entry['status']

#             eligible_ids = []
#             for student in students:
#                 sid = student.id
#                 course_data = student_course_map.get(sid, {})

#                 # ✅ Case 1: Has both and both completed
#                 if all(course_data.get(course) == 'Completed' for course in required_courses):
#                     eligible_ids.append(sid)

#                 # ✅ Case 2: Missing one or both courses (not enrolled)
#                 elif len(course_data) < len(required_courses):
#                     eligible_ids.append(sid)

#             students = students.filter(id__in=eligible_ids)
#         else:
#             print("No prerequisites. Skipping filter.")

#         serialized_students = StudentSerializer(students, many=True).data
#         return Response({"available_students": serialized_students}, status=status.HTTP_200_OK)  





# Exclude students who are already in the batch
# enrolled_students = batch.student.values_list('id', flat=True)  # Get IDs of enrolled students
# filters &= ~Q(id__in=enrolled_students)  # Exclude them from the queryset

}

STUDENTREMOVE = {
    # class BatchRemoveStudentAPIView(APIView):
#     """API to remove students from a batch and update course status."""
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request, batch_id):
#         """Remove students from a batch and update their course status accordingly."""

#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         batch = get_object_or_404(Batch, id=batch_id)
#         student_ids = request.data.get('students', [])  # Expecting a list of student IDs

#         if not isinstance(student_ids, list) or not student_ids:
#             return Response({"error": "Invalid input format, expected a non-empty list of student IDs."}, status=status.HTTP_400_BAD_REQUEST)

#         students = Student.objects.filter(id__in=student_ids)

#         if not students.exists():
#             return Response({"error": "No valid students found."}, status=status.HTTP_400_BAD_REQUEST)

#         removed_students = []
#         student_courses_to_update = []

#         for student in students:
#             assignment = BatchStudentAssignment.objects.filter(batch=batch, student=student)
#             if assignment.exists():
#                 assignment.delete()
#                 removed_students.append(student)

#                 # Update only the course associated with this batch
#                 student_course = StudentCourse.objects.filter(student=student, course=batch.course).first()
#                 if student_course:
#                     if batch.status == 'Running':
#                         student_course.status = 'Denied'
#                     elif batch.status == 'Upcoming':
#                         student_course.status = 'Not Started'
#                     student_courses_to_update.append(student_course)

#         # ✅ Bulk update StudentCourse status for better performance
#         if student_courses_to_update:
#             StudentCourse.objects.bulk_update(student_courses_to_update, ['status'])

#         # ✅ Log student removals
#         if removed_students:
#             student_names = [student.enrollment_no for student in removed_students]  # Fetch student enrollment numbers
#             LogEntry.objects.create(
#                 content_type=ContentType.objects.get_for_model(BatchStudentAssignment),
#                 cid=str(uuid.uuid4()),  # Generate unique ID
#                 object_pk=batch.id,
#                 object_id=batch.id,
#                 object_repr=f"Batch: {batch.batch_id}",
#                 action=LogEntry.Action.UPDATE,
#                 changes=f"Removed students {', '.join(student_names)} from batch {batch.batch_id} by {request.user.username}",
#                 serialized_data=json.dumps({"removed_students": student_names, "batch": batch.batch_id}, default=str),
#                 changes_text=(f"{request.user.get_full_name() or request.user.username} removed {len(student_names)} student(s) "
#                             f"({', '.join(student_names)}) from batch '{batch.batch_id}'. "
#                             f"Updated their course status based on batch state: "
#                             f"{'Running → Denied' if batch.status == 'Running' else 'Upcoming → Not Started'}."
#                         ),
#                 additional_data="Batch",
#                 actor=request.user,
#                 timestamp=now()
#             )

#         return Response({
#             "message": "Students removed successfully, and course status updated.",
#             "removed_students": [s.id for s in removed_students]
#         }, status=status.HTTP_200_OK)
}

GenerateBatchCertificate = {
    # class GenerateBatchCertificateAPIView(APIView):
#     def post(self, request, id, *args, **kwargs):
#         issue_date = request.data.get("issue_date")
#         student_ids = request.data.get("student_id", [])

#         if not issue_date:
#             return Response({"error": "Issue date is required"}, status=status.HTTP_400_BAD_REQUEST)

#         # Get the batch and course
#         batch = get_object_or_404(Batch, id=id)
#         course = batch.course.name

#         # Fetch all completed student courses for the given student IDs
#         student_courses = StudentCourse.objects.filter(
#             student__id__in=student_ids, course=batch.course, status="Completed"
#         )

#         if not student_courses.exists():
#             return Response({"error": "No completed student courses found for this batch"}, status=status.HTTP_400_BAD_REQUEST)

#         certificate_paths = []
#         errors = []

#         for student_course in student_courses:
#             student = student_course.student
#             student_course.certificate_date = issue_date
#             student_course.save(update_fields=["certificate_date"])

#             # Generate certificate
#             file_path = generate_certificate(course, student.name, student.enrollment_no, issue_date)
            
#             if os.path.exists(file_path):
#                 student_course.student_certificate_allotment = True
#                 student_course.save(update_fields=["student_certificate_allotment"])
#                 certificate_paths.append({
#                     "student_id": student.id,
#                     "certificate_path": file_path
#                 })
#             else:
#                 errors.append({
#                     "student_id": student.id,
#                     "error": "Certificate generation failed"
#                 })

#         response_data = {"certificates": certificate_paths}
#         if errors:
#             response_data["errors"] = errors

#         return Response(response_data, status=status.HTTP_200_OK)

}

LOGS = {
    
# 🔹 List API View
# class LogEntryListAPIView(ListAPIView):
#     """Paginated log listing with filters (standard page-based)."""
#     serializer_class = LogEntrySerializer
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardResultsSetPagination
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['object_repr', 'additional_data', 'actor__first_name', 'actor__username']

#     def get_queryset(self):
#         user = self.request.user

#         if user.role not in ['admin', 'coordinator']:
#             return LogEntry.objects.none()

#         queryset = LogEntry.objects.all().order_by('-timestamp')

#         # Apply filters
#         action = self.request.query_params.get('action')
#         actor_username = self.request.query_params.get('actor_username')
#         actor_firstname = self.request.query_params.get('actor_firstname')
#         object_id = self.request.query_params.get('object_id')

#         if action:
#             queryset = queryset.filter(action__iexact=action)

#         if actor_username:
#             queryset = queryset.filter(actor__username__iexact=actor_username)

#         if actor_firstname:
#             queryset = queryset.filter(actor__first_name__iexact=actor_firstname)

#         if object_id:
#             queryset = queryset.filter(object_id=object_id)

#         log_counts = (
#             LogEntry.objects
#             .filter(actor__role='coordinator')
#             .values('actor__id', 'actor__username', 'actor__first_name')
#             .annotate(log_count=Count('id'))
#             .order_by('-log_count')
#         )

#         info = {
#                     'queryset':queryset,
#                     'log_counts':log_counts
#                 }

#         return info



# from rest_framework.response import Response
# from django.db.models import Count
}

CSS_Changer = {
# from bs4 import BeautifulSoup

# def convert_quill_classes_to_inline(html):
#     soup = BeautifulSoup(html, "html.parser")

#     # Center alignment
#     for tag in soup.select('.ql-align-center'):
#         tag['style'] = tag.get('style', '') + 'text-align: center;'
#         del tag['class']

#     # Right alignment
#     for tag in soup.select('.ql-align-right'):
#         tag['style'] = tag.get('style', '') + 'text-align: right;'
#         del tag['class']

#     # Justify alignment
#     for tag in soup.select('.ql-align-justify'):
#         tag['style'] = tag.get('style', '') + 'text-align: justify;'
#         del tag['class']

#     # Left alignment (optional)
#     for tag in soup.select('.ql-align-left'):
#         tag['style'] = tag.get('style', '') + 'text-align: left;'
#         del tag['class']

#     return str(soup)

}



