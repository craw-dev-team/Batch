from django.contrib.auth import get_user_model  # ✅ Get the correct user model dynamically
from rest_framework import serializers
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from .models import Trainer
from Coordinator.models import Coordinator
from nexus.models import Course, Location, Timeslot
from rest_framework.authtoken.models import Token
import re  # ✅ Import regex for pattern matching

User = get_user_model()

class TrainerSerializer(serializers.ModelSerializer):
    """Serializer for Trainer model"""

    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
    timeslot = serializers.PrimaryKeyRelatedField(queryset=Timeslot.objects.all(), many=True)  # ✅ Added timeslot field
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), required=False)
    teamleader = serializers.PrimaryKeyRelatedField(queryset=Trainer.objects.filter(is_teamleader=True), required=False, allow_null=True)
    coordinator = serializers.PrimaryKeyRelatedField(queryset=Coordinator.objects.all())

    # ✅ SerializerMethodField for computed fields
    coordinator_name = serializers.SerializerMethodField()
    course_names = serializers.SerializerMethodField()
    teamleader_name = serializers.SerializerMethodField()
    inactive_days = serializers.SerializerMethodField()

    class Meta:
        model = Trainer
        fields = [
            'id', 'trainer_id', 'name', 'email', 'phone', 'date_of_joining',
            'experience', 'languages', 'weekoff', 'location', 'is_teamleader', 'status', 'timeslot',
            'teamleader', 'coordinator', 'course', 'coordinator_name', 'course_names', 'teamleader_name', 'inactive_days'
        ]
        extra_kwargs = {
            'trainer_id': {'required': False}
        }

    def get_coordinator_name(self, obj):
        """Return coordinator's name if available"""
        return obj.coordinator.name if obj.coordinator else None

    def get_course_names(self, obj):
        """Return a list of course names associated with the trainer"""
        return [course.name for course in obj.course.all()]

    def get_timeslot_names(self, obj):
        """Return a list of timeslot details associated with the trainer"""
        return [str(timeslot) for timeslot in obj.timeslot.all()]

    def get_teamleader_name(self, obj):
        """Return team leader's name if available"""
        return obj.teamleader.name if obj.teamleader else None

    def get_inactive_days(self, obj):
        """Compute inactive days for the trainer"""
        return obj.calculate_inactive_days() if hasattr(obj, "calculate_inactive_days") else 0

    def generate_trainer_id(self):
        """Generates a unique trainer ID with sequential numbering."""
        prefix = "CRAWTR"
        last_trainer = Trainer.objects.exclude(trainer_id__isnull=True).exclude(trainer_id="").order_by('-id').first()

        if last_trainer and last_trainer.trainer_id.startswith(prefix):
            num_part = int(last_trainer.trainer_id.replace(prefix, "")) + 1
        else:
            num_part = 1  

        return f"{prefix}{num_part:03d}"
    def to_internal_value(self, data):
        """Assigns a trainer ID only if creating a new trainer."""
        data = super().to_internal_value(data)
        
        if self.instance:  # ✅ If updating, keep the existing trainer_id
            data['trainer_id'] = self.instance.trainer_id
        elif 'trainer_id' not in data or not data['trainer_id']:  
            data['trainer_id'] = self.generate_trainer_id()  # Only assign new ID if creating

        return data

    def create(self, validated_data):
        validated_data['trainer_id'] = self.generate_trainer_id()  
        temp_password = get_random_string(length=8)

        # ✅ Pop course data before creating the trainer
        courses = validated_data.pop('course', [])
        timeslots = validated_data.pop('timeslot', [])

        trainer = Trainer.objects.create(**validated_data)

        user = User.objects.create_user(
            username=validated_data['trainer_id'],
            email=validated_data['email'],
            password=temp_password,
            role='Trainer'
        )

        # send_mail(
        #     subject="Your Temporary Password",
        #     message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
        #     from_email="noreply@yourdomain.com",
        #     recipient_list=[user.email],
        #     fail_silently=False,
        # )

        # ✅ Correct ManyToMany assignment
        trainer.course.set(courses)
        trainer.timeslot.set(timeslots)

        Token.objects.create(user=user)
        user.save()
        
        return trainer