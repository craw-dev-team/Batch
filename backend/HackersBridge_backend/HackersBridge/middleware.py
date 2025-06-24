# HackersBridge/middleware.py
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT token.
    Token is expected in the query string as ?token=<JWT>
    """
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope.get("query_string", b"").decode())
        token = query_string.get("token", [None])[0]

        if token:
            scope['user'] = await self.get_user(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except (InvalidToken, TokenError, Exception):
            return AnonymousUser()
