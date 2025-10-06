# email_scheduler.py

import schedule
import time
import requests
from datetime import datetime

# ✅ Your Django API endpoint that triggers email logic
API_URL = "http://13.203.183.149:8000/api/batch_scheduled_email/"

HEADERS = {
    "Content-Type": "application/json"
}

# ✅ Email send time(s) you want to schedule
EMAIL_JOBS = [
    {
        "time": "10:00"
    }
]

# ✅ Define the job to be run on schedule
def create_email_job():
    def job():
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] Triggering Batch Ending Email API...")

        try:
            response = requests.get(API_URL, headers=HEADERS)
            print(f"✅ API Response | Status: {response.status_code} | Body: {response.text}")
        except Exception as e:
            print(f"❌ Error while calling API: {e}")
    return job

# ✅ Schedule all defined times
for job in EMAIL_JOBS:
    schedule.every().day.at(job["time"]).do(create_email_job())

# ✅ Keep the scheduler running
print("⏳ Email Scheduler started. Waiting to trigger scheduled jobs...\n")

while True:
    schedule.run_pending()
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking for pending jobs...")
    time.sleep(30)
