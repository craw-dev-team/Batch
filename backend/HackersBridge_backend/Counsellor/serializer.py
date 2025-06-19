# ✅ Import necessary modules
from .models import Counsellor                                   # Counsellor model
from Student.models import Student                               # Student model for reverse relation
from rest_framework import serializers                           # For creating custom serializers
from django.core.mail import send_mail                           # To send email (currently commented out)
from django.contrib.auth import get_user_model                   # To retrieve the active User model
from django.utils.crypto import get_random_string                # To generate a temporary password
from rest_framework.authtoken.models import Token                # For generating auth token for the user

# ✅ Get the custom User model (instead of using auth.User directly)
User = get_user_model()

# ✅ Counsellor serializer for creating and viewing counsellor data
class CounsellorSerializer(serializers.ModelSerializer):
    # Add a computed field to list names of students assigned to the counsellor
    assigned_students = serializers.SerializerMethodField()

    class Meta:
        model = Counsellor
        fields = ['id', 'counsellor_id', 'name', 'email', 'phone', 'weekoff', 'location', 'status', 'assigned_students']

    def get_assigned_students(self, obj):
        """
        This method returns the list of student names assigned to the given counsellor.
        """
        students = Student.objects.filter(course_counsellor=obj)
        return [student.name for student in students]

    def generate_counsellor_id(self):
        """
        Generates a unique counsellor ID with a 'CRAWCS' prefix and sequential numbering.
        Example: CRAWCS001, CRAWCS002, ...
        """
        prefix = "CRAWCS"
        last_counsellor = Counsellor.objects.order_by('-counsellor_id').first()

        if last_counsellor and last_counsellor.counsellor_id.startswith(prefix):
            num_part = int(last_counsellor.counsellor_id[-3:]) + 1  # Increment the last numeric part
        else:
            num_part = 1  # Start numbering from 001

        return f"{prefix}{num_part:03d}"  # Format it with leading zeros

    def create(self, validated_data):
        """
        Custom create method:
        - Generates counsellor_id
        - Creates Counsellor
        - Creates associated User with role 'Counsellor'
        - Generates a temporary password
        - Sends optional email with credentials
        - Creates auth token for login
        """
        # ✅ Assign a new, unique counsellor ID
        validated_data['counsellor_id'] = self.generate_counsellor_id()

        # ✅ Generate a temporary password for the user
        temp_password = get_random_string(length=8)

        # ✅ Create the actual Counsellor model instance
        counsellor = Counsellor.objects.create(**validated_data)

        # ✅ Create a user account tied to the counsellor using counsellor_id as username
        user = User.objects.create_user(
            username=validated_data['counsellor_id'],
            email=validated_data['email'],
            password=temp_password,
            role='Counsellor'  # Assign role
        )

        # ✅ Send credentials to counsellor via email (optional, currently commented out)
        # send_mail(
        #     subject="Your Temporary Password",
        #     message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
        #     from_email="noreply@yourdomain.com",
        #     recipient_list=[user.email],
        #     fail_silently=False,
        # )

        # ✅ Generate an authentication token for API access
        Token.objects.create(user=user)

        user.save()  # Ensure user is saved

        # ✅ Return only the counsellor data (not user or token)
        return counsellor
