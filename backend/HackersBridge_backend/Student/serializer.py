from rest_framework import serializers
from .models import Student, Installment , StudentCourse, StudentNotes, BookAllotment, StudentTags, Tags
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from nexus.models import Course, Book, Attendance,Batch
from datetime import date
from functools import lru_cache
from django.utils import timezone
from django.utils.timezone import now
from django.db import transaction
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from rest_framework import serializers
from rest_framework.authtoken.models import Token


User = get_user_model()  # ✅ Dynamically fetch the User model

class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = '__all__'


class StudentNoteSerializer(serializers.ModelSerializer):
    create_by_name = serializers.SerializerMethodField()
    create_at = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentNotes
        fields = [
            'id', 'note', 'status_note', 'last_update_datetime',
            'create_by', 'create_at',
            'student',
            'create_by_name', 'student_name'
        ]
        extra_kwargs = {
            'create_by': {'read_only': True},
            'student': {'read_only': True},  # ✅ Add this
        }

    def get_create_by_name(self, obj):
        return obj.create_by.username if obj.create_by else None

    def get_create_at(self, obj):
        if obj.create_at:
            return obj.create_at.strftime('%Y-%m-%d %H:%M:%S')
        return None

    def get_student_name(self, obj):
        return obj.student.name if obj.student else None

    
{
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




# class StudentSerializer(serializers.ModelSerializer):
#     courses = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
#     course_counsellor_name = serializers.CharField(source='course_counsellor.name', read_only=True)
#     support_coordinator_name = serializers.CharField(source='support_coordinator.name', read_only=True)
#     # courses_names = serializers.ListField(child=serializers.CharField(), read_only=True)
#     courses_names = serializers.SerializerMethodField()
#     complete_course_name = serializers.SerializerMethodField()
#     complete_course_id = serializers.SerializerMethodField()

#     complete_course = serializers.ListField(
#         child=serializers.PrimaryKeyRelatedField(queryset=Course.objects.all()),
#         write_only=True,
#         required=False
#     )

#     notes = StudentNoteSerializer(many=True, read_only=True)

#     class Meta:
#         model = Student
#         fields = [
#             'id', 'enrollment_no', 'date_of_joining', 'name', 'email',
#             'phone', 'alternate_phone', 'address', 'language', 'guardian_name',
#             'guardian_no', 'courses', 'mode', 'location', 'preferred_week',
#             'status', 'course_counsellor', 'support_coordinator', 'dob',
#             'last_update_user', 'student_assing_by', 'last_update_datetime',
#             'course_counsellor_name', 'support_coordinator_name', 'courses_names',
#             'complete_course', 'complete_course_id', 'complete_course_name',
#             'notes'
#         ]

#     # def get_course_counsellor_name(self, obj):
#     #     return getattr(obj.course_counsellor, 'name', None)

#     # def get_support_coordinator_name(self, obj):
#     #     return getattr(obj.support_coordinator, 'name', None)

#     # @lru_cache(maxsize=None)
#     # def get_courses_names(self, obj):
#     #     return list(obj.courses.values_list('name', flat=True))

#     # def get_courses_names(self, obj):
#     #     return list(obj.courses.values_list('name', flat=True))

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)

#         # Add courses_names efficiently from prefetched data
#         rep['courses_names'] = [course.name for course in instance.courses.all()]

#         return rep

#     def get_complete_course_name(self, obj):
#         if hasattr(obj, 'completed_courses'):
#             return [sc.course.name for sc in obj.completed_courses]
#         return []

#     def get_complete_course_id(self, obj):
#         if hasattr(obj, 'completed_courses'):
#             return [sc.course.id for sc in obj.completed_courses]
#         return []
}


class SimpleStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'phone', 'enrollment_no']



{
# class StudentSerializer(serializers.ModelSerializer):
#     courses = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
#     course_counsellor_name = serializers.CharField(source='course_counsellor.name', read_only=True)
#     support_coordinator_name = serializers.CharField(source='support_coordinator.name', read_only=True)

#     complete_course_name = serializers.SerializerMethodField()
#     tags_values = serializers.SerializerMethodField()  # Added for tags names
#     complete_course_id = serializers.SerializerMethodField()

#     complete_course = serializers.ListField(
#         child=serializers.PrimaryKeyRelatedField(queryset=Course.objects.all()),
#         write_only=True,
#         required=False
#     )

#     notes = StudentNoteSerializer(many=True, read_only=True)

#     tags = serializers.PrimaryKeyRelatedField(
#         queryset=Tags.objects.all(),
#         many=True,
#         write_only=True,
#         required=False
#     )


#     class Meta:
#         model = Student
#         fields = [
#             'id', 'enrollment_no', 'date_of_joining', 'name', 'email',
#             'phone', 'alternate_phone', 'address', 'language', 'guardian_name',
#             'guardian_no', 'courses', 'mode', 'location', 'preferred_week',
#             'status', 'course_counsellor', 'support_coordinator', 'dob',
#             'last_update_user', 'student_assing_by', 'last_update_datetime',
#             'course_counsellor_name', 'support_coordinator_name',
#             'complete_course', 'complete_course_id', 'complete_course_name',
#             'notes', 'tags', 'tags_values'
#         ]

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)

