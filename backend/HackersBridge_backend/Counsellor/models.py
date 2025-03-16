from django.db import models
import uuid

class Counsellor(models.Model):
    WEEKOFF = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    STATUS = [
        ('Active','Active'),
        ('Inactive','Inactive')
    ]

    counsellor_id = models.CharField(max_length=10, unique=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True)
    phone = models.CharField(max_length=15, unique=True)
    location = models.ForeignKey("nexus.Location", null=True, blank=True, on_delete=models.SET_NULL)
    weekoff = models.CharField(max_length=15, null=True, blank=True, choices=WEEKOFF)
    status = models.CharField(max_length=10, null=True, blank=True, choices=STATUS, default='Active')
    
    def save(self, *args, **kwargs):
        if not self.counsellor_id:
            self.counsellor_id = str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
