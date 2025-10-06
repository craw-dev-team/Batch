
from django.db.models.signals import post_save,m2m_changed
from django.dispatch import receiver
from .models import Attendance,Batch
from .utils import send_attendance_email,send_student_removal_email
from Student.models import Student

@receiver(post_save, sender=Attendance)
def attendance_post_save(sender, instance, created, **kwargs):
    if not created:   # Only on update, not create
        send_attendance_email(instance)


@receiver(m2m_changed, sender=Batch.student.through)
def batch_student_m2m_changed(sender, instance, action, pk_set, **kwargs):
    from nexus.utils import send_student_removal_email
    import logging
    logger = logging.getLogger('django')

    if action == "post_remove":
        logger.info(f"[Signal] post_remove triggered for batch {instance.batch_id} with students {pk_set}")
        removed_students = Student.objects.filter(pk__in=pk_set)
        for student in removed_students:
            try:
                send_student_removal_email(student, instance.course.name, instance.batch_id)
                logger.info(f"[Signal] Email sent to {student.email}")
            except Exception as e:
                logger.error(f"[Signal] Failed to send email to {student.email}: {str(e)}")





{

# from .models import Signals
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated  
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from .serializer import SignalsSerializer


}







{



# class GetAllNotificationsAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         notifications = Signals.objects.all()
#         serializer = SignalsSerializer(notifications, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    





    
# class CreateNotificationAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         serializer = NotificationSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class UpdateNotificationAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         notification = Notification.objects.filter(id=id).first()
#         if not notification:
#             return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

#         serializer = NotificationSerializer(notification, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# class DeleteNotificationAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def delete(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         notification = Notification.objects.filter(id=id).first()
#         if not notification:
#             return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

#         notification.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)
    
# class MarkNotificationAsReadAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, id):
#         notification = Notification.objects.filter(id=id).first()
#         if not notification:
#             return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

#         serializer = NotificationReadStatusSerializer(notification, data={'read': True}, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class MarkNotificationAsUnreadAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, id):
#         notification = Notification.objects.filter(id=id).first()
#         if not notification:
#             return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

#         serializer = NotificationReadStatusSerializer(notification, data={'read': False}, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class GetUnreadNotificationsAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

#         notifications = Notification.objects.filter(read=False)
#         serializer = NotificationSerializer(notifications, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


}