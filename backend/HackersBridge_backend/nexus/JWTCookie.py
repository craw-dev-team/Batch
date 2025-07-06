# THIS IS FOR COOKIE...
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class JWTAuthFromCookie(JWTAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('access_token')

        if not token:
            print("No access_token cookie found")
            return None

        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            return user, validated_token
        except Exception as e:
            print("JWT cookie authentication failed:", str(e))
            raise AuthenticationFailed('Invalid or expired token')
