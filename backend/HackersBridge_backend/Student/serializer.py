from rest_framework import serializers
from .models import Student, Installment , StudentCourse
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from nexus.models import Course

User = get_user_model()  # ✅ Dynamically fetch the User model

class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    courses = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
    course_counsellor_name = serializers.SerializerMethodField()
    support_coordinator_name = serializers.SerializerMethodField()
    courses_names = serializers.SerializerMethodField()
    complete_course = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Course.objects.all()),
        write_only=True,  # This field is not returned in API responses
        required=False
    )
    complete_course_name = serializers.SerializerMethodField()  # Fixed: Changed to SerializerMethodField
    complete_course_id = serializers.SerializerMethodField()  # Fixed: Changed to SerializerMethodField

    class Meta:
        model = Student
        fields  =   ['id', 'enrollment_no', 'date_of_joining', 'name', 'email',
                    'phone', 'address', 'language', 'guardian_name', 'guardian_no',
                    'courses', 'mode', 'location', 'preferred_week', 'status', 'course_counsellor',
                    'support_coordinator', 'note', 'dob', 'last_update_user', 'student_assing_by',
                    'last_update_datetime', 'course_counsellor_name', 'support_coordinator_name',
                    'courses_names', 'complete_course', 'complete_course_id', 'complete_course_name']

    def get_course_counsellor_name(self, obj):
        return obj.course_counsellor.name if obj.course_counsellor else None

    def get_support_coordinator_name(self, obj):
        return obj.support_coordinator.name if obj.support_coordinator else None

    def get_courses_names(self, obj):
        return [course.name for course in obj.courses.all()]
    
    def get_complete_course_name(self, obj):
        """Fetch names of completed courses for the student."""
        # Fetch StudentCourse records where student has completed the course
        completed_courses = StudentCourse.objects.filter(student=obj, status='Completed')
        # Ensure we are accessing the `course` through the relationship
        return [student_course.course.name for student_course in completed_courses]
    
    def get_complete_course_id(self, obj):
        """Fetch names of completed courses for the student."""
        # Fetch StudentCourse records where student has completed the course
        completed_courses = StudentCourse.objects.filter(student=obj, status='Completed')
        # Ensure we are accessing the `course` through the relationship
        return [student_course.course.id for student_course in completed_courses]

    def create(self, validated_data):
        temp_password = get_random_string(length=8)

        # ✅ Extract and remove fields that are not in the Student model
        courses = validated_data.pop('courses', [])
        completed_courses = validated_data.pop('complete_course', [])

        # ✅ Create the Student instance
        student = Student.objects.create(**validated_data)

        # ✅ Assign ManyToMany courses
        if courses:
            student.courses.set(courses)

        # ✅ If complete_course is provided, update StudentCourse records
        if completed_courses:
            StudentCourse.objects.filter(student=student, course__in=completed_courses).update(status='Completed')


        email = validated_data.get('email')
        if email:
            try:
                # ✅ Ensure `User` is created
                user = User.objects.create_user(
                    username=student.enrollment_no,  # Use provided enrollment_no
                    email=email,
                    password=temp_password
                )
                user.role = 'student'  # Ensure role exists in `User` model
                user.save()

                # ✅ Create an authentication token for the user
                Token.objects.create(user=user)

                # ✅ Send Email
                # send_mail(
                #     subject="Your Temporary Password",
                #     message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
                #     from_email="noreply@yourdomain.com",
                #     recipient_list=[user.email],
                #     fail_silently=False,
                # )

                print(f"✅ User created: {user.username}, Email: {user.email}")

            except Exception as e:
                print(f"❌ Error creating user: {e}")

        return student
    
    def update(self, instance, validated_data):
        """Update an existing student record and handle courses & completed courses."""

        # ✅ Update instance fields
        for attr, value in validated_data.items():
            if attr not in ['courses', 'complete_course']:
                setattr(instance, attr, value)

        # ✅ Update ManyToMany courses
        if 'courses' in validated_data:
            instance.courses.set(validated_data['courses'])

        # ✅ Update completed courses
        if 'complete_course' in validated_data:
            completed_courses = validated_data['complete_course']
            StudentCourse.objects.filter(student=instance, course__in=completed_courses).update(status='Completed')

        # ✅ Save the updated instance
        instance.save()

        return instance

class StudentCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCourse
        fields = ['id', 'student', 'course', 'status', 'certificate_date', 'student_certificate_allotment']
