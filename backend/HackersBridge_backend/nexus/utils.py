import random, jwt
from datetime import datetime, timedelta
from django.core.mail import send_mail,EmailMessage
from django.core.cache import cache
from django.conf import settings
from django.utils.html import escape
from django.utils import timezone



OTP_EXPIRE_SECONDS = settings.OTP_EXPIRE_SECONDS
MAX_OTP_ATTEMPTS = 5

def generate_otp():
    return str(random.randint(100000, 999999))

def generate_reset_token(email):
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(seconds=OTP_EXPIRE_SECONDS)
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_reset_token(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload["email"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def generate_verified_token(email):
    payload = {
        "email": email,
        "verified": True,
        "exp": datetime.utcnow() + timedelta(minutes=10)  # Verified token valid for 10 mins
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_verified_token(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("verified") is True:
            return payload.get("email")
        return None
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def store_otp(email, otp):
    cache.set(f"otp:{email}", {"otp": otp, "verified": False}, timeout=OTP_EXPIRE_SECONDS)
    cache.set(f"otp_attempts:{email}", 0, timeout=OTP_EXPIRE_SECONDS)

def validate_otp(email, otp):
    data = cache.get(f"otp:{email}")
    return data and data["otp"] == otp

def mark_otp_verified(email):
    data = cache.get(f"otp:{email}")
    if data:
        data["verified"] = True
        cache.set(f"otp:{email}", data, timeout=OTP_EXPIRE_SECONDS)

def is_verified(email):
    data = cache.get(f"otp:{email}")
    return data and data.get("verified")

def clear_otp(email):
    cache.delete(f"otp:{email}")
    cache.delete(f"otp_attempts:{email}")

def increment_otp_attempt(email):
    key = f"otp_attempts:{email}"
    count = cache.get(key) or 0
    if count >= MAX_OTP_ATTEMPTS:
        return False
    cache.set(key, count + 1, timeout=OTP_EXPIRE_SECONDS)
    return True

def send_otp_email(email, otp):
    send_mail(
        subject="Your OTP Code",
        message=f"Use this OTP to reset your password: {otp}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email]
    )













import logging
from django.utils import timezone
from django.core.mail import EmailMessage
from django.utils.html import escape

logger = logging.getLogger('django')

def send_attendance_email(attendance_instance):
    student = attendance_instance.student
    batch = attendance_instance.batch

    if not student or not batch:
        logger.warning(f"[Attendance Email] Missing student or batch for attendance ID {attendance_instance.id}")
        return

    student_email = student.email
    student_name = student.name
    course_name = attendance_instance.course if attendance_instance.course else "Course"
    batch_id = batch.batch_id if batch else "N/A"
    trainer_name = batch.trainer.name if batch.trainer else "N/A"
    start_time = batch.batch_time.start_time.strftime("%I:%M %p") if batch.batch_time and batch.batch_time.start_time else "N/A"
    end_time = batch.batch_time.end_time.strftime("%I:%M %p") if batch.batch_time and batch.batch_time.end_time else "N/A"
    date_str = timezone.now().strftime('%d %B %Y')

    attendance_status = attendance_instance.attendance
    if attendance_status == 'Present':
        status_text = "marked as <strong style='color: green;'>Present</strong>"
    elif attendance_status == 'Absent':
        status_text = "marked as <strong style='color: red;'>Absent</strong>"
    # else:
    #     status_text = f"updated to {escape(attendance_status)}"

    # subject = f"Attendance Update for {course_name} on {date_str}"

    # html_message = f"""
    # <!DOCTYPE html>
    # <html>
    # <head><meta charset="UTF-8"><title>Attendance Update</title></head>
    # <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; color: #000;">
    #     <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
    #         <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
    #             <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
    #         </div>
    #         <div style="padding: 30px; color: #000;">
    #             <h2 style="text-align: center; color: #000; font-size: 24px; margin-bottom: 20px;">📋 Attendance Notification</h2>
    #             <p style="font-size: 16px; line-height: 1.6; color: #000;">Dear <strong>{escape(student_name)}</strong>,</p>
    #             <p style="font-size: 16px; line-height: 1.6; color: #000;">Your attendance for today's session of <strong>{escape(str(course_name))}</strong> (Batch ID: {batch_id}) has been {status_text}.</p>
    #             <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
    #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>📘 Batch ID:</strong> {batch_id}</p>
    #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>🕒 Timing:</strong> {start_time} - {end_time}</p>
    #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>👨‍🏫 Trainer:</strong> {trainer_name}</p>
    #                 <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong>📅 Date:</strong> {date_str}</p>
    #             </div>
    #             <p style="font-size: 16px; line-height: 1.6; color: #000;">If this information is incorrect, please contact your coordinator.</p>
    #             <p style="font-size: 15px; margin-top: 30px; line-height: 1.6; color: #000;">
    #                 📍 <strong>Our Address:</strong><br>
    #                 1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
    #                 Behind Saket Metro Station, New Delhi 110030
    #             </p>
    #             <p style="font-size: 15px; line-height: 1.6; color: #000;">
    #                 📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
    #                 📧 <strong>Email:</strong> training@craw.in<br>
    #                 🌐 <strong>Website:</strong> 
    #                 <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
    #             </p>
    #             <p style="font-size: 16px; line-height: 1.6; color: #000;">
    #                 Regards,<br>
    #                 <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
    #             </p>
    #         </div>
    #         <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; border-top: 1px solid #ddd; color: #000;">
    #             <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
    #             <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
    #         </div>
    #     </div>
    # </body>
    # </html>
    # # """
    # try:
    #     email = EmailMessage(
    #         subject,
    #         html_message,
    #         "CRAW SECURITY BATCH <training@craw.in>",
    #         [student_email]
    #     )
    #     email.content_subtype = "html"
    #     email.send()
    #     logger.info(f"[Attendance Email] Successfully sent to {student_email} for attendance ID {attendance_instance.id}")
    # except Exception as e:
    #     logger.error(f"[Attendance Email] Failed for {student_email}: {str(e)}")

import logging
from django.core.mail import EmailMessage

logger = logging.getLogger('django')


def send_student_removal_email(student, course_name, batch_id):
    if not student or not student.email:
        logger.warning(f"[Student Removal Email] Missing student or student email.")
        return

    subject = f"You have been removed from {course_name} ({batch_id})"
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Removed from Batch</title></head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; color: #000;">
        <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
            <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
        </div>
        <div style="padding: 30px; font-size: 16px; color: #000;">
            <h2 style="text-align: center; font-size: 22px; color: #000;">📢 Batch Update Notice</h2>
            <p>Dear <strong>{student.name}</strong>,</p>
            <p>We would like to inform you that you have been <strong>removed</strong> from the <strong>{course_name}</strong> course batch <strong>{batch_id}</strong>.</p>
            <p>If this was unexpected or a mistake, please contact your trainer or Craw Security support immediately.</p>
            <p style="margin-top: 30px;">
                📍 <strong>Our Address:</strong><br>
                1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                Behind Saket Metro Station, New Delhi 110030
            </p>
            <p>
                📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
                📧 <strong>Email:</strong> training@craw.in<br>
                🌐 <strong>Website:</strong> <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
            </p>
            <p>Warm regards,<br><strong>Craw Cyber Security Pvt Ltd</strong> 🛡️</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; border-top: 1px solid #ddd;">
            <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
            <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
        </div>
    </div>
    </body>
    </html>
    """

    try:
        email = EmailMessage(
            subject,
            html_message,
            "CRAW SECURITY BATCH <training@craw.in>",
            [student.email]
        )
        email.content_subtype = "html"
        email.send()
        logger.info(f"[Student Removal Email] Sent to {student.email}")
    except Exception as e:
        logger.error(f"[Student Removal Email] Failed for {student.email}: {str(e)}")