#         # Inject fast courses_names here
#         rep['courses_names'] = [course.name for course in instance.courses.all()]

#         return rep

#     def get_complete_course_name(self, obj):
#         completed = StudentCourse.objects.filter(student=obj, status='Completed').select_related('course')
#         return [sc.course.name for sc in completed]
    
#     def get_tags_values(self, obj):
#         """Fetch Values of tags associated with the student."""
#         tags = StudentTags.objects.filter(student=obj).select_related('tag')
#         return [{
#                 'id': tag.tag.id,
#                 'tag_name' :tag.tag.tag_name ,
#                 'tag_color': tag.tag.tag_color
#                 } for tag in tags]

#     def get_complete_course_id(self, obj):
#         completed = StudentCourse.objects.filter(student=obj, status='Completed').select_related('course')
#         return [sc.course.id for sc in completed]
    
#     def create(self, validated_data):
#         temp_password = get_random_string(length=8)

#         # ✅ Extract and remove fields that are not in the Student model
#         courses = validated_data.pop('courses', [])
#         completed_courses = validated_data.pop('complete_course', [])
#         note_text = self.context['request'].data.get('note')  # Get note from raw request data
        
#         request_user = self.context['request'].user  # ✅ Get the logged-in user

#         # ✅ Set additional fields before saving
#         validated_data['last_update_user'] = request_user  # Assign logged-in user
#         validated_data['student_assing_by'] = request_user  # Assign only if the user is a Coordinator
#         # validated_data['last_update_datetime'] = timezone.now()

#         # ✅ Create the Student instance
#         student = Student.objects.create(**validated_data)

#         # ✅ Assign ManyToMany courses
#         if courses:
#             student.courses.set(courses)

#         # ✅ If complete_course is provided, update StudentCourse records
#         if completed_courses:
#             StudentCourse.objects.filter(student=student, course__in=completed_courses).update(status='Completed')


#         # ✅ Save note in StudentNotes table
#         if note_text:
#             StudentNotes.objects.create(
#                 student=student,
#                 note=note_text,
#                 create_by=request_user
#             )

#         email = validated_data.get('email')
#         if email:
#             try:
#                 # ✅ Ensure `User` is created
#                 user = User.objects.create_user(
#                     username=student.enrollment_no,  # Use provided enrollment_no
#                     email=email,
#                     password=temp_password,
#                     first_name=student.name,
#                 )
#                 user.role = 'student'  # Ensure role exists in `User` model
#                 user.save()

#                 # ✅ Create an authentication token for the user
#                 Token.objects.create(user=user)

#                 print(f"✅ User created: {user.username}, Email: {user.email}")

#             except Exception as e:
#                 print(f"❌ Error creating user: {e}")

#         return student
    
#     def update(self, instance, validated_data):
#         """Update an existing student record and handle courses & completed courses."""

#         request_user = self.context['request'].user  # ✅ Get the logged-in user
#         instance.last_update_user = request_user  # ✅ Assign last_update_user before saving
#         note_text = self.context['request'].data.get('note')  # Get note from raw request data

#         # ✅ Update instance fields except 'courses' and 'complete_course'
#         for attr, value in validated_data.items():
#             if attr not in ['courses', 'complete_course']:
#                 setattr(instance, attr, value)

#         # ✅ Update ManyToMany courses
#         if 'courses' in validated_data:
#             instance.courses.set(validated_data['courses'])

#         # ✅ Handle complete_course logic
#         if 'complete_course' in validated_data:
#             new_completed_courses = set(validated_data['complete_course'])

#             # Fetch current completed course entries
#             current_completed_courses = set(
#                 StudentCourse.objects.filter(student=instance, status='Completed').values_list('course', flat=True)
#             )

#             # Determine removed courses (were completed, now not)
#             removed_courses = current_completed_courses - set(course.id for course in new_completed_courses)

#             # ✅ Set status to 'Completed' for newly added completed courses
#             StudentCourse.objects.filter(student=instance, course__in=new_completed_courses).update(status='Completed')

