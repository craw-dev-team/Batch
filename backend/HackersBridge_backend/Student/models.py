from django.db import models
from django.utils import timezone
import datetime
# from Coordinator.models import Coordinator
# from nexus.models import 
# from Counsellor.models import *
# from Trainer.models import *

class Student(models.Model):
    PREFERRED_LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Hindi', 'Hindi'),
        ('Both','Both'),
    ]
    PREFERRED_WEEK_CHOICES = [
        ('Weekdays', 'Weekdays'),
        ('Weekends', 'Weekends'),
        ("Both", "Both"),
    ]
    PREFERRED_MODE_CHOICES = [
        ('Online', 'Online'),
        ('Offline', 'Offline'),
        ('Hybrid', 'Hybrid')
    ]
    STATUS = [
        ('Active','Active'),
        ('Inactive','Inactive'),
        ('Temp Block','Temp Block'),
        ('Restricted','Restricted'),
    ]

    # student_id = models.CharField(max_length=15, unique=True)
    enrollment_no = models.CharField(max_length=100, unique=True)
    date_of_joining = models.DateField(default=timezone.now)
    name = models.CharField(max_length=100, db_index=True)
    email = models.EmailField(max_length=100, unique=True, db_index=True)
    phone = models.CharField(max_length=20, unique=True, db_index=True)
    alternate_phone = models.CharField(max_length=20, null=True,  blank=True, db_index=True)
    address = models.TextField(null=True, blank=True)
    language = models.CharField(max_length=10, choices=PREFERRED_LANGUAGE_CHOICES)
    guardian_name = models.CharField(max_length=100, null=True, blank=True)
    guardian_no = models.CharField(max_length=15, null=True, blank=True, db_index=True)
    courses  = models.ManyToManyField("nexus.Course", through='StudentCourse') # ✅ Through Model
    mode = models.CharField(max_length=10, choices=PREFERRED_MODE_CHOICES)
    location = models.ForeignKey("nexus.Location", null=True, blank=True, default=None, on_delete=models.SET_NULL)
    preferred_week = models.CharField(max_length=10, choices=PREFERRED_WEEK_CHOICES)
    status = models.CharField(max_length=25, null=True, blank=True, choices=STATUS, default='Active')
    course_counsellor = models.ForeignKey("Counsellor.Counsellor", on_delete=models.SET_NULL, null=True, db_index=True)
    support_coordinator = models.ForeignKey("Coordinator.Coordinator", null=True, blank=True, on_delete=models.SET_NULL, db_index=True)
    profile_picture = models.ImageField(upload_to='student/profile_pics/', null=True, blank=True)  # Stores image path
    dob = models.DateField(null=True, blank=True)
    last_update_user = models.ForeignKey("nexus.CustomUser", on_delete=models.SET_NULL, null=True, blank=True, related_name='student_update')
    # last_update_coordinated = models.ForeignKey("Coordinator.Coordinator", on_delete=models.CASCADE, related_name='student_update', null=True, blank=True)
    student_assing_by = models.ForeignKey("nexus.CustomUser", on_delete=models.SET_NULL, related_name='student_assing',null=True, blank=True)
    last_update_datetime = models.DateTimeField(default=timezone.now)
    gen_time = models.DateTimeField(default=timezone.now)
    installment = models.OneToOneField('Installment', on_delete=models.CASCADE, null=True, blank=True, related_name='installment')
    re_permission = models.BooleanField(default=True, null=True, blank=True)
    # note = models.TextField(max_length=200, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.enrollment_no:
            self.enrollment_no = self.generate_enrollment_no()

        if isinstance(self.date_of_joining, str):  
            try:
                self.date_of_joining = datetime.datetime.strptime(self.date_of_joining, "%d/%m/%Y").date()
            except ValueError:
                raise ValueError("Invalid date format. Expected DD/MM/YYYY")
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name + '-' + self.enrollment_no




