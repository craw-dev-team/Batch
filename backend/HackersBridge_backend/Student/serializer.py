from rest_framework import serializers
from .models import Student, Installment , StudentCourse, StudentNotes
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from nexus.models import Course
from datetime import date

User = get_user_model()  # ✅ Dynamically fetch the User model

class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = '__all__'



class StudentNoteSerializer(serializers.ModelSerializer):
    create_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentNotes
        fields = ['id', 'note', 'last_update_datetime', 'create_by', 'create_by_name']

    def get_create_by_name(self, obj):
        return obj.create_by.username if obj.create_by else None



# class StudentSerializer(serializers.ModelSerializer):
#     courses = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
#     course_counsellor_name = serializers.SerializerMethodField()
#     support_coordinator_name = serializers.SerializerMethodField()
#     courses_names = serializers.SerializerMethodField()
#     complete_course = serializers.ListField(
#         child=serializers.PrimaryKeyRelatedField(queryset=Course.objects.all()),
#         write_only=True,  # This field is not returned in API responses
#         required=False
#     )
#     complete_course_name = serializers.SerializerMethodField()  # Fixed: Changed to SerializerMethodField
#     complete_course_id = serializers.SerializerMethodField()  # Fixed: Changed to SerializerMethodField

#     class Meta:
#         model = Student
#         fields  =   ['id', 'enrollment_no', 'date_of_joining', 'name', 'email',
#                     'phone', 'address', 'language', 'guardian_name', 'guardian_no',
#                     'courses', 'mode', 'location', 'preferred_week', 'status', 'course_counsellor',
#                     'support_coordinator', 'note', 'dob', 'last_update_user', 'student_assing_by',
#                     'last_update_datetime', 'course_counsellor_name', 'support_coordinator_name',
#                     'courses_names', 'complete_course', 'complete_course_id', 'complete_course_name', 'alternate_phone']

#     def get_course_counsellor_name(self, obj):
#         return obj.course_counsellor.name if obj.course_counsellor else None

#     def get_support_coordinator_name(self, obj):
#         return obj.support_coordinator.name if obj.support_coordinator else None

#     def get_courses_names(self, obj):
#         return [course.name for course in obj.courses.all()]
    
#     def get_complete_course_name(self, obj):
#         """Fetch names of completed courses for the student."""
#         # Fetch StudentCourse records where student has completed the course
#         completed_courses = StudentCourse.objects.filter(student=obj, status='Completed')
#         # Ensure we are accessing the `course` through the relationship
#         return [student_course.course.name for student_course in completed_courses]
    
#     def get_complete_course_id(self, obj):
#         """Fetch names of completed courses for the student."""
#         # Fetch StudentCourse records where student has completed the course
#         completed_courses = StudentCourse.objects.filter(student=obj, status='Completed')
#         # Ensure we are accessing the `course` through the relationship
#         return [student_course.course.id for student_course in completed_courses]


#     def create(self, validated_data):
#         temp_password = get_random_string(length=8)

#         # ✅ Extract and remove fields that are not in the Student model
#         courses = validated_data.pop('courses', [])
#         completed_courses = validated_data.pop('complete_course', [])

#         request_user = self.context['request'].user  # ✅ Get the logged-in user

#         # ✅ Set additional fields before saving
#         validated_data['last_update_user'] = request_user  # User making the request
#         validated_data['student_assing_by'] = request_user if request_user.role == 'coordinator' else None
#         # validated_data['last_update_datetime'] = timezone.now()
        
        
        
        
#         # ✅ Create the Student instance
#         student = Student.objects.create(**validated_data)

#         # ✅ Assign ManyToMany courses
#         if courses:
#             student.courses.set(courses)

#         # ✅ If complete_course is provided, update StudentCourse records
#         if completed_courses:
#             StudentCourse.objects.filter(student=student, course__in=completed_courses).update(status='Completed')


#         email = validated_data.get('email')
#         if email:
#             try:
#                 # ✅ Ensure `User` is created
#                 user = User.objects.create_user(
#                     username=student.enrollment_no,  # Use provided enrollment_no
#                     email=email,
#                     password=temp_password
#                 )
#                 user.role = 'student'  # Ensure role exists in `User` model
#                 user.save()

#                 # ✅ Create an authentication token for the user
#                 Token.objects.create(user=user)

#                 # ✅ Send Email
#                 # send_mail(
#                 #     subject="Your Temporary Password",
#                 #     message=f"Your temporary password is: {temp_password}. Please log in and reset your password.",
#                 #     from_email="noreply@yourdomain.com",
#                 #     recipient_list=[user.email],
#                 #     fail_silently=False,
#                 # )

#                 print(f"✅ User created: {user.username}, Email: {user.email}")

#             except Exception as e:
#                 print(f"❌ Error creating user: {e}")

#         return student




