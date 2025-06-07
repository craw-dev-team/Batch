from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from .models import *
from Student.models import *
from django.db.models import Max
from datetime import datetime, timedelta
from nexus.models import *
from Trainer.models import *
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from Student.serializer import StudentSerializer
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
import random

User = get_user_model()

# **User Registration Serializer**
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.get('role', 'student')

        if role == 'admin':
            # Create user with a provided password
            user = User.objects.create_user(
                username=validated_data['username'],
                password=validated_data['password'],
                email=validated_data.get('email', ''),
                role=role
            )
        else:
            # Generate a random temporary password for non-admin users
            temp_password = get_random_string(length=8)

            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=temp_password,
                role=role
            )

            # Send temporary password via email
            send_mail(
                subject="Your Temporary Password",
                message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
                from_email="noreply@yourdomain.com",
                recipient_list=[user.email],
                fail_silently=False,
            )

        # Create authentication token
        token, created = Token.objects.get_or_create(user=user)

        return user

# **User Login Serializer**
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid username or password")

        # Check if it's the first login
        if user.first_login:
            return {'user': user}
        return {'user': user}

# **For One Time Reset Password Serializer**
class FirstTimeResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if len(data['new_password']) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        return data

    def save(self, user):
        user.set_password(self.validated_data['new_password'])
        user.first_login = False  # Mark first login as completed
        user.save()

        # Send confirmation email
        send_mail(
            subject="Password Changed Successfully",
            message="Your password has been changed successfully.",
            from_email="noreply@yourdomain.com",
            recipient_list=[user.email],
            fail_silently=False,
        )



