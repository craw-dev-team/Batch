# # utils.py
# from nexus.models import Attendance
# from datetime import timedelta

# def create_daily_attendance_records(batch, students, start_date, end_date, preferred_week):
#     attendance_objects = []
#     trainer = batch.trainer
#     course = batch.course
#     time_slot = batch.batch_time

#     current_date = start_date
#     while current_date <= end_date:
#         weekday = current_date.weekday()

#         if preferred_week == "Weekdays" and weekday >= 5:
#             current_date += timedelta(days=1)
#             continue
#         elif preferred_week == "Weekends" and weekday <= 4:
#             current_date += timedelta(days=1)
#             continue
#         elif preferred_week == "Both":
#             pass
#         elif preferred_week not in ["Weekdays", "Weekends", "Both"]:
#             current_date += timedelta(days=1)
#             continue

#         for student in students:
#             attendance_objects.append(Attendance(
#                 student=student,
#                 trainer=trainer,
#                 trainer_name=str(trainer) if trainer else None,
#                 course=course,
#                 course_name=str(course) if course else None,
#                 batch=batch,
#                 time_slot=time_slot,
#                 attendance='Absent',
#                 date=current_date
#             ))

#         current_date += timedelta(days=1)

#     Attendance.objects.bulk_create(attendance_objects)




### For mark present those student whose batch completed 

# def mark_attendance_present_for_completed_batches():
#     from django.utils.timezone import now
#     from nexus.models import Batch, Attendance

#     today = now().date()
#     completed_batches = Batch.objects.filter(end_date__lt=today)

#     if not completed_batches.exists():
#         return "No completed batches found."

#     updated_count = Attendance.objects.filter(
#         batch__in=completed_batches,
#         attendance='Absent'
#     ).update(attendance='Present')

#     return f"{updated_count} attendance records updated from Absent to Present."