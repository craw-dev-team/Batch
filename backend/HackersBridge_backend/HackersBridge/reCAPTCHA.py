import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError

def verify_recaptcha(token):
    url = 'https://www.google.com/recaptcha/api/siteverify'
    data = {
        'secret': settings.RECAPTCHA_SECRET_KEY,
        'response': token,
    }
    response = requests.post(url, data=data)
    result = response.json()

    if not result.get('success'):
        raise ValidationError("Invalid reCAPTCHA. Please try again.")
    