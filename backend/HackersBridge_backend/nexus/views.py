from django.shortcuts import render

# Create your views here.
from django.http import HttpRequest

def test(request):
    return HttpRequest("hello bhai kya haal")