# ✅ Django built-in and DRF imports
from django.core.mail import send_mail  # For sending emails (currently commented)
from rest_framework import serializers  # Serializer base classes
from django.contrib.auth import get_user_model  # Dynamically get the User model
from django.utils.crypto import get_random_string  # For generating secure random strings (used in password generation)
from rest_framework.authtoken.models import Token  # For generating auth tokens

# ✅ Local and related app models
from .models import Coordinator
from Student.models import Student
from Trainer.models import Trainer

# ✅ Get the User model (custom or default)
User = get_user_model()

class CoordinatorSerializer(serializers.ModelSerializer):
    # Custom fields to include related data
    assigned_students = serializers.SerializerMethodField()
    assigned_trainers = serializers.SerializerMethodField()

    class Meta:
        model = Coordinator
        fields = [
            'id', 'coordinator_id', 'name', 'email', 'phone',
            'weekoff', 'status', 'assigned_students', 'assigned_trainers'
        ]

    def get_assigned_students(self, obj):
        """
        Get a list of student names assigned to this coordinator.
        """
        students = Student.objects.filter(support_coordinator=obj)
        return [student.name for student in students]
    
    def get_assigned_trainers(self, obj):
        """
        Get a list of trainer names assigned to this coordinator.
        """
        trainers = Trainer.objects.filter(coordinator=obj)
        return [trainer.name for trainer in trainers]
    
    def generate_coordinator_id(self):
        """
        Generate a unique coordinator ID using a prefix and sequential numbering.
        Format: 'CRAWCR001', 'CRAWCR002', etc.
        """
        prefix = "CRAWCR"
        last_coordinator = Coordinator.objects.order_by('-coordinator_id').first()

        if last_coordinator and last_coordinator.coordinator_id.startswith(prefix):
            # Extract last numeric part and increment
            num_part = int(last_coordinator.coordinator_id[-3:]) + 1
        else:
            num_part = 1  # Start from 1 if no record exists

        return f"{prefix}{num_part:03d}"  # Format number with 3 digits

    def create(self, validated_data):
        """
        Create a new Coordinator instance along with a related user account and token.
        """
        # ✅ Generate and assign coordinator ID
        validated_data['coordinator_id'] = self.generate_coordinator_id()

        # ✅ Generate a temporary 8-character random password
        temp_password = get_random_string(length=8)

        # ✅ Create Coordinator record
        coordinator = Coordinator.objects.create(**validated_data)

        # ✅ Create associated user account using coordinator ID as username
        user = User.objects.create_user(
            username=validated_data['coordinator_id'],
            email=validated_data['email'],
            password=temp_password,
            role='coordinator'
        )

        # ✅ Optional: Send the temporary password to the coordinator via email
        # send_mail(
        #     subject="Your Temporary Password",
        #     message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
        #     from_email="noreply@example.com",
        #     recipient_list=[user.email],
        #     fail_silently=False,
        # )

        # ✅ Create a token for authentication
        Token.objects.create(user=user)

        # ✅ Save the user
        user.save()

        return coordinator  # Return only the Coordinator instance (not the User)
