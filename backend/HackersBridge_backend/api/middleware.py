import datetime
import os

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