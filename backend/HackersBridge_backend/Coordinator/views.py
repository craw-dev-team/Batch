from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import *
from .serializer import CoordinatorSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from nexus.serializer import UserRegistrationSerializer
from Student.models import Student
from Student.serializer import StudentSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from nexus.models import Batch


# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your views here.

class CoordinatorListView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # if request.user.role == 'admin':
        coordinators = Coordinator.objects.all()
        serializer = CoordinatorSerializer(coordinators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
        # else:
        #     return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class StudentsUnderCoordinatorView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """Fetch all students assigned under a specific coordinator"""
        
        # Ensure only admins and coordinators can access
        # if request.user.role not in ['admin', 'coordinator']:
        #     return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Check if the coordinator exists
        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'error': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve students assigned under this coordinator
        students = Student.objects.filter(support_coordinator=coordinator)

        # Serialize student data
        serializer = StudentSerializer(students, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class CoordinatorCreateAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # if request.user.role == 'admin':
        serializer = CoordinatorSerializer(data=request.data)
        if serializer.is_valid():
            coordinator = serializer.save()  # This also creates a User
            return Response({"message": "Coordinator created successfully", "coordinator_id": coordinator.coordinator_id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        # return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)




class CoordinatorEditAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        # if request.user.role == 'admin':
        try:
            coordinator = Coordinator.objects.get(id=id)
        except Coordinator.DoesNotExist:
            return Response({'detail': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        old_email = coordinator.email  # Store old email
        serializer = CoordinatorSerializer(coordinator, data=request.data, partial=True)

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

class CoordinatorDeleteAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def delete(self, request, id):
        # if request.user.role == 'admin':
        try:
            coordinator = Coordinator.objects.get(id=id)
            user = User.objects.get(username=coordinator.coordinator_id)
        except Coordinator.DoesNotExist:
            return Response({'detail': 'Coordinator not found'}, status=status.HTTP_404_NOT_FOUND)

        # Delete the coordinator record
        coordinator.delete()

        # Delete associated token(s)
        Token.objects.filter(user=user).delete()
        # Delete the user account linked to the coordinator
        user.delete()
        
        return Response({'detail': 'Coordinator, coordinator user, and authentication token deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        
        # return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class CoordinatorInfoAPIView(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request, id):
        # if request.user.role != 'admin':
        #     return Response({'error':'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        coordinator = get_object_or_404(Coordinator, id=id)

        coordinator_batch_upcomimg = Batch.objects.filter(batch_coordinator=coordinator, status = 'Upcoming')
        coordinator_batch_completed = Batch.objects.filter(batch_coordinator=coordinator, status = 'Completed')
        coordinator_batch_ongoing = Batch.objects.filter(batch_coordinator=coordinator, status='Running')
        coordinator_batch_hold = Batch.objects.filter(batch_coordinator=coordinator, status='Hold')

        Coordinator_Info = {
            'coordinator':CoordinatorSerializer(coordinator).data,
            'coordinator_batch_upcomimg':list(coordinator_batch_upcomimg.values()),
            'coordinator_batch_ongoing':list(coordinator_batch_ongoing.values()),
            'coordinator_batch_completed':list(coordinator_batch_completed.values()),
            'coordinator_batch_hold':list(coordinator_batch_hold.values())
        }


        return Response({'Coordinator_Info':Coordinator_Info}, status=status.HTTP_200_OK)