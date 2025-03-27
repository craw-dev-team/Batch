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
import random
from Student.serializer import StudentSerializer


User = get_user_model()

# **User Registration Serializer**
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')

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
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True)

    # ✅ Correct usage of TimeslotSerializer
    batch_time_data = TimeslotSerializer(source="batch_time", many=False, read_only=True)

    # Additional Fields
    course_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()
    batch_location = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            'id', 'batch_id', 'course', 'trainer', 'student', 'status',
            'start_date', 'end_date', 'mode', 'language', 'preferred_week',
            'batch_time', 'batch_time_data',  # ✅ Correctly referenced
            'location', 'course_name', 'student_name', 'trainer_name', 'batch_location'
        ]

    def get_student_name(self, obj):
        return [student.name for student in obj.student.all()]
    
    def get_course_name(self, obj):
        return obj.course.name if obj.course else None
    
    def get_trainer_name(self, obj):
        return obj.trainer.name if obj.trainer else None
    
    def get_batch_location(self, obj):
        return obj.location.locality if obj.location else None

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

        # # Check if trainer is already assigned to another batch at the same time
        # if Batch.objects.filter(trainer=trainer, batch_time=batch_time, start_date=start_date).exists():
        #     raise serializers.ValidationError({"error": "Trainer is already assigned to another batch at this time."})

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

        # Create batch instance first (without batch_id)
        batch = Batch.objects.create(**validated_data)

        # Assign students to batch
        batch.student.set(students)  

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

        # Generate and assign batch_id
        batch.batch_id = self.generate_batch_id(course, start_date)
        batch.save(update_fields=['batch_id', 'end_date'])

        return batch


    def update(self, instance, validated_data):
        """Update batch details, regenerate batch_id if course changes, and update student statuses."""

        # Extract relevant fields
        new_course = validated_data.get('course', instance.course)
        new_start_date = validated_data.get('start_date', instance.start_date)
        new_end_date = validated_data.get('end_date', instance.end_date)
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

            # Set the updated list of students
            instance.student.set(students)

        # Update remaining batch fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Save the batch instance
        instance.save()

        return instance