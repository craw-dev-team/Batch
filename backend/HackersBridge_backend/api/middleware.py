
from django.utils import timezone
from django.http import JsonResponse
from collections import defaultdict, deque
import datetime
import os
from nexus.models import BlockedIP

class DailyRequestLoggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = self.get_client_ip(request)
        path = request.path
        method = request.method
        timestamp = datetime.datetime.now()
        date_str = timestamp.strftime("%Y-%m-%d")
        time_str = timestamp.strftime("%H:%M:%S")
        
        log_line = f"[{time_str}] {ip} - {method} {path}\n"
        
        log_dir ='logs'
        os.makedirs(log_dir, exist_ok=True)  # ensure logs/ directory exists

        filename = os.path.join(log_dir, f"request_logs_{date_str}.txt")

        with open(filename, "a") as log_file:
            log_file.write(log_line)

        return self.get_response(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0]
        return request.META.get("REMOTE_ADDR")


class IPBlockMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.request_logs = defaultdict(deque)
        self.REQUEST_LIMIT = 500       # Max 100 requests
        self.BLOCK_DURATION = 300      # Block for 5 minutes

    def __call__(self, request):
        ip = self.get_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        now = timezone.now()

        # If IP is blocked, deny access
        blocked = BlockedIP.objects.filter(ip_address=ip, unblock_at__gt=now).first()
        if blocked:
            return JsonResponse({'error': 'Too many requests. You are blocked temporarily.'}, status=429)

        # Track request timestamps per IP
        one_min_ago = now - datetime.timedelta(minutes=1)
        logs = self.request_logs[ip]
        while logs and logs[0] < one_min_ago:
            logs.popleft()
        logs.append(now)

        if len(logs) > self.REQUEST_LIMIT:
            unblock_time = now + datetime.timedelta(seconds=self.BLOCK_DURATION)
            BlockedIP.objects.update_or_create(
                ip_address=ip,
                defaults={"user_agent": user_agent, "unblock_at": unblock_time}
            )
            return JsonResponse({'error': 'Rate limit exceeded. You are blocked temporarily.'}, status=429)

        return self.get_response(request)

    def get_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        return x_forwarded_for.split(",")[0] if x_forwarded_for else request.META.get("REMOTE_ADDR")