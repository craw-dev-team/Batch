from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.timezone import now
import datetime

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('coordinator', 'Coordinator'),
        ('counsellor', 'Counsellor'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    ]

    email = models.EmailField(unique=True)  # Ensure email is unique
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    first_login = models.BooleanField(default=True)  # Track first login

    REQUIRED_FIELDS = ['email']  # Keep 'username' as the primary identifier

    def __str__(self):
        return self.username




class OTPVerification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return now() > self.created_at + datetime.timedelta(minutes=5)  # Expire in 5 min

    @classmethod
    def delete_expired_otp(cls):
        cls.objects.filter(created_at__lt=now() - datetime.timedelta(minutes=5)).delete()


class Timeslot(models.Model):
    SPECIAL_SLOTS = [
        ('Normal', 'Normal'),
        ('Special', 'Special'),
    ]

    WEEK_TYPES = [
    ('Weekdays', 'Weekdays'),
    ('Weekends', 'Weekends'),
    ('Both', 'Both'),  # New option for covering both weekdays & weekends
    ]

    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    gen_time = models.DateTimeField(default=timezone.now)
    week_type = models.CharField(max_length=10, choices=WEEK_TYPES, default='Weekdays')
    special_time_slot = models.CharField(max_length=20, choices=SPECIAL_SLOTS, null=True, blank=True, default='Normal')

    def __str__(self):
        special_slot = self.special_time_slot if self.special_time_slot else "Regular"
        return f"{self.start_time} - {self.end_time} ({special_slot}, {self.week_type})"


class Course(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    certification_body = models.CharField(max_length=25, null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)
    code = code = models.CharField(max_length=255, null=True, blank=True, unique=True)
    gen_time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name


class Location(models.Model):
    code = models.CharField(max_length=10, unique=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    locality = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.locality


class Book(models.Model):
    book_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=25)
    book_stock = models.IntegerField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    # last_update_coordinator = models.ForeignKey("Coordinator.Coordinator", on_delete=models.CASCADE, related_name='book_update')
    # create_coordinator = models.ForeignKey("Coordinator.Coordinator", on_delete=models.CASCADE, related_name='book_create')
    book_create_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='book_create')
    last_update_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='book_update')
    last_update_datetime = models.DateTimeField(default=timezone.now)
    gen_time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name


class Batch(models.Model):
    MODE_CHOICES = [
        ('Online', 'Online'),
        ('Offline', 'Offline'),
        ('Hybrid', 'Hybrid'),
    ]

    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Hindi', 'Hindi'),
        ('Both', 'Both'),
    ]

    PREFERRED_WEEK_CHOICES = [
        ('Weekdays', 'Weekdays'),
        ('Weekends', 'Weekends'),
        ('Both', 'Both'),
    ]

    STATUS = [
        ('Hold', 'Hold'),
        ('Running', 'Running'),
        ('Upcoming', 'Upcoming'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]

    batch_id = models.CharField(max_length=60, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    trainer = models.ForeignKey("Trainer.Trainer", null=True, blank=True, on_delete=models.CASCADE)
    
    # ✅ Fix Student Model Reference
    student = models.ManyToManyField("Student.Student", through="BatchStudentAssignment", blank=True)

    status = models.CharField(max_length=10, null=True, blank=True, choices=STATUS, default='Upcoming')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, null=False, blank=False)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)
    preferred_week = models.CharField(max_length=10, choices=PREFERRED_WEEK_CHOICES, default='Weekdays')
    batch_time = models.ForeignKey(Timeslot, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL)
    batch_coordinator = models.ForeignKey("Coordinator.Coordinator", on_delete=models.SET_NULL, null=True, blank=True)

    last_update_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='batch_update')
    # last_update_coordinator = models.ForeignKey("Coordinator.Coordinator", on_delete=models.CASCADE, related_name="batches_update", null=True, blank=True)
    batch_created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='batch_create')
    last_update_datetime = models.DateTimeField(default=timezone.now)
    gen_time = models.DateTimeField(default=timezone.now)

    @property
    def student_count(self):
        return self.student.count()

    def __str__(self):
        return f"Batch {self.batch_id} ({self.course.name})"

class BatchStudentAssignment(models.Model):

    student_batch_status = [
        ('In', 'In'),
        ('Out', 'Out'),
    ]
    # ✅ Fix Student ForeignKey Reference
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    student = models.ForeignKey("Student.Student", on_delete=models.CASCADE)
    coordinator = models.ForeignKey("Coordinator.Coordinator", on_delete=models.SET_NULL, null=True, blank=True)
    added_on = models.DateTimeField(auto_now_add=True)
    student_batch_status = models.CharField(max_length=10, null=True, blank=True, choices=student_batch_status, default='In')
    last_update_datetime = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('batch', 'student')

    def __str__(self):
        return f"{self.student.name} added by {self.coordinator.coordinator_id if self.coordinator else 'Unknown'}"



