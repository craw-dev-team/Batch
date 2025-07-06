from celery import shared_task
from .views_batch import BatchEndingEmail  # or wherever your function is

@shared_task
def send_batch_email_task():
    print("✅ Running batch email function")
    BatchEndingEmail()