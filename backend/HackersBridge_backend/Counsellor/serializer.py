from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from .models import Counsellor
from Student.models import Student
from rest_framework.authtoken.models import Token

User = get_user_model()  # ✅ Get the correct user model dynamically

class CounsellorSerializer(serializers.ModelSerializer):
    assigned_students = serializers.SerializerMethodField()

    class Meta:
        model = Counsellor
        fields = ['id', 'counsellor_id', 'name', 'email', 'phone', 'weekoff', 'location', 'status', 'assigned_students']

    def get_assigned_students(self, obj):
        students = Student.objects.filter(course_counsellor=obj)
        return [student.name for student in students]

    def generate_counsellor_id(self):
        """Generates a unique counsellor ID with sequential numbering."""
        prefix = "CRAWCS"
        last_counsellor = Counsellor.objects.order_by('-counsellor_id').first()

        if last_counsellor and last_counsellor.counsellor_id.startswith(prefix):
            num_part = int(last_counsellor.counsellor_id[-3:]) + 1  # Extract number & increment
        else:
            num_part = 1  # Start from 001 if no previous record exists

        return f"{prefix}{num_part:03d}"  # Format as "CRAWCS001", "CRAWCS002", etc.

    def create(self, validated_data):
        # ✅ Generate a unique counsellor_id before saving
        validated_data['counsellor_id'] = self.generate_counsellor_id()

        # Generate a temporary password
        temp_password = get_random_string(length=8)

        # Create the Counsellor instance
        counsellor = Counsellor.objects.create(**validated_data)

        # ✅ Use the generated counsellor_id as username
        user = User.objects.create_user(
            username=validated_data['counsellor_id'],
            email=validated_data['email'],
            password=temp_password,
            role='Counsellor'
        )

        # Send temporary password via email
        # send_mail(
        #     subject="Your Temporary Password",
        #     message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
        #     from_email="noreply@yourdomain.com",
        #     recipient_list=[user.email],
        #     fail_silently=False,
        # )

        # Create authentication token
        Token.objects.create(user=user)

        user.save()
        return counsellor  # Return only the Counsellor instance
