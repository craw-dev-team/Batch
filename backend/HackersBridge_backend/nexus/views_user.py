import json
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .serializer import UserLoginSerializer, UserRegistrationSerializer, FirstTimeResetPasswordSerializer,ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer
from django.core.mail import send_mail
from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.utils.timezone import now
from django.utils.dateparse import parse_date
from Student.models import Student
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
User = get_user_model()


# **User Registration API**
class UserRegistrationAPIView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # ✅ Create log entry for registration
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(user.__class__),
                cid=str(uuid.uuid4()),
                object_pk=user.id,
                object_id=user.id,
                object_repr=f"User: {user.username}",
                action=LogEntry.Action.CREATE,
                changes=f"New user registered with username: {user.username}",
                serialized_data=json.dumps({
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }, default=str),
                changes_text=f"User '{user.username}' registered via API.",
                additional_data="User Registration",
                actor=user,  # The user themselves registered
                timestamp=now()
            )

            return Response({
                'message': 'User registered successfully. Check your email for a temporary password.',
                'username': user.username,
                'token': Token.objects.get(user=user).key
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


# # **User Login API**
# class UserLoginAPIView(APIView):
#     def post(self, request):
#         serializer = UserLoginSerializer(data=request.data)

#         if serializer.is_valid():
#             user = serializer.validated_data['user']
#             token, created = Token.objects.get_or_create(user=user)

            
#             # ✅ Log user login
#             LogEntry.objects.create(
#                 content_type=ContentType.objects.get_for_model(user.__class__),
#                 cid=str(uuid.uuid4()),
#                 object_pk=user.id,
#                 object_id=user.id,
#                 object_repr=f"User: {user.username}",
#                 action=LogEntry.Action.CREATE,  # Use appropriate action for login
#                 changes=f"User {user.username} logged in.",
#                 serialized_data=json.dumps({
#                     'username': user.username,
#                     'email': user.email,
#                     'role': user.role
#                 }, default=str),
#                 changes_text=f"User '{user.username}' logged in via API.",
#                 additional_data="User Login",
#                 actor=user,
#                 timestamp=now()
#             )
            
            
            
#             # Redirect to password reset if it's first login
#             if serializer.validated_data.get('first_login'):
#                 return Response({
#                     'message': "First login detected. Please reset your password.",
#                     'redirect_to': "/reset-password/",
#                     'username':user.username,
#                     'token': token.key,
#                     'role':user.role
#                 }, status=status.HTTP_307_TEMPORARY_REDIRECT)

#             return Response({
#                 'username': user.username,
#                 'role': user.role,
#                 'token': token.key
#             }, status=status.HTTP_200_OK)

#         return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



class UserLoginAPIView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            role = user.role
            username = user.username
            useremail = user.email
            first_name = user.first_name

            if role == 'student':
                student_id = Student.objects.filter(Q(enrollment_no = username) | Q(email = useremail)).values('id', 'enrollment_no', 'name')
                user_info = {'role': role,
                            'token':access_token,
                            'user_name':username,
                            'first_name':first_name}

                response = Response({'message': 'Login successful',
                                    'student_id': student_id,
                                    'user_info':user_info}, status=status.HTTP_200_OK)

                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=False,
                    samesite='None'  # Required for cross-site cookies
                )

                response.set_cookie(
                    key='user_role',
                    value=role,
                    httponly=False,
                    secure=False,
                    samesite='None'
                )

                return response
            else:
                user_info = {'role':role,
                             'token':access_token,
                             'user_name':username,
                             'first_name':first_name}
                response = Response({'message':'Login successful',
                                     'user_info':user_info}, status=status.HTTP_200_OK)
                
                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True
                )

                response.set_cookie(
                    key='user_role',
                    value=role,
                    httponly=False
                )

                return response
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

















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
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

            # ✅ Log the forgot password request
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(User),
                cid=str(uuid.uuid4()),
                object_pk=user.id,
                object_id=user.id,
                object_repr=f"User: {user.username}",
                action=LogEntry.Action.UPDATE,  # Ensure this action exists in your LogEntry model
                changes=f"Password reset OTP sent to {user.email}.",
                serialized_data=json.dumps({
                    'username': user.username,
                    'email': user.email,
                }, default=str),
                changes_text=f"Password reset initiated for user '{user.username}'.",
                additional_data="Forgot Password Request",
                actor=user,
                timestamp=now()
            )

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
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user  # ✅ Get the logged-in user

            # ✅ Delete the user's token (logout)
            user.auth_token.delete()

            # ✅ Log the logout event
            LogEntry.objects.create(
                content_type=ContentType.objects.get_for_model(User),
                cid=str(uuid.uuid4()),
                object_pk=user.id,
                object_id=user.id,
                object_repr=f"User: {user.username}",
                action=LogEntry.Action.LOGOUT,  # Make sure LOGOUT exists in your LogEntry actions
                changes=f"User {user.username} logged out.",
                serialized_data=json.dumps({
                    'username': user.username,
                    'email': user.email,
                }, default=str),
                changes_text=f"User '{user.username}' logged out via API.",
                additional_data="User Logout",
                actor=user,
                timestamp=now()
            )

            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)