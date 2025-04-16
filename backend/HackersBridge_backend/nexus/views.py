# from django.shortcuts import render

# # Create your views here.
# from django.http import HttpRequest

# def test(request):
#     return HttpRequest("hello bhai kya haal")


# from Coordinator.models import Coordinator
# from Trainer.models import Trainer
# from Student.models import Student
# from Counsellor.models import Counsellor


# from django.contrib.auth import get_user_model
# User = get_user_model()

# for i in User.objects.all():
#     for j in Coordinator.objects.all():
#         if i.username == j.coordinator_id:
#             print(j.name)
#             i.first_name = j.name
#             i.save()