class StudentSerializer(serializers.ModelSerializer):
    courses = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
    course_counsellor_name = serializers.SerializerMethodField()
    support_coordinator_name = serializers.SerializerMethodField()
    courses_names = serializers.SerializerMethodField()

    complete_course = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Course.objects.all()),
        write_only=True,
        required=False
    )
    complete_course_name = serializers.SerializerMethodField()
    complete_course_id = serializers.SerializerMethodField()

    notes = StudentNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'enrollment_no', 'date_of_joining', 'name', 'email',
            'phone', 'alternate_phone', 'address', 'language', 'guardian_name',
            'guardian_no', 'courses', 'mode', 'location', 'preferred_week',
            'status', 'course_counsellor', 'support_coordinator', 'dob',
            'last_update_user', 'student_assing_by', 'last_update_datetime',
            'course_counsellor_name', 'support_coordinator_name', 'courses_names',
            'complete_course', 'complete_course_id', 'complete_course_name',
            'notes'
        ]

    def get_course_counsellor_name(self, obj):
        return obj.course_counsellor.name if obj.course_counsellor else None

    def get_support_coordinator_name(self, obj):
        return obj.support_coordinator.name if obj.support_coordinator else None

    def get_courses_names(self, obj):
        return [course.name for course in obj.courses.all()]

    def get_complete_course_name(self, obj):
        completed_courses = StudentCourse.objects.filter(student=obj, status='Completed')
        return [student_course.course.name for student_course in completed_courses]

    def get_complete_course_id(self, obj):
        completed_courses = StudentCourse.objects.filter(student=obj, status='Completed')
        return [student_course.course.id for student_course in completed_courses]


    def create(self, validated_data):
        temp_password = get_random_string(length=8)

        # ✅ Extract and remove fields that are not in the Student model
        courses = validated_data.pop('courses', [])
        completed_courses = validated_data.pop('complete_course', [])
        note_text = self.context['request'].data.get('note')  # Get note from raw request data
        
        request_user = self.context['request'].user  # ✅ Get the logged-in user

        # ✅ Set additional fields before saving
        validated_data['last_update_user'] = request_user  # Assign logged-in user
        validated_data['student_assing_by'] = request_user  # Assign only if the user is a Coordinator
        # validated_data['last_update_datetime'] = timezone.now()

        # ✅ Create the Student instance
        student = Student.objects.create(**validated_data)

        # ✅ Assign ManyToMany courses
        if courses:
            student.courses.set(courses)

        # ✅ If complete_course is provided, update StudentCourse records
        if completed_courses:
            StudentCourse.objects.filter(student=student, course__in=completed_courses).update(status='Completed')


        # ✅ Save note in StudentNotes table
        if note_text:
            StudentNotes.objects.create(
                student=student,
                note=note_text,
                create_by=request_user
            )

        email = validated_data.get('email')
        if email:
            try:
                # ✅ Ensure `User` is created
                user = User.objects.create_user(
                    username=student.enrollment_no,  # Use provided enrollment_no
                    email=email,
                    password=temp_password,
                    first_name=student.name,
                )
                user.role = 'student'  # Ensure role exists in `User` model
                user.save()

                # ✅ Create an authentication token for the user
                Token.objects.create(user=user)

                print(f"✅ User created: {user.username}, Email: {user.email}")

            except Exception as e:
                print(f"❌ Error creating user: {e}")

        return student
    
    def update(self, instance, validated_data):
        """Update an existing student record and handle courses & completed courses."""

        request_user = self.context['request'].user  # ✅ Get the logged-in user
        instance.last_update_user = request_user  # ✅ Assign last_update_user before saving
        note_text = self.context['request'].data.get('note')  # Get note from raw request data

        # ✅ Update instance fields except 'courses' and 'complete_course'
        for attr, value in validated_data.items():
            if attr not in ['courses', 'complete_course']:
                setattr(instance, attr, value)

        # ✅ Update ManyToMany courses
        if 'courses' in validated_data:
            instance.courses.set(validated_data['courses'])

        # ✅ Update completed courses properly
        if 'complete_course' in validated_data:
            completed_courses = validated_data['complete_course']
            for course in completed_courses:
                StudentCourse.objects.filter(student=instance, course=course).update(status='Completed')


        # ✅ Save note in StudentNotes table
        if note_text:
            StudentNotes.objects.create(
                student=instance,
                note=note_text,
                create_by=request_user
            )


        # ✅ Save the updated instance
        instance.save()

        return instance





class StudentCourseSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    enrollment_no = serializers.CharField(source='student.enrollment_no', read_only=True)

    class Meta:
        model = StudentCourse
        fields = ['id', 'student', 'student_name', 'enrollment_no', 'course', 'status', 'certificate_date', 'student_certificate_allotment', 'gen_time']



# class CertificateSerializer(serializers.Serializer):
#     name = serializers.CharField(max_length=255)
#     course = serializers.CharField(max_length=255)
#     certificate_no = serializers.CharField(max_length=255)
#     date = serializers.DateField(default=date.today)


        