from django.contrib.auth import get_user_model  # ✅ Import get_user_model
from rest_framework import serializers
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from .models import Coordinator
from Student.models import Student
from rest_framework.authtoken.models import Token
from Trainer.models import Trainer


User = get_user_model()  # ✅ Get the correct user model dynamically

class CoordinatorSerializer(serializers.ModelSerializer):
    assigned_students = serializers.SerializerMethodField()
    assigned_trainers = serializers.SerializerMethodField()

    class Meta:
        model = Coordinator
        fields = ['id', 'coordinator_id', 'name', 'email', 'phone', 'weekoff', 'status', 'assigned_students', 'assigned_trainers']

    def get_assigned_students(self, obj):
        students = Student.objects.filter(support_coordinator=obj)
        return [student.name for student in students]
    
    def get_assigned_trainers(self, obj):
        trainers = Trainer.objects.filter(coordinator=obj)
        return [trainer.name for trainer in trainers]
    
    def generate_coordinator_id(self):
        """Generates a unique coordinator ID with sequential numbering."""
        prefix = "CRAWCR"
        last_coordinator = Coordinator.objects.order_by('-coordinator_id').first()

        if last_coordinator and last_coordinator.coordinator_id.startswith(prefix):
            num_part = int(last_coordinator.coordinator_id[-3:]) + 1  # Extract number & increment
        else:
            num_part = 1  # Start from 001 if no previous record exists

        return f"{prefix}{num_part:03d}"  # Format as "CRAWCR001", "CRAWCR002", etc.

    def create(self, validated_data):
        # Generate and assign a unique coordinator ID
        validated_data['coordinator_id'] = self.generate_coordinator_id()

        # Generate a temporary password
        temp_password = get_random_string(length=8)

        # Create the Coordinator instance
        coordinator = Coordinator.objects.create(**validated_data)

        # Create the Coordinator's user account with the 'coordinator' role
        user = User.objects.create_user(
            username=validated_data['coordinator_id'],  # Use generated coordinator_id as username
            email=validated_data['email'],
            password=temp_password,
            role='coordinator'  # Explicitly set the role
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
        return coordinator  # Return only the Coordinator instance
