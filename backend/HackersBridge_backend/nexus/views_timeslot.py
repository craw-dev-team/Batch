from .models import Timeslot
from .serializer import TimeslotSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from nexus.JWTCookie import JWTAuthFromCookie


# This view provides endpoints to create, retrieve, update, and delete timeslots.


class GetAllTimeslotsAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]


    def get(self, request):

        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        
        timeslots = Timeslot.objects.all()
        serializer = TimeslotSerializer(timeslots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class CreateTimeslotAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TimeslotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class UpdateTimeslotAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):

        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        timeslot = get_object_or_404(Timeslot, id=id)
        serializer = TimeslotSerializer(timeslot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class DeleteTimeslotAPIView(APIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        if request.user.role not in ['admin', 'coordinator']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        timeslot = get_object_or_404(Timeslot, pk=pk)
        timeslot.delete()
        return Response({'message': 'Timeslot deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)