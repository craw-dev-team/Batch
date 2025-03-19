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
    class Meta:
        model = BatchStudentAssignment
        fields = ['batch', 'student', 'coordinator']


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
        
        read_only_fields = ['batch_id']  # Ensure batch_id is generated automatically

    def get_student_name(self, obj):
        """Return student names as a list."""
        return [student.name for student in obj.student.all()]

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

    def create(self, validated_data):
        """Override create method to generate batch_id and end_date automatically."""
        students = validated_data.pop('student', [])  # Extract students list
        course = validated_data.get('course')
        mode = validated_data.get('mode')
        location = validated_data.get('location')
        trainer = validated_data.get('trainer')
        language = validated_data.get('language')
        batch_time = validated_data.get('batch_time')
        preferred_week = validated_data.get('preferred_week')
        start_date = validated_data.get('start_date')
        status = validated_data.get('status')

        # existing_batch = Batch.objects.filter(
        #     course=course, mode=mode, location=location, trainer=trainer,
        #     language=language, batch_time=batch_time, start_date=start_date,
        #     preferred_week=preferred_week
        # ).exists()


        existing_batch = Batch.objects.filter(
            trainer=trainer, batch_time=batch_time, start_date=start_date,
            preferred_week=preferred_week
        ).exists()

        if existing_batch:
            raise serializers.ValidationError("Batch already exists")
        
        # Calculate end date
        validated_data['end_date'] = start_date + timedelta(days=course.duration) if start_date and course else None

        # Create batch instance first (without batch_id)
        batch = Batch.objects.create(**validated_data)

        # Generate and assign batch_id
        batch.batch_id = self.generate_batch_id(course, start_date)
        batch.save(update_fields=['batch_id'])
        batch.student.set(students)

        return batch
    
    def update(self, instance, validated_data):
        """Update batch details and regenerate batch_id if course changes."""
        new_course = validated_data.get('course', instance.course)
        new_start_date = validated_data.get('start_date', instance.start_date)

        # Check if course has changed, and regenerate batch_id if needed
        if new_course != instance.course:
            instance.batch_id = self.generate_batch_id(new_course, new_start_date)
            instance.course = new_course  # Update course
            instance.start_date = new_start_date  # Update start date
            instance.save(update_fields=['batch_id', 'course', 'start_date'])

        # Update end_date if start_date is modified
        if 'start_date' in validated_data:
            instance.end_date = new_start_date + timedelta(days=new_course.duration) if new_course else None

        # Update students if provided
        students = validated_data.pop('student', None)
        if students is not None:
            instance.student.set(students)  # Update students list
        return super().update(instance, validated_data)