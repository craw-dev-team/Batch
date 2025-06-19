from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from nexus.models import Batch, Chats, ChatMessage
from Student.models import Student
from datetime import datetime
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.timezone import localtime, now as timezone_now

User = get_user_model()
{
# class BatchChatAndMessageConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.id = self.scope['url_route']['kwargs']['id']
#         self.group_name = f'batch_chat_{self.id}'
#         self.user = self.scope['user']  # ✅ FIXED: Get user from scope

#         # Check role
#         if not hasattr(self.user, 'role') or self.user.role not in ['admin', 'coordinator']:
#             await self.close()  # Reject connection
#             return

#         await self.channel_layer.group_add(
#             self.group_name,
#             self.channel_name
#         )
#         await self.accept()

#         # Send initial message
#         await self.send(text_data=json.dumps({
#             'type': 'connection',
#             'message': 'You are connected to the WebSocket'
#         }))

#     async def disconnect(self, close_code):
#         # Leave group on disconnect
#         await self.channel_layer.group_discard(
#             self.group_name,
#             self.channel_name
#         )
#         # No need to send a message here; the socket is already closed.

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data.get('message', '')

#         # Broadcast to group
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'chat_message',
#                 'user': self.user.username,
#                 'message': message
#             }
#         )

#     async def chat_message(self, event):
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'type': 'chat',
#             'user': event['user'],
#             'message': event['message']
#         }))


# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import sync_to_async
# from nexus.models import Batch, Chats, ChatMessage
}


class BatchChatAndMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['url_route']['kwargs']['id']
        self.group_name = f'batch_chat_{self.id}'
        self.user = self.scope['user']

        # ✅ Role Check
        if not hasattr(self.user, 'role') or self.user.role not in ['admin', 'coordinator']:
            await self.close()
            return

        # ✅ Join group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # ✅ Fetch chat and messages
        chat = await self.get_chat()
        if chat:
            messages = await self.get_previous_messages(chat)
            await self.send(text_data=json.dumps({
                'type': 'history',
                'messages': messages,
            }))
        else:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No chat found for this batch.'
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action_type = data.get('type')

        if action_type == "fetch_messages":
            await self.fetch_chat_messages()
        elif action_type == "send_message":
            message = data.get("message", "")
            await self.save_and_broadcast_message(message)

    async def get_chat(self):
        batch = await sync_to_async(lambda: Batch.objects.filter(id=self.id).first())()
        if not batch:
            return None
        return await sync_to_async(lambda: Chats.objects.filter(batch=batch).first())()

    async def get_previous_messages(self, chat):
        messages_queryset = await sync_to_async(
            lambda: list(ChatMessage.objects.filter(chat=chat).select_related('send_by', 'chat__batch'))
        )()

        user_id = self.user.id

        return [
            {
                'id': msg.id,
                'batch_code': msg.chat.batch.batch_id,
                'sender': msg.sender,
                'send_by': msg.send_by.first_name if msg.send_by else "Unknown",
                'message': msg.message,
                'gen_time': localtime(msg.gen_time).strftime('%Y-%m-%d %I:%M %p'),
                'isSelf': (msg.send_by.id == user_id) if msg.send_by else False
            }
            for msg in messages_queryset
        ]

    async def fetch_chat_messages(self):
        chat = await self.get_chat()
        if not chat:
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
            return

        messages = await self.get_previous_messages(chat)

        batch = chat.batch
        batch_name = f"{batch.trainer.name} - {batch.course.name} - {batch.batch_time.start_time.strftime('%I:%M %p')} - {batch.batch_time.end_time.strftime('%I:%M %p')}"

        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'batch_name': batch_name,
            'messages': messages
        }))

    async def save_and_broadcast_message(self, message):
        if not message.strip():
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'Message is required'}))
            return

        chat = await self.get_chat()
        if not chat:
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
            return

        # ✅ Save message with proper timestamp
        msg = await sync_to_async(ChatMessage.objects.create)(
            chat=chat,
            sender=self.user.role,
            send_by=self.user,
            message=message,
            gen_time=timezone_now()
        )
        local_gen_time = localtime(msg.gen_time)

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'user': self.user.username,
                'send_by': self.user.first_name,
                'sender': self.user.role,
                'message': message,
                'user_id': self.user.id,
                'gen_time': local_gen_time.strftime('%Y-%m-%d %I:%M %p'),  # ✅ local formatted time
            }
        )

    async def chat_message(self, event):
        is_self = (event.get('user_id') == self.user.id)
        print(event.get('gen_time'))

        await self.send(text_data=json.dumps({
            'type': 'chat',
            'user': event['user'],
            'sender': event.get('sender', 'Unknown'),
            'send_by': event.get('send_by', 'Unknown'),
            'message': event['message'],
            'isSelf': is_self,
            'gen_time': event.get('gen_time', ''),
        }))
