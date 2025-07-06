# # HackersBridge/middleware.py
# from urllib.parse import parse_qs
# from django.contrib.auth.models import AnonymousUser
# from channels.middleware import BaseMiddleware
# from channels.db import database_sync_to_async
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# class JWTAuthMiddleware(BaseMiddleware):
#     """
#     Custom middleware to authenticate WebSocket connections using JWT token.
#     Token is expected in the query string as ?token=<JWT>
#     """
#     async def __call__(self, scope, receive, send):
#         query_string = parse_qs(scope.get("query_string", b"").decode())
#         token = query_string.get("token", [None])[0]

#         if token:
#             scope['user'] = await self.get_user(token)
#         else:
#             scope['user'] = AnonymousUser()

#         return await super().__call__(scope, receive, send)

#     @database_sync_to_async
#     def get_user(self, token):
#         jwt_auth = JWTAuthentication()
#         try:
#             validated_token = jwt_auth.get_validated_token(token)
#             user = jwt_auth.get_user(validated_token)
#             return user
#         except (InvalidToken, TokenError, Exception):
#             return AnonymousUser()



from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT from cookies.
    Expects 'access_token' cookie to be set (HttpOnly is fine).
    """
    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode()
        cookies = self.parse_cookies(cookie_header)

        token = cookies.get("access_token")
        if token:
            scope["user"] = await self.get_user(token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    def parse_cookies(self, cookie_str):
        cookies = {}
        for item in cookie_str.split(";"):
            if "=" in item:
                key, value = item.split("=", 1)
                cookies[key.strip()] = value.strip()
        return cookies

    @database_sync_to_async
    def get_user(self, token):
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except (InvalidToken, TokenError, Exception):
            return AnonymousUser()