# This is for Forgot Password
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

        # Generate and store OTP
        otp = get_random_string(length=6, allowed_chars='1234567890')
        OTPVerification.objects.create(user=user, otp=otp)

        # Send OTP via email
        send_mail(
            subject="Your Password Reset OTP",
            message=f"Your OTP for password reset is: {otp}.",
            from_email="noreply@yourdomain.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return data
    

# This is For OTP Varification
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        otp = data.get('otp')

        try:
            user = User.objects.get(email=email)
            otp_record = OTPVerification.objects.filter(user=user, otp=otp).first()
            if not otp_record:
                raise serializers.ValidationError("Invalid OTP or OTP expired.")
            
            # OTP is valid, delete it
            otp_record.delete()
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        return data
    


{


# This is For Reset Password
# class ResetPasswordSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     new_password = serializers.CharField(write_only=True)

#     def validate(self, data):
#         email = data.get('email')
#         new_password = data.get('new_password')

#         try:
#             user = User.objects.get(email=email)
#             user.set_password(new_password)
#             user.save()

#             #Send confirmation email
#             send_mail(
#                 subject="Password Reset Successful",
#                 message="Your password has been successfully reset.",
#                 from_email="noreply@yourdomain.com",
#                 recipient_list=[email],
#                 fail_silently=False,
#             )
#         except User.DoesNotExist:
#             raise serializers.ValidationError("User not found.")

#         return data
}



class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        new_password = data.get('new_password')

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()

            # Send confirmation email
            send_mail(
                subject="Password Reset Successful",
                message="Your password has been successfully reset.",
                from_email="noreply@yourdomain.com",
                recipient_list=[email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        return data



class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'certification_body', 'duration', 'code']



class TimeslotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeslot
        fields = '__all__'



class BatchSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    batch_time_data = TimeslotSerializer(source="batch_time", read_only=True)

    class Meta:
        model = Batch
        fields = [
            'id', 'batch_id', 'course', 'trainer', 'student', 'status',
            'start_date', 'end_date', 'mode', 'language', 'preferred_week',
            'batch_time', 'batch_time_data', 'location', 'gen_time',
            'batch_created_by', 'last_update_user', 'last_update_datetime',
            'batch_create_datetime', 'batch_link'
        ]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['course_name'] = instance.course.name if instance.course else None
        rep['trainer_name'] = instance.trainer.name if instance.trainer else None
        rep['batch_location'] = instance.location.locality if instance.location else None
        rep['student_name'] = [s.name for s in instance.student.all()]

        # Trainer weekoff (handled manually)
        rep['trainer_weekoff'] = instance.trainer.weekoff if hasattr(instance.trainer, 'weekoff') else None


        # Safely access nested coordinator data
        coordinator = getattr(instance.trainer, 'coordinator', None)
        rep['batch_coordinator_name'] = coordinator.name if coordinator else None
        rep['batch_coordinator_phone'] = coordinator.phone if coordinator else None

        return rep 

    def create(self, validated_data):
        students = validated_data.pop('student', [])  # Extract students list
        batch = Batch.objects.create(**validated_data)
        batch.student.set(students)  # Use `.set()` for ManyToManyField
        return batch

    def update(self, instance, validated_data):
        students = validated_data.pop('student', None)
        if students is not None:
            instance.student.set(students)  # Update students list
        return super().update(instance, validated_data)
    
      


class BatchStudentAssignmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    class Meta:
        model = BatchStudentAssignment
        fields = ['id', 'batch', 'student', 'coordinator', 'student_batch_status']



{
# class BatchCreateSerializer(serializers.ModelSerializer):
#     batch_id = serializers.SerializerMethodField()
#     student_name = serializers.SerializerMethodField()
#     # end_date = serializers.SerializerMethodField()

#     class Meta:
#         model = Batch
#         fields = [
#             'id', 'batch_id', 'course', 'mode', 'location', 'trainer', 'language',
#             'preferred_week', 'batch_time', 'start_date', 'end_date', 'student', 'student_name'
#         ]
        
#     def get_student_name(self, obj):
#         return [student.name for student in obj.student.all()]

#     def get_batch_id(self, obj):
#         """Generate a formatted batch_id."""
#         if not obj.course or not obj.start_date:
#             return None

#         course_code = obj.course.code.upper() if obj.course.code else "XX"
#         start_year = obj.start_date.year % 100  # Extract last two digits of the year

#         # Get the last batch ID with the same prefix
#         last_batch = Batch.objects.filter(batch_id__startswith=f"CRAW-{course_code}{start_year}").aggregate(Max('batch_id'))
#         last_batch_id = last_batch['batch_id__max']

#         # Determine the next sequence number
#         if last_batch_id:
#             last_sequence = int(last_batch_id[-3:])
#             new_sequence = last_sequence + 1
#         else:
#             new_sequence = 1

#         return f"CRAW-{course_code}{start_year:02d}{new_sequence:03d}"

#     # def get_end_date(self, obj):
#     #     """Calculate and return the end date based on course duration."""
#     #     if obj.start_date and obj.course and obj.course.duration:
#     #         return obj.start_date + timedelta(days=obj.course.duration)
#     #     return None

#     # def get_trainers(self, obj):
#     #     """Filter available trainers dynamically."""
#     #     if not obj.course or not obj.language or not obj.preferred_week or not obj.batch_time:
#     #         return []

#     #     # Filter trainers based on course, language, and status
#     #     language_filter = [obj.language, "Both"]
#     #     trainers = Trainer.objects.filter(
#     #         course__id=obj.course.id,
#     #         languages__in=language_filter,
#     #         status='Active'
#     #     )

#     #     # Exclude unavailable trainers
#     #     unavailable_trainers = Batch.objects.filter(
#     #         trainer__in=trainers,
#     #         start_date__lt=obj.end_date,
#     #         end_date__gt=obj.start_date,
#     #         preferred_week=obj.preferred_week,
#     #         batch_time=obj.batch_time,
#     #     ).values_list("trainer_id", flat=True)

#     #     available_trainers = trainers.exclude(id__in=unavailable_trainers)
#     #     return [{"id": trainer.id, "name": trainer.name} for trainer in available_trainers]

#     def create(self, validated_data):
#         """Override create method to auto-generate batch_id and end_date."""
#         course = validated_data.get('course')
#         start_date = validated_data.get('start_date')
#         validated_data['end_date'] = start_date + timedelta(days=course.duration) if start_date and course else None

#         batch = Batch.objects.create(**validated_data)
#         batch.batch_id = self.get_batch_id(batch)
#         batch.save()
#         return batch

#     def update(self, instance, validated_data):
#         """Update batch and regenerate batch_id if course is changed."""
#         new_course = validated_data.get('course', instance.course)
#         new_start_date = validated_data.get('start_date', instance.start_date)

#         # Regenerate batch_id if course has changed
#         if new_course != instance.course:
#             new_batch_id = self.get_batch_id(new_course, new_start_date)  # Pass correct arguments
#             instance.batch_id = new_batch_id  
#             instance.save(update_fields=['batch_id'])  # Save batch_id before proceeding

#         # Update end_date if start_date is changed
#         instance.end_date = new_start_date + timedelta(days=new_course.duration) if new_start_date and new_course else instance.end_date

#         students = validated_data.pop('student', None)
#         if students is not None:
#             instance.student.set(students)  # Update ManyToManyField

#         return super().update(instance, validated_data)


# from datetime import timedelta
# from django.db.models import Max
# from rest_framework import serializers
# from .models import Batch, Trainer

}



class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'



class BatchCreateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True)

    class Meta:
        model = Batch
        fields = [
            'id', 'batch_id', 'course', 'mode', 'location', 'trainer', 'language', 'status',
            'preferred_week', 'batch_time', 'start_date', 'end_date', 'student', 'student_name'
        ]
        
        read_only_fields = ['batch_id']

    def get_student_name(self, obj):
        """Return student names as a list."""
        return [student.name for student in obj.student.all()]
    
    def is_trainer_available(self, trainer, start_date, end_date, batch_time, preferred_week):
        """Check if the trainer is available for the given date range."""
        return not Batch.objects.filter(
            trainer=trainer,
            batch_time=batch_time,
            preferred_week=preferred_week,
            status__in=['Running', 'Upcoming'],  # Only consider active batches
            start_date__lte=end_date,  # Overlapping condition
            end_date__gte=start_date
        ).exists()

    # THIS FUNCTION IS CREATED FOR BATCH ID....
    def generate_batch_id(self, course, start_date):
        """Generate a new batch ID dynamically."""
        if not course or not start_date:
            return None

        course_code = course.code.upper() if course.code else "XX"
        start_year = start_date.year % 100  # Extract last two digits of the year

        # Find the last batch with the same prefix
        last_batch = Batch.objects.filter(batch_id__startswith=f"CRAW-{course_code}{start_year}") \
            .aggregate(Max('batch_id'))
        last_batch_id = last_batch['batch_id__max']

        # Determine the next sequence number
        if last_batch_id:
            try:
                last_sequence = int(last_batch_id[-3:])  # Extract last 3 digits
                new_sequence = last_sequence + 1
            except ValueError:
                new_sequence = 1
        else:
            new_sequence = 1

        return f"CRAW-{course_code}{start_year:02d}{new_sequence:03d}"

    # THIS FUNCTION IS CREATED FOR CALCULATE BATCH END-DATE....
    def calculate_end_date(self, start_date, course_duration, preferred_week):
        """Calculate the end date based on course duration and preferred week."""
        if not start_date or not course_duration:
            return None

        preferred_week = preferred_week if preferred_week else ""  # Handle None values
        current_date = start_date  # Fix: Start from start_date, not start_date - 1
        course_days = course_duration
        
        if preferred_week == "Weekdays":
            current_date = current_date + timedelta(course_days)
        
        elif preferred_week == "Weekends":
            course_days = course_days + 10
            current_date = current_date + timedelta(course_days)
            
        else:
            current_date = current_date + timedelta(course_days)
      
        return current_date

    # THIS FUNCTION IS CREATED FOR BATCH ATTENDANCE
    def create_daily_attendance_records(self, batch, students, start_date, end_date, preferred_week):
        attendance_objects = []
        trainer = batch.trainer
        course = batch.course
        time_slot = batch.batch_time

        current_date = start_date
        while current_date <= end_date:
            weekday = current_date.weekday()

            # Filter days based on preferred_week
            if preferred_week == "Weekdays" and weekday >= 5:
                current_date += timedelta(days=1)
                continue
            elif preferred_week == "Weekends" and weekday <= 4:
                current_date += timedelta(days=1)
                continue
            elif preferred_week == "Both":
                pass  # Allow all days
            elif preferred_week not in ["Weekdays", "Weekends", "Both"]:
                # Optional: Skip invalid week preferences
                current_date += timedelta(days=1)
                continue

            for student in students:
                attendance_objects.append(Attendance(
                    student=student,
                    trainer=trainer,
                    trainer_name=str(trainer) if trainer else None,
                    course=course,
                    course_name=str(course) if course else None,
                    batch=batch,
                    time_slot=time_slot,
                    attendance='Absent',
                    date=current_date
                ))

            current_date += timedelta(days=1)

        Attendance.objects.bulk_create(attendance_objects)


    def create(self, validated_data):
        """Override create method to generate batch_id and end_date automatically."""
        students = validated_data.pop('student', [])  # Extract students list
        trainer = validated_data.get('trainer')
        batch_time = validated_data.get('batch_time')
        preferred_week = validated_data.get('preferred_week')
        start_date = validated_data.get('start_date')
        end_date = validated_data.get('end_date')
        status = validated_data.get('status')

        # Check if batch already exists
        if Batch.objects.filter(trainer=trainer, batch_time=batch_time, start_date=start_date, preferred_week=preferred_week).exists():
            raise serializers.ValidationError({"error": "A batch with the same trainer, time, and start date already exists."})

        # Check trainer availability
        if not self.is_trainer_available(trainer, start_date, end_date, batch_time, preferred_week):
            raise serializers.ValidationError({"error": "Trainer is unavailable during this period due to overlapping batches."})

        # Ensure course duration is available
        course = validated_data.get('course')
        course_duration = getattr(course, 'duration', None)
        if not course_duration:
            raise serializers.ValidationError("Course duration is required to calculate end date.")

        # Calculate end date
        validated_data['end_date'] = self.calculate_end_date(start_date, course_duration, preferred_week)

        # ✅ Generate batch_id before creating the batch
        batch_id = self.generate_batch_id(course, start_date)
        validated_data['batch_id'] = batch_id

        # ✅ Now safe to create the batch
        batch = Batch.objects.create(**validated_data)

        # Assign students to batch
        batch.student.set(students)  

        # ✅ Create attendance only once
        self.create_daily_attendance_records(
            batch=batch,
            students=students,
            start_date=batch.start_date,
            end_date=batch.end_date,
            preferred_week=preferred_week
        )

        # Collect StudentCourse updates in bulk
        student_courses_to_update = []
        for student in students:
            student_course = StudentCourse.objects.filter(student=student, course=course).first()
            if student_course:
                if status == 'Running':
                    student_course.status = 'Ongoing'
                elif status == 'Upcoming':
                    student_course.status = 'Upcoming'
                elif status == 'Completed':
                    student_course.status = 'Completed'
                student_courses_to_update.append(student_course)

        # Bulk update StudentCourse status
        if student_courses_to_update:
            StudentCourse.objects.bulk_update(student_courses_to_update, ['status'])

        return batch

    def update(self, instance, validated_data):
        """Update batch details, regenerate batch_id if course changes, and update student statuses."""

        # Track original attendance-related fields
        old_start_date = instance.start_date
        old_end_date = instance.end_date
        old_preferred_week = instance.preferred_week

        # Extract relevant fields
        new_course = validated_data.get('course', instance.course)
        new_start_date = validated_data.get('start_date', instance.start_date)
        new_end_date = validated_data.get('end_date', instance.end_date)
        new_preferred_week = validated_data.get('preferred_week', instance.preferred_week)
        status = validated_data.get('status', instance.status)  # Default to current status if not updated


        # Regenerate batch_id if the course has changed
        if new_course != instance.course:
            instance.batch_id = self.generate_batch_id(new_course, new_start_date)
            instance.course = new_course
            instance.start_date = new_start_date
            instance.end_date = new_end_date
            instance.save(update_fields=['batch_id', 'course', 'start_date', 'end_date'])

        # Handle student additions/removals and update course status
        students = validated_data.pop('student', None)

        if students is not None:
            existing_students = set(instance.student.all())  # Current students in batch
            new_students = set(students)  # Updated student list

            removed_students = existing_students - new_students  # Students removed from batch
            added_students = new_students - existing_students  # New students added to batch

            # Bulk update course status for removed students
            if removed_students:
                if status == 'Running':
                    StudentCourse.objects.filter(student__in=removed_students, course=instance.course).update(status='Denied')
                elif status == 'Upcoming':
                    StudentCourse.objects.filter(student__in=removed_students, course=instance.course).update(status='Not Started')

            # Bulk update course status for added students
            if added_students:
                student_status_mapping = {
                    'Running': 'Ongoing',
                    'Upcoming': 'Upcoming',
                    'Completed': 'Completed'
                }
                StudentCourse.objects.filter(student__in=added_students, course=instance.course).update(
                    status=student_status_mapping.get(status, 'Not Started')
                )

                # Activate added students if currently inactive
                for student in added_students:
                    student_obj = Student.objects.filter(id=student.id).first()
                    if student_obj and student_obj.status == 'Inactive':
                        student_obj.status = 'Active'
                        student_obj.save(update_fields=['status'])

            # ✅ Corrected indentation: this should be outside the loop
            instance.student.set(students)

        # Update remaining fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ⚡️ If date or week schedule changed, reset attendance
        if (
            old_start_date != new_start_date or
            old_end_date != new_end_date or
            old_preferred_week != new_preferred_week
        ):
            Attendance.objects.filter(batch=instance).delete()
            self.create_daily_attendance_records(
                batch=instance,
                students=instance.student.all(),
                start_date=new_start_date,
                end_date=new_end_date,
                preferred_week=new_preferred_week
            )

        # ✅ Always create attendance for new students (even if dates didn't change)
        if added_students:
            self.create_daily_attendance_records(
                batch=instance,
                students=added_students,
                start_date=new_start_date,
                end_date=new_end_date,
                preferred_week=new_preferred_week
            )


        if removed_students:
            if status == 'Running':
                StudentCourse.objects.filter(student__in=removed_students, course=instance.course).update(status='Denied')
            elif status == 'Upcoming':
                StudentCourse.objects.filter(student__in=removed_students, course=instance.course).update(status='Not Started')

            # Send removal email to removed students
            for student in removed_students:
                subject = f"You have been removed from {instance.course} ({instance.batch_id})"
                html_message = f"""<html>
        <head>
        <meta charset="UTF-8">
        <title>Removed from Batch</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; color: #000;">
            <div style="text-align: center; padding: 20px; border-bottom: 1px solid #ddd;">
                <img src="https://www.craw.in/wp-content/uploads/2023/01/crawacademy-logo.png" alt="CRAW" style="max-height: 60px;">
            </div>
            <div style="padding: 30px; font-size: 16px; color: #000;">
                <h2 style="text-align: center; font-size: 22px; color: #000;">📢 Batch Update Notice</h2>
                <p style="color: #000;">Dear <strong>{ student.name }</strong>,</p>
                <p style="color: #000;">We would like to inform you that you have been removed from the <strong>{ instance.course }</strong> course batch <strong>{ instance.batch_id }</strong>.</p>
                <p style="color: #000;">If this was unexpected or if you believe this was a mistake, please contact your trainer or Craw Security support immediately.</p>
                <p style="margin-top: 30px; color: #000;">
                    📍 <strong>Our Address:</strong><br>
                    1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                    Behind Saket Metro Station, New Delhi 110030
                </p>
                <p style="color: #000;">
                    📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
                    📧 <strong>Email:</strong> training@craw.in<br>
                    🌐 <strong>Website:</strong> 
                    <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
                </p>
                <p style="color: #000;">
                    Warm regards,<br>
                    <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
                </p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 18px 20px; text-align: center; font-size: 14px; color: #000; border-top: 1px solid #ddd;">
                <p style="margin: 0;">© 2025 <strong>Craw Cyber Security Pvt Ltd</strong>. All Rights Reserved.</p>
                <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
            </div>
        </div>
        </body>
        </html>"""
                from_email = "CRAW SECURITY BATCH <training@craw.in>"
                try:
                    email = EmailMessage(subject, html_message, from_email, [student.email])
                    email.content_subtype = "html"
                    email.send()
                except Exception as e:
                    print(f"Failed to send removal email to {student.email}: {str(e)}")
            
        return instance



class LogEntrySerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(), slug_field='model'
    )
    actor = serializers.StringRelatedField()  # Shows actor's username
    actor_first_name = serializers.CharField(source='actor.first_name', read_only=True)

    class Meta:
        model = LogEntry
        fields = [
            'id', 'cid', 'content_type', 'object_id', 'object_pk', 
            'object_repr', 'action', 'changes', 'changes_text',
            'serialized_data', 'actor', 'remote_addr', 'timestamp', 'additional_data', 'actor_first_name'
        ]



class BookSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    last_updated_by = serializers.CharField(source='last_update_user.first_name', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'book_id', 'name', 'version', 'course', 'course_name', 'stock',
            'status', 'last_update_user', 'last_updated_by', 'last_update_datetime', 'gen_time'
        ]
        read_only_fields = ['last_update_user', 'last_update_datetime', 'gen_time']



# class AnnouncementSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Announcement
#         fields = [
#             'id', 'subject', 'text', 'file',
#             'batch', 'student',
#             'announcement_type', 'created_by',
#             'gen_time', 'is_active'
#         ]
#         read_only_fields = ['gen_time', 'created_by', 'announcement_type']



class AnnouncementCreateSerializer(serializers.ModelSerializer):
    Send_to = serializers.ListField(write_only=True, required=False)

    class Meta:
        model = Announcement
        fields = ['id', 'subject', 'text', 'file', 'Send_to', 'gen_time']

    def _resolve_recipients(self, identifiers):
        students, trainers, batches = [], [], []

        for identifier in identifiers:
            if identifier == 'Students':
                students.extend(Student.objects.all())
            elif identifier == 'Trainers':
                trainers.extend(Trainer.objects.all())
            # elif identifier == 'batches':
            #     batches.extend(Batch.objects.all())
            else:
                stu = Student.objects.filter(enrollment_no=identifier).first()
                if stu:
                    students.append(stu)
                    continue

                tra = Trainer.objects.filter(trainer_id=identifier).first()
                if tra:
                    trainers.append(tra)
                    continue

                bat = Batch.objects.filter(batch_id=identifier).first()
                if bat:
                    batches.append(bat)

        return students, trainers, batches

    
    def create(self, validated_data):
        request = self.context['request']
        send_to = validated_data.pop('Send_to', [])
        print(send_to)
        students, trainers, batches = self._resolve_recipients(send_to)

        announcement = Announcement.objects.create(
            **validated_data,
            created_by=request.user,
            announcement_type='Specific' if send_to else 'Overall'
        )

        # Set M2M fields after creation
        if students:
            announcement.student.set(students)
        if trainers:
            announcement.trainer.set(trainers)
        if batches:
            announcement.batch.set(batches)

        return announcement
    
    def update(self, instance, validated_data):
        send_to = validated_data.pop('Send_to', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if send_to is not None:
            students, trainers, batches = self._resolve_recipients(send_to)
            instance.student.set(students)
            instance.trainer.set(trainers)
            instance.batch.set(batches)
            instance.announcement_type = 'Specific' if send_to else 'Overall'
            instance.save()

        return instance
