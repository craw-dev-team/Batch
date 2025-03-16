from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .serializer import UserLoginSerializer, UserRegistrationSerializer, FirstTimeResetPasswordSerializer,ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer
from django.core.mail import send_mail

User = get_user_model()

# **User Registration API**
class UserRegistrationAPIView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully. Check your email for a temporary password.',
                'username': user.username,
                'token': Token.objects.get(user=user).key
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# **User Login API**
class UserLoginAPIView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)

            # Redirect to password reset if it's first login
            if serializer.validated_data.get('first_login'):
                return Response({
                    'message': "First login detected. Please reset your password.",
                    'redirect_to': "/reset-password/",
                    'username':user.username,
                    'token': token.key,
                    'role':user.role
                }, status=status.HTTP_307_TEMPORARY_REDIRECT)

            return Response({
                'username': user.username,
                'role': user.role,
                'token': token.key
            }, status=status.HTTP_200_OK)

        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

# ** First_time Reset Password API**
class FirstTimeResetPasswordAPIView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    permission_classes = [IsAuthenticated]  # User must be logged in

    def post(self, request):
        user = request.user  # DRF automatically finds user from Token

        serializer = FirstTimeResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user)

            # Remove old token and generate a new one after password reset
            Token.objects.filter(user=user).delete()
            new_token = Token.objects.create(user=user)

            return Response({
                "message": "Password changed successfully",
                "new_token": new_token.key
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# ** This is for Forgot Password **
class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ** This is for OTP Verification **
class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "OTP verified successfully. Proceed to reset password."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ** This is for Reset Password **
class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class UserLogoutAPIView(APIView):
    """
    API endpoint for user logout.
    - Requires authentication.
    - Deletes the user's token to log them out.
    """
    # authentication_classes = [TokenAuthentication]  # Ensures user must provide a valid token
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)