#             # ✅ Set status to 'Not Started' for removed courses
#             if removed_courses:
#                 StudentCourse.objects.filter(student=instance, course__in=removed_courses).update(status='Not Started')

#         # ✅ Save student note
#         if note_text:
#             StudentNotes.objects.create(
#                 student=instance,
#                 note=note_text,
#                 create_by=request_user
#             )

#         instance.save()
#         return instance
}

class StudentSerializer(serializers.ModelSerializer):
    courses = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), many=True)
    course_counsellor_name = serializers.CharField(source='course_counsellor.name', read_only=True)
    support_coordinator_name = serializers.CharField(source='support_coordinator.name', read_only=True)
    attendence_summary = serializers.SerializerMethodField()
    complete_course_name = serializers.SerializerMethodField()
    tags_values = serializers.SerializerMethodField()
    complete_course_id = serializers.SerializerMethodField()

    complete_course = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Course.objects.all()),
        write_only=True,
        required=False
    )
    notes = StudentNoteSerializer(many=True, read_only=True)
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tags.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Student
        fields = [
            'id', 'enrollment_no', 'date_of_joining', 'name', 'email',
            'phone', 'alternate_phone', 'address', 'language', 'guardian_name',
            'guardian_no', 'courses', 'mode', 'location', 'preferred_week',
            'status', 'course_counsellor', 'support_coordinator', 'dob',
            'last_update_user', 'student_assing_by', 'last_update_datetime',
            'course_counsellor_name', 'support_coordinator_name',
            'complete_course', 'complete_course_id', 'complete_course_name',
            'notes', 'tags', 'tags_values', 'attendence_summary'
        ]

    def get_attendence_summary(self, obj):
        batches = Batch.objects.filter(student=obj).order_by('-id')
        if not batches.exists():
            return {"message": "No batch assigned to this student."}
        summary_list = []
        for batch in batches:
            attendance_qs = Attendance.objects.filter(student=obj, batch=batch).order_by('date')
            present_count = attendance_qs.filter(attendance='Present').count()
            absent_count = attendance_qs.filter(attendance='Absent').count()
            total = attendance_qs.exclude(attendance='Not Marked').count()
            latest_attendance = attendance_qs.order_by('-date', '-id').first()
            attendance_history = [
                {
                    "date": attendance.date,
                    "status": attendance.attendance
                }
                for attendance in attendance_qs
            ]
            summary_list.append({
                "batch_id": batch.id,
                "present": present_count,
                "absent": absent_count,
                "total_no_attendence": total,
                "present_percent": f"{(present_count / total * 100):.1f}%" if total > 0 else "0%",
                "absent_percent": f"{(absent_count / total * 100):.1f}%" if total > 0 else "0%",
                "latest_status": latest_attendance.attendance if latest_attendance else "Not Marked",
                "latest_date": latest_attendance.date if latest_attendance else None,
                "attendance_history": attendance_history
            })
        return {
            "student_id": obj.id,
            "name": obj.name,
            "batch_wise_attendance": summary_list
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['courses_names'] = [course.name for course in instance.courses.all()]
        return rep

    def get_complete_course_name(self, obj):
        completed = StudentCourse.objects.filter(student=obj, status='Completed').select_related('course')
        return [sc.course.name for sc in completed]

    def get_tags_values(self, obj):
        tags = StudentTags.objects.filter(student=obj).select_related('tag')
        return [{
            'id': tag.tag.id,
            'tag_name': tag.tag.tag_name,
            'tag_color': tag.tag.tag_color
        } for tag in tags]

    def get_complete_course_id(self, obj):
        completed = StudentCourse.objects.filter(student=obj, status='Completed').select_related('course')
        return [sc.course.id for sc in completed]

    def create(self, validated_data):
        temp_password = get_random_string(length=8)
        courses = validated_data.pop('courses', [])
        completed_courses = validated_data.pop('complete_course', [])
        note_text = self.context['request'].data.get('note')
        status_note_text = self.context['request'].data.get('status_note')
        tags = validated_data.pop('tags', [])
        request_user = self.context['request'].user

        validated_data['last_update_user'] = request_user
        validated_data['student_assing_by'] = request_user

        with transaction.atomic():
            student = Student.objects.create(**validated_data)
            if courses:
                student.courses.set(courses)
            if tags:
                valid_tags = Tags.objects.filter(id__in=[tag.id for tag in tags])
                for tag in valid_tags:
                    StudentTags.objects.create(student=student, tag=tag, created_at=now(), updated_at=now())
            if completed_courses:
                StudentCourse.objects.filter(student=student, course__in=completed_courses).update(status='Completed')
            if note_text or status_note_text:
                StudentNotes.objects.create(
                    student=student,
                    note=note_text if note_text else None,
                    status_note=status_note_text if status_note_text else None,
                    create_by=request_user
                )
            email = validated_data.get('email')
            if email:
                try:
                    if User.objects.filter(email=email).exists():
                        raise serializers.ValidationError({'email': 'This email is already taken by another user.'})
                    user = User.objects.create_user(
                        username=student.enrollment_no,
                        email=email,
                        password=temp_password,
                        first_name=student.name,
                    )
                    user.role = 'student'
                    user.save()
                    Token.objects.create(user=user)
                except Exception as e:
                    raise serializers.ValidationError({'user': str(e)})
            return student

    def update(self, instance, validated_data):
        request_user = self.context['request'].user
        instance.last_update_user = request_user
        note_text = self.context['request'].data.get('note')
        status_note_text = self.context['request'].data.get('status_note')
        old_email = instance.email
        new_email = validated_data.get('email', old_email)

        # Update fields except special relations
        for attr, value in validated_data.items():
            if attr not in ['courses', 'complete_course', 'tags']:
                setattr(instance, attr, value)

        # Handle ManyToMany (courses via through)
        if 'courses' in validated_data:
            instance.courses.set(validated_data['courses'])

        # Handle complete_course via StudentCourse
        if 'complete_course' in validated_data:
            new_completed_courses = set(validated_data['complete_course'])
            current_completed_courses = set(
                StudentCourse.objects.filter(student=instance, status='Completed')
                .values_list('course', flat=True)
            )
            removed_courses = current_completed_courses - {course.id for course in new_completed_courses}
            StudentCourse.objects.filter(student=instance, course__in=new_completed_courses).update(status='Completed')
            if removed_courses:
                StudentCourse.objects.filter(student=instance, course__in=removed_courses).update(status='Not Started')

        # Handle tags via StudentTags through model
        if 'tags' in validated_data:
            StudentTags.objects.filter(student=instance).delete()
            for tag in validated_data['tags']:
                StudentTags.objects.create(student=instance, tag=tag, created_at=now(), updated_at=now())

        # Handle notes
        if note_text or status_note_text:
            StudentNotes.objects.create(
                student=instance,
                note=note_text if note_text else None,
                status_note=status_note_text if status_note_text else None,
                create_by=request_user
            )

        with transaction.atomic():
            instance.save()
            if old_email != new_email and new_email:
                u = User.objects.filter(username=instance.enrollment_no).first() or \
                    User.objects.filter(email=old_email).first()
                if u:
                    if User.objects.filter(email=new_email).exclude(pk=u.pk).exists():
                        raise serializers.ValidationError({'email': 'This email is already taken by another user.'})
                    u.email = new_email.strip().lower()
                    u.save()
        return instance




class StudentCourseSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    enrollment_no = serializers.CharField(source='student.enrollment_no', read_only=True)

    class Meta:
        model = StudentCourse
        fields = ['id', 'student', 'student_name', 'enrollment_no', 'course', 'status', 'certificate_date', 'certificate_issued_at', 'student_certificate_allotment']

        read_only_fields = ['certificate_issued_at']  # ✅ Prevent manual edits




# class CertificateSerializer(serializers.Serializer):
#     name = serializers.CharField(max_length=255)
#     course = serializers.CharField(max_length=255)
#     certificate_no = serializers.CharField(max_length=255)
#     date = serializers.DateField(default=date.today)



class StudentBookAllotmentSerializer(serializers.ModelSerializer):
    Book = serializers.BooleanField()

    class Meta:
        model = StudentCourse
        fields = ['Book']

    def validate(self, attrs):
        book_flag = attrs.get('Book')
        student_course = self.context['student_course']
        student = student_course.student
        course = student_course.course
        old_book_issued = self.context['old_book_status']

        if book_flag:
            books = Book.objects.filter(course=course, status='Available', stock__gt=0)
            if not books.exists():
                raise serializers.ValidationError({'book': 'No available books for this course.'})
            attrs['books'] = books
        else:
            allotments = BookAllotment.objects.filter(student=student, book__course=course)
            if allotments.exists():
                attrs['allotments'] = allotments

        return attrs

    def save(self, **kwargs):
        student_course = self.context['student_course']
        student = student_course.student
        user = self.context['request'].user
        book_flag = self.validated_data['Book']
        old_book_issued = self.context['old_book_status']

        if book_flag:
            books = self.validated_data['books']
            book_allotment = BookAllotment.objects.create(allot_by=user)
            book_allotment.book.set(books)
            book_allotment.student.add(student)

            # ✅ Always update this flag
            student_course.student_book_allotment = True
            student_course.save(update_fields=['student_book_allotment'])

            # ✅ If it's NOT old allotment → reduce stock
            if not old_book_issued:
                for book in books:
                    book.stock -= 1
                    if book.stock <= 0:
                        book.status = 'Not'
                    book.save(update_fields=['stock', 'status'])

            return book_allotment

        else:
            # Handle book removal
            allotments = self.validated_data.get('allotments', [])
            removed_books = []
            removed_book_objs = []

            for allot in allotments:
                books_in_allot = list(allot.book.all())
                removed_books.extend([book.name for book in books_in_allot])
                removed_book_objs.extend(books_in_allot)
                allot.delete()

            # Update student course allotment flag
            student_course.student_book_allotment = False
            student_course.save(update_fields=['student_book_allotment'])

            # ✅ If it's NOT old allotment → restore stock
            if not old_book_issued:
                for book in removed_book_objs:
                    book.stock += 1
                    if book.stock > 0:
                        book.status = 'Available'
                    book.save(update_fields=['stock', 'status'])

            return {'removed_books': removed_books}

{

# class StudentBookAllotmentSerialssizer(serializers.ModelSerializer):
#     Book = serializers.BooleanField()

#     class Meta:
#         model = StudentCourse
#         fields = ['Book']

#     def validate(self, attrs):
#         book_flag = attrs.get('Book')
#         student_course = self.context['student_course']
#         student = student_course.student
#         course = student_course.course

#         if book_flag:
#             # ✅ Allot book(s)
#             books = Book.objects.filter(course=course, status='Available', stock__gt=0)
#             if not books.exists():
#                 raise serializers.ValidationError({'book': 'No available books for this course.'})
#             attrs['books'] = books
#         else:
#             # ✅ Remove book(s) for this course only
#             allotments = BookAllotment.objects.filter(student=student, book__course=course)
#             if not allotments.exists():
#                 return attrs
#             attrs['allotments'] = allotments

#         return attrs

#     def save(self, **kwargs):
#         student_course = self.context['student_course']
#         student = student_course.student
#         user = self.context['request'].user
#         book_flag = self.validated_data['Book']

#         if book_flag:
#             books = self.validated_data['books']
#             book_allotment = BookAllotment.objects.create(allot_by=user)
#             book_allotment.book.set(books)
#             book_allotment.student.add(student)

#             # Decrease stock and update status
#             for book in books:
#                 book.stock -= 1
#                 if book.stock <= 0:
#                     book.status = 'Not'
#                 book.save(update_fields=['stock', 'status'])

#             student_course.student_book_allotment = True
#             student_course.save(update_fields=['student_book_allotment'])

#             return book_allotment

#         else:
#             # Remove only books from this course
#             allotments = self.validated_data.get('allotments', [])
#             removed_books = []

#             for allotment in allotments:
#                 if student in allotment.student.all():
#                     books = allotment.book.filter(course=student_course.course)
#                     for book in books:
#                         book.stock += 1
#                         book.status = 'Available'
#                         book.save(update_fields=['stock', 'status'])
#                         removed_books.append(book.name)
#                     allotment.book.remove(*books)
#                     if allotment.book.count() == 0:
#                         allotment.delete()
#                     else:
#                         allotment.student.remove(student)

#             student_course.student_book_allotment = False
#             student_course.save(update_fields=['student_book_allotment'])

#             return {'removed_books': removed_books}

}


class TagsSerializer(serializers.ModelSerializer):
    students = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    created_by = serializers.CharField(source='created_by.username', read_only=True)
    updated_by = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = Tags
        fields = [
            'id', 'tag_name', 'tag_description', 'tag_color',
            'created_at', 'updated_at',
            'created_by', 'updated_by',
            'students'
        ]

    def create(self, validated_data):
        students = validated_data.pop('students', [])
        print("📦 Received students:", students)

        tag = Tags.objects.create(**validated_data)
        print("✅ Created tag:", tag.tag_name)

        for student in students:
            print("➡️ Creating mapping for student:", student.id)
            StudentTags.objects.create(student=student, tag=tag, created_at=now(), updated_at=now())  # ✅ move inside loop

        return tag

    def update(self, instance, validated_data):
        students = validated_data.pop('students', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if students is not None:
            instance.tagged_students.all().delete()
            for student in students:
                StudentTags.objects.create(student=student, tag=instance, updated_at=now())

        return instance

