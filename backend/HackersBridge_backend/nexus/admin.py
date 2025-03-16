from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Timeslot)
admin.site.register(Course)
admin.site.register(Location)
admin.site.register(Book)
admin.site.register(Batch)
admin.site.register(BatchStudentAssignment)
