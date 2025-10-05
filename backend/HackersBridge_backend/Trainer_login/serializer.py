from rest_framework import serializers
from nexus.models import Attendance



class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

    def validate(self, attrs):
        student = attrs.get('student')
        batch = attrs.get('batch')
        date = attrs.get('date')

        if not (student and batch and date):
            raise serializers.ValidationError("Student, batch, and date are required.")

        # If creating a new record
        if self.instance is None and Attendance.objects.filter(student=student, batch=batch, date=date).exists():
            raise serializers.ValidationError("Attendance for this student, batch, and date already exists.")

        return attrs
