# Django REST Framework serializer for handling Announcement creation and update logic
from rest_framework import serializers

# Importing models from respective apps
from .models import Announcement
from Student.models import Student
from nexus.models import Batch
from Trainer.models import Trainer


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    # Custom input field to define who should receive the announcement
    Send_to = serializers.ListField(write_only=True, required=False)

    class Meta:
        model = Announcement
        fields = ['id', 'subject', 'text', 'file', 'Send_to', 'gen_time']

    def _resolve_recipients(self, identifiers):
        """
        Helper method to resolve a list of identifiers (IDs/names) into actual 
        Student, Trainer, or Batch instances.

        Recognized identifiers:
        - 'Students' → All students
        - 'Trainers' → All trainers
        - Specific enrollment_no, trainer_id, or batch_id
        """
        students, trainers, batches = [], [], []

        for identifier in identifiers:
            if identifier == 'Students':
                students.extend(Student.objects.all())
            elif identifier == 'Trainers':
                trainers.extend(Trainer.objects.all())
            # Future enhancement: add all batches if needed
            # elif identifier == 'batches':
            #     batches.extend(Batch.objects.all())
            else:
                # Try resolving as a specific student
                stu = Student.objects.filter(enrollment_no=identifier).first()
                if stu:
                    students.append(stu)
                    continue

                # Try resolving as a specific trainer
                tra = Trainer.objects.filter(trainer_id=identifier).first()
                if tra:
                    trainers.append(tra)
                    continue

                # Try resolving as a specific batch
                bat = Batch.objects.filter(batch_id=identifier).first()
                if bat:
                    batches.append(bat)

        return students, trainers, batches

    def create(self, validated_data):
        """
        Custom create method to handle M2M (Many-to-Many) fields and 
        attach announcement to specific users/batches based on input.
        """
        request = self.context['request']
        send_to = validated_data.pop('Send_to', [])  # Get and remove 'Send_to' from data

        # Resolve recipients from identifiers
        students, trainers, batches = self._resolve_recipients(send_to)

        # Create the announcement object
        announcement = Announcement.objects.create(
            **validated_data,
            created_by=request.user,
            announcement_type='Specific' if send_to else 'Overall'  # Type based on target
        )

        # Assign many-to-many relationships
        if students:
            announcement.student.set(students)
        if trainers:
            announcement.trainer.set(trainers)
        if batches:
            announcement.batch.set(batches)

        return announcement

    def update(self, instance, validated_data):
        """
        Custom update method to allow editing the announcement and its recipients.
        Supports partial updates.
        """
        send_to = validated_data.pop('Send_to', None)

        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If recipients are provided, update them
        if send_to is not None:
            students, trainers, batches = self._resolve_recipients(send_to)
            instance.student.set(students)
            instance.trainer.set(trainers)
            instance.batch.set(batches)
            instance.announcement_type = 'Specific' if send_to else 'Overall'
            instance.save()

        return instance
