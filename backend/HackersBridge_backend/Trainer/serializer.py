from django.contrib.auth import get_user_model  # ✅ Get the correct user model dynamically
from rest_framework import serializers
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.db import transaction
from .models import Trainer
from Coordinator.models import Coordinator
from nexus.models import Course, Location, Timeslot
from rest_framework.authtoken.models import Token

User = get_user_model()

class TrainerSerializer(serializers.ModelSerializer):
    """Serializer for Trainer model"""

    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
    timeslot = serializers.PrimaryKeyRelatedField(queryset=Timeslot.objects.all(), many=True)
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), required=False)
    teamleader = serializers.PrimaryKeyRelatedField(queryset=Trainer.objects.filter(is_teamleader=True), required=False, allow_null=True)
    coordinator = serializers.PrimaryKeyRelatedField(queryset=Coordinator.objects.all())

    # ✅ Computed fields
    coordinator_name = serializers.SerializerMethodField()
    course_names = serializers.SerializerMethodField()
    teamleader_name = serializers.SerializerMethodField()
    inactive_days = serializers.SerializerMethodField()

    class Meta:
        model = Trainer
        fields = [
            'id', 'trainer_id', 'name', 'email', 'phone', 'date_of_joining',
            'experience', 'languages', 'weekoff', 'location', 'is_teamleader', 'status', 'timeslot',
            'teamleader', 'coordinator', 'course', 'coordinator_name', 'course_names', 'teamleader_name', 'inactive_days', 'leave_status'
        ]
        extra_kwargs = {
            'trainer_id': {'required': False}
        }

    def get_coordinator_name(self, obj):
        return obj.coordinator.name if obj.coordinator else None

    def get_course_names(self, obj):
        return [course.name for course in obj.course.all()]

    def get_teamleader_name(self, obj):
        return obj.teamleader.name if obj.teamleader else None

    def get_inactive_days(self, obj):
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
            data['trainer_id'] = self.generate_trainer_id()

        return data

    def create(self, validated_data):
        """Creates Trainer & associated User safely with error handling."""
        validated_data['trainer_id'] = self.generate_trainer_id()
        temp_password = get_random_string(length=8)

        courses = validated_data.pop('course', [])
        timeslots = validated_data.pop('timeslot', [])

        request_user = self.context['request'].user
        validated_data['last_update_user'] = request_user

        with transaction.atomic():  # ✅ Ensure atomicity
            trainer = Trainer.objects.create(**validated_data)

            # ✅ Avoid duplicate User creation
            user, created = User.objects.get_or_create(
                username=validated_data['trainer_id'],
                first_name=trainer.name,
                defaults={
                    'email': validated_data['email'],
                    'password': temp_password,
                    'role': 'Trainer'
                }
            )

            if created:
                Token.objects.create(user=user)
                # send_mail(
                #     subject="Your Temporary Password",
                #     message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
                #     from_email="noreply@yourdomain.com",
                #     recipient_list=[user.email],
                #     fail_silently=False,
                # )

            trainer.course.set(courses)
            trainer.timeslot.set(timeslots)

        return trainer

    def update(self, instance, validated_data):
        """Safely updates an existing Trainer instance with atomic transactions."""

        # ✅ Extract Many-to-Many fields before updating
        courses = validated_data.pop('course', None)
        timeslots = validated_data.pop('timeslot', None)

        request_user = self.context['request'].user  # ✅ Get the logged-in user

        with transaction.atomic():  # ✅ Ensure atomicity
            # ✅ Update instance fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            # ✅ Update many-to-many relationships only if provided
            if courses is not None:
                instance.course.set(courses)
            if timeslots is not None:
                instance.timeslot.set(timeslots)

            instance.last_update_user = request_user  # ✅ Log who updated the record
            instance.save()

            # ✅ If the trainer's email is updated, update the associated User model
            if 'email' in validated_data:
                User.objects.filter(username=instance.trainer_id).update(email=validated_data['email'])

        return instance