class Installment(models.Model):
    MODES = [
        ('cash','cash'),
        ('online','online')
    ]

    total_fee = models.FloatField(null=True, blank=True)
    down_payment = models.FloatField(null=True, blank=True)
    pay_date = models.DateField(null=True)

    emi_day = models.IntegerField(null=True, blank=True)
    total_emi_amount = models.FloatField(null=True, blank=True)
    emi_amount = models.FloatField(null=True, blank=True)
    one_time = models.BooleanField(default=False)

    transition_id = models.CharField(max_length=100, null=True, blank=True)
    pay_mode = models.CharField(max_length=50, choices=MODES, null=True, blank=True)
    paid_fees = models.FloatField(null=True, blank=True)
    due_fees = models.FloatField(null=True, blank=True)
    
    total_ins = models.IntegerField(null=True, blank=True)
    ins_paid = models.IntegerField(null=True, blank=True)
    ins_rem = models.IntegerField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    # student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='student')


class FeesRecords(models.Model):
    MODES = [
        ('cash','cash'),
        ('online','online')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    installments = models.ForeignKey(Installment, on_delete=models.CASCADE)
    counsellor = models.ForeignKey('Counsellor.Counsellor', on_delete=models.SET_NULL, null=True)
    payment_date = models.DateField(null=True, blank=True)
    payment = models.FloatField(null=True, blank=True)
    pay_mode = models.CharField(max_length=10, choices=MODES, null=True, blank=True)
    transition_id = models.CharField(max_length=100, null=True, blank=True)


class StudentCourse(models.Model):  # ✅ Through Model
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('Ongoing', 'Ongoing'),
        ('Upcoming', 'Upcoming'),
        ('Completed', 'Completed'),
        ('Denied', 'Denied'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, db_index=True)
    course = models.ForeignKey("nexus.Course", on_delete=models.CASCADE, db_index=True)
    marks = models.IntegerField(null=True, blank=True)
    marks_update_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Not Started')
    certificate_date = models.DateField(null=True, blank=True)
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    student_certificate_allotment = models.BooleanField(null=True, blank=True, default=False)
    student_book_allotment = models.BooleanField(null=True, blank=True, default=False)
    student_old_book_allotment = models.BooleanField(null=True, blank=True, default=False)
    student_exam_date = models.DateField(null=True, blank=True)
    # create_by = models.CharField(max_length=100, null=True, blank=True) 
 
    class Meta:
        unique_together = ('student', 'course')



class StudentNotes(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="notes")
    note = models.TextField(null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True, null=True)
    last_update_datetime = models.DateTimeField(default=timezone.now)
    create_by = models.ForeignKey("nexus.CustomUser", on_delete=models.SET_NULL, related_name='student_note', null=True, blank=True)

    def save(self, *args, **kwargs):
        self.last_update_datetime = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Note for {self.student.name}"
    


class BookAllotment(models.Model):
    book = models.ManyToManyField("nexus.Book")
    student = models.ManyToManyField(Student)
    allot_by = models.ForeignKey("nexus.CustomUser", on_delete=models.CASCADE)
    allotment_datetime = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.book + self.student}"
    

# class StudentEmails(models.Model):


class Tags(models.Model):
    tag_name = models.CharField(max_length=100, unique=True)
    tag_description = models.TextField(null=True, blank=True)
    tag_color = models.CharField(max_length=20, null=True, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey("nexus.CustomUser", on_delete=models.SET_NULL, null=True, blank=True, related_name='tag_created_by')
    updated_by = models.ForeignKey("nexus.CustomUser", on_delete=models.SET_NULL, null=True, blank=True, related_name='tag_updated_by')

    def __str__(self):
        return self.tag_name


class StudentTags(models.Model):
    student = models.ForeignKey( Student, on_delete=models.CASCADE, related_name='tag_mappings')
    tag = models.ForeignKey( Tags, on_delete=models.CASCADE, related_name='tagged_students') 
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True , null=True, blank=True)

    class Meta:
        unique_together = ('student', 'tag')

    def __str__(self):
        return f"{self.student.name} - {self.tag.tag_name}"