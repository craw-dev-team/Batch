from rest_framework.views import APIView
from rest_framework import status, filters
from rest_framework.response import Response
from django.db.models import Prefetch
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Batch, Chats, ChatMessage
from .serializer import AllChatsSerializer
from django_filters.rest_framework import DjangoFilterBackend, DateFromToRangeFilter, FilterSet
from rest_framework.generics import ListAPIView
from django.db.models import Q
from nexus.JWTCookie import JWTAuthFromCookie


# This is for getting all batch chats list...
class AllChatsAPIView(ListAPIView):
    authentication_classes = [JWTAuthFromCookie]
    permission_classes = [IsAuthenticated]

    serializer_class = AllChatsSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['batch__batch_id', 'batch__status', 'batch__trainer__name', 'batch__course__name']


    def get_queryset(self):
        if self.request.user.role not in ['admin', 'coordinator']:
            return Chats.objects.none()

        queryset = Chats.objects.select_related(
            'batch', 'batch__trainer', 'batch__course', 'batch__batch_time'
        ).prefetch_related('messages')

        # Apply custom status filtering logic
        batch_status = self.request.query_params.get('batch__status')

        if batch_status == "Completed":
            queryset = queryset.filter(Q(batch__status='Completed') | Q(batch__status='Cancelled'))
            print("COMPLETED")
        elif batch_status == "Running":
            queryset = queryset.filter(batch__status="Running")
            print("ONGOING")

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Serialize data
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Custom sort logic by batch_status color
        status_priority = {'Green': 0, 'Yellow': 1, 'Red': 2}
        sorted_data = sorted(data, key=lambda x: status_priority.get(x['batch_status'], 3))

        return Response({'all_batch_chats': sorted_data}, status=status.HTTP_200_OK)



{
# # This is for geting all chats in selected batch...
# class BatchChatAPIView(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id):
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': "User is Unauthorized..."}, status=status.HTTP_401_UNAUTHORIZED)

#         batch = Batch.objects.filter(id=id).first()
#         if not batch:
#             return Response({'error': 'Batch not found or not assigned to the student'}, status=status.HTTP_404_NOT_FOUND)

#         chat = Chats.objects.filter(batch=batch).first()
#         if not chat:
#             return Response({'error': 'No chat found for this batch'}, status=status.HTTP_404_NOT_FOUND)

#         # Fetch all messages for this chat
#         messages_queryset = ChatMessage.objects.filter(chat=chat).select_related('send_by', 'chat__batch')

#         final_messages = []
#         self_messages = []

#         for msg in messages_queryset:

#             message_data = {
#                 'id': msg.id,
#                 'batch_code': msg.chat.batch.batch_id,
#                 'sender': msg.sender,
#                 'send_by': msg.send_by.first_name if msg.send_by else "Unknown",
#                 'message': msg.message,
#                 'gen_time': msg.gen_time
#             }

#             batch_name = f"{msg.chat.batch.trainer.name} - {msg.chat.batch.course.name} - {msg.chat.batch.batch_time.start_time.strftime('%I:%M %p')} - {msg.chat.batch.batch_time.end_time.strftime('%I:%M %p')}",

#             final_messages.append(message_data)

#             if msg.send_by == request.user:
#                 self_messages.append(message_data)

#         return Response({
#             'batch_name':str(batch_name),
#             'messages': final_messages,
#             'self_message': self_messages
#         }, status=status.HTTP_200_OK)



# # This is for sending message in batch chats...
# class BatchChatMessageAPIView(APIView):
#     authentication_classes = [JWTAuthFromCookie]
#     permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         # Role check
#         if request.user.role not in ['admin', 'coordinator']:
#             return Response({'error': "User is Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

#         message = request.data.get('message')
#         file = request.FILES.get('file')  # Correct way to access uploaded files

#         # Either message or file must be present
#         if not message and not file:
#             return Response({'error': "Either message or file is required"}, status=status.HTTP_400_BAD_REQUEST)

#         # Validate file MIME type using content_type (safe alternative to python-magic)
#         if file:
#             allowed_types = ['image/png', 'image/jpeg', 'application/pdf']
#             if file.content_type not in allowed_types:
#                 return Response({'error': "Only PNG, JPG, or PDF files are allowed."}, status=status.HTTP_400_BAD_REQUEST)

#         # Get batch and chat
#         batch = Batch.objects.filter(id=id).first()
#         if not batch:
#             return Response({'error': "Batch not found"}, status=status.HTTP_404_NOT_FOUND)

#         chat = Chats.objects.filter(batch=batch).first()
#         if not chat:
#             return Response({'error': 'No chat found for this batch'}, status=status.HTTP_404_NOT_FOUND)

#         # Save message
#         ChatMessage.objects.create(
#             chat=chat,
#             sender=request.user.role,
#             send_by=request.user,
#             message=message or "",  # Ensure it's a string
#             file=file
#         )

#         return Response({'success': "Message sent successfully"}, status=status.HTTP_200_OK)
    

# # This is for sending message in batch chats...
# # class BatchChatMessageAPIView(APIView):
# #     authentication_classes = [JWTAuthFromCookie]
# #     permission_classes = [IsAuthenticated]

# #     def post(self, request, id):
# #         if request.user.role not in ['admin', 'coordinator']:
# #             return Response({'error': "User is Unauthorized..."}, status=status.HTTP_401_UNAUTHORIZED)

# #         message = request.data.get('message')
# #         file = request.data.get('file')
# #         message = str(message)
# #         print(message)
# #         if not message:
# #             return Response({'error': "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

# #         batch = Batch.objects.filter(id=id).first()
# #         if not batch:
# #             return Response({'error': "Batch not found"}, status=status.HTTP_404_NOT_FOUND)

# #         chat = Chats.objects.filter(batch=batch).first()
# #         if not chat:
# #             return Response({'error': 'No chat found for this batch'}, status=status.HTTP_404_NOT_FOUND)

# #         ChatMessage.objects.create(
# #             chat=chat,
# #             sender=request.user.role,
# #             send_by=request.user,
# #             message=message,
# #             file=file,
# #         )

# #         return Response({'success': "Message sent successfully"}, status=status.HTTP_200_OK)
}