from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    # Trainer-related URLs
    path('trainer_info/', TrainerInfoAPIView.as_view(), name='trainer_info'),
    path('trainer_batch/', TrainerAllBatchesAPIView.as_view(), name='trainer_batch_list'),
    path('trainer/batch/info/<int:batch_id>/', TrainerBatchInfoAPIView.as_view(), name='trainer-batch-info'),
    path('trainer/mark-attendance/<int:id>/', TrainerAttendanceMarkView.as_view(), name='mark-attendance'),
    path('trainer/announcements/', TrainerAnnouncementListView.as_view(), name='trainer-announcements'),

    path('trainer/batch-chats/', TrainerAllBatchChatsAPIView.as_view(), name='trainer-batch-chats-list'),
    path('trainer/batch-chats/<int:id>/messages/', TrainerBatchChatsMessageAPIView.as_view(), name='trainer-batch-chat-messages'),
    path('trainer/batch-chats/<int:id>/send-message/', TrainerBatchChatsMessageSenderAPIView.as_view(), name='trainer-batch-chat-send-message'),
    path('trainer/chat/delete/<int:message_id>/', TrainerBatchChatMessageDeleteAPIView.as_view(), name='trainer-chat-message-delete'),   

]