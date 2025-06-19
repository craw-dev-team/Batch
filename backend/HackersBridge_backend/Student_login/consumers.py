from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import json
import logging
from channels.db import database_sync_to_async
from django.db.models import Q
from nexus.models import Batch, Chats, ChatMessage
from Student.models import Student
from datetime import datetime
# from django.db.models import Q

# User = get_user_model()
from django.contrib.auth import get_user_model

User = get_user_model()


class MySyncConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(text_data=json.dumps({"message": "WebSocket connected!"}))

    def disconnect(self, close_code):
        print("Disconnected")

    def receive(self, text_data):
        print("Message received:", text_data)
        self.send(text_data=json.dumps({"reply": "Echo: " + text_data}))



class StudentBatchChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['url_route']['kwargs']['id']
        self.group_name = f'batch_chat_{self.id}'
        self.user = self.scope['user']

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        chat = await self.get_chat(self.user, self.id)

        if chat:
            previous_messages = await self.get_previous_messages(chat)
            await self.send(text_data=json.dumps({
                'type': 'history',
                'messages': previous_messages
            }))
        else:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No chat found for this batch.'
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
            return

        message = data.get('message', '').strip()
        if not message:
            return  # Don't process empty messages

        sender_role = data.get('sender', getattr(self.user, 'role', 'student'))
        send_by_id = data.get('send_by', self.user.id)

        user = await self.get_user_by_id(send_by_id)
        if not user:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'User not found.'
            }))
            return

        chat = await self.get_chat(user, self.id)
        if not chat:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Chat not found.'
            }))
            return

        await self.save_message(chat, user, message, sender_role)

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'send_by': user.first_name,
                'sender': sender_role
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': event['message'],
            'send_by': event['send_by'],
            'sender': event['sender']
        }))

    @database_sync_to_async
    def get_chat(self, user, batch_id):
        # Admins or external users bypass student-batch mapping
        if hasattr(user, 'role') and user.role != 'student':
            chat = Chats.objects.filter(batch_id=batch_id).first()
            return chat

        # For students, match by email or enrollment number
        student = Student.objects.filter(Q(enrollment_no=user.username) | Q(email=user.email)).first()
        if not student:
            return None

        batch = Batch.objects.filter(id=batch_id, student=student).first()
        if not batch:
            return None

        return Chats.objects.filter(batch=batch).first()

    @database_sync_to_async
    def get_previous_messages(self, chat):
        messages = ChatMessage.objects.filter(chat=chat).order_by('created_at')
        return [{
            'message': m.message,
            'send_by': m.send_by.first_name if m.send_by else "Unknown",
            'sender': m.sender
        } for m in messages]

    @database_sync_to_async
    def save_message(self, chat, user, message, sender):
        return ChatMessage.objects.create(
            chat=chat,
            sender=sender,
            send_by=user,
            message=message
        )

    @database_sync_to_async
    def get_user_by_id(self, user_id):
        return User.objects.filter(id=user_id).first()
    

# class BatchChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.batch_id = self.scope['url_route']['kwargs']['id']
#         self.group_name = f'batch_chat_{self.batch_id}'
#         self.user = self.scope['user']

#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#         chat = await self.get_chat(self.batch_id)
#         if chat:
#             previous_messages = await self.get_previous_messages(chat)
#             await self.send(text_data=json.dumps({
#                 'type': 'history',
#                 'messages': previous_messages
#             }))

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data.get('message')
#         sender_role = data.get('sender', self.user.role)
#         send_by_id = data.get('send_by', self.user.id)

#         user = await self.get_user_by_id(send_by_id)
#         chat = await self.get_chat(self.batch_id)

#         if not message or not user or not chat:
#             return

#         await self.save_message(chat, user, message, sender_role)

#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'chat_message',
#                 'message': message,
#                 'send_by': user.first_name,
#                 'sender': sender_role,
#             }
#         )

#     async def chat_message(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'chat',
#             'message': event['message'],
#             'send_by': event['send_by'],
#             'sender': event['sender']
#         }))

#     @database_sync_to_async
#     def get_chat(self, batch_id):
#         batch = Batch.objects.filter(id=batch_id).first()
#         if not batch:
#             return None
#         return Chats.objects.filter(batch=batch).first()

#     @database_sync_to_async
#     def get_previous_messages(self, chat):
#         messages = ChatMessage.objects.filter(chat=chat).order_by('gen_time')
#         return [{
#             'message': m.message,
#             'send_by': m.send_by.first_name,
#             'sender': m.sender,
#         } for m in messages]

#     @database_sync_to_async
#     def save_message(self, chat, user, message, sender):
#         ChatMessage.objects.create(
#             chat=chat,
#             sender=sender,
#             send_by=user,
#             message=message
#         )

#     @database_sync_to_async
#     def get_user_by_id(self, user_id):
#         return User.objects.filter(id=user_id).first()


class BatchChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['url_route']['kwargs']['id']
        self.room_group_name = f"batch_chat_{self.id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Optional: Send old messages on connect
        old_messages = await self.get_previous_messages(self.id)
        await self.send(text_data=json.dumps({
            'type': 'old_messages',
            'messages': old_messages
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        user_id = self.scope['user'].id
        sender = self.scope['user'].role

        chat_obj = await self.get_or_create_chat(self.id)
        msg_obj = await self.create_message(chat_obj, user_id, sender, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msg_obj['message'],
                'sender': msg_obj['sender'],
                'send_by': msg_obj['send_by'],
                'gen_time': msg_obj['gen_time']
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'send_by': event['send_by'],
            'gen_time': event['gen_time']
        }))

    @database_sync_to_async
    def get_or_create_chat(self, id):
        batch = Batch.objects.filter(id=id).first()
        chat, _ = Chats.objects.get_or_create(batch=batch)
        return chat

    @database_sync_to_async
    def create_message(self, chat, user_id, sender, message):
        user = User.objects.get(id=user_id)
        msg = ChatMessage.objects.create(
            chat=chat,
            sender=sender,
            send_by=user,
            message=message
        )
        return {
            'message': msg.message,
            'sender': msg.sender,
            'send_by': msg.send_by.first_name,
            'gen_time': msg.gen_time.isoformat()
        }

    @database_sync_to_async
    def get_previous_messages(self, id):
        chat = Chats.objects.filter(batch__id=id).first()
        if not chat:
            return []

        messages = ChatMessage.objects.filter(chat=chat).select_related('send_by').order_by('gen_time')
        return [
            {
                'message': m.message,
                'sender': m.sender,
                'send_by': m.send_by.first_name if m.send_by else "Unknown",
                'gen_time': m.gen_time.isoformat()
            }
            for m in messages
        ]
