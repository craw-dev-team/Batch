from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Counsellor
from .serializer import CounsellorSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from Student.models import Student
from Student.serializer import StudentSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token

# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

class CounsellorListView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # if request.user.role == 'admin':
        counsellors = Counsellor.objects.all()
        serializer = CounsellorSerializer(counsellors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
        # else:
        #     return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class StudentsUnderCounsellorView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """Fetch all students assigned under a specific counsellor"""
        
        # Ensure only admins and counsellors can access
        # if request.user.role not in ['admin', 'counsellor']:
            # return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Check if the counsellor exists
        try:
            counsellor = Counsellor.objects.get(id=id)
        except Counsellor.DoesNotExist:
            return Response({'error': 'Counsellor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve students assigned under this counsellor
        students = Student.objects.filter(course_counsellor=counsellor)

        # Serialize student data
        serializer = StudentSerializer(students, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)



class CounsellorCreateAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # if request.user.role == 'admin':
        serializer = CounsellorSerializer(data=request.data)
        if serializer.is_valid():
            counsellor = serializer.save()  # This also creates a User
            return Response({"message": "Counsellor created successfully", "counsellor_id": counsellor.counsellor_id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class CounsellorEditAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        # if request.user.role == 'admin':
        try:
            counsellor = Counsellor.objects.get(id=id)
        except Counsellor.DoesNotExist:
            return Response({'detail': 'Counsellor not found'}, status=status.HTTP_404_NOT_FOUND)

        old_email = counsellor.email  # Store old email
        serializer = CounsellorSerializer(counsellor, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            # Update User email if changed
            if old_email != serializer.validated_data.get('email'):
                user = User.objects.get(email=old_email)
                user.email = serializer.validated_data.get('email')
                user.save()

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        # return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class CounsellorDeleteAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def delete(self, request, id):
        # if request.user.role == 'admin':
        try:
            counsellor = Counsellor.objects.get(id=id)
            user = User.objects.get(username=counsellor.counsellor_id)
        except Counsellor.DoesNotExist:
            return Response({'detail': 'Counsellor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Delete the counsellor record
        counsellor.delete()

        # Delete associated token(s)
        Token.objects.filter(user=user).delete()

        # Delete the user account linked to the counsellor
        user.delete()  
        
        return Response({'detail': 'Counsellor, counsellor user, and authentication token deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        
        # return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)



class CousellorInfoAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        # if request.user.role != 'admin':
        #     return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        counsellor = get_object_or_404(Counsellor, id=id)

        Counsellor_Info = {
            'counsellor':CounsellorSerializer(counsellor).data
        } 

        return Response({'Counsellor_Info':Counsellor_Info}, status=status.HTTP_200_OK)

