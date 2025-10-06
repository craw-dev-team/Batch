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


{



# import logging
# logger = logging.getLogger("admin_chat")

# active_connections = {}

# class BatchChatAndMessageConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.id = self.scope['url_route']['kwargs']['id']
#         self.group_name = f'batch_chat_{self.id}'
#         self.user = self.scope['user']

#         logger.info(f"🟢 [CONNECT] User: {self.user} | Role: {getattr(self.user, 'role', None)} | Batch ID: {self.id}")

#         if not hasattr(self.user, 'role') or self.user.role not in ['admin', 'coordinator']:
#             logger.warning(f"🔴 [CONNECT] Invalid Role or Missing Role | Closing Connection")
#             await self.close()
#             return

#         # Only one connection per user per batch
#         key = f"{self.user.id}_{self.id}"
#         old_channel = active_connections.get(key)
#         if old_channel and old_channel != self.channel_name:
#             logger.info(f"🟡 [CONNECT] Closing old WebSocket connection for key {key}")
#             await self.channel_layer.send(old_channel, {"type": "force_disconnect"})

#         active_connections[key] = self.channel_name

#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#         chat = await self.get_chat()
#         if chat:
#             logger.info(f"🟢 [CONNECT] Chat Found for Batch ID {self.id}")
#             messages = await self.get_previous_messages(chat)
#             await self.send(text_data=json.dumps({
#                 'type': 'history',
#                 'messages': messages,
#             }))
#         else:
#             logger.warning(f"🔴 [CONNECT] No Chat Found for Batch ID {self.id}")
#             await self.send(text_data=json.dumps({
#                 'type': 'error',
#                 'message': 'No chat found for this batch.'
#             }))

#     async def disconnect(self, close_code):
#         logger.info(f"🟡 [DISCONNECT] Closing connection | Group: {self.group_name}")
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)
#         key = f"{self.user.id}_{self.id}"
#         if key in active_connections and active_connections[key] == self.channel_name:
#             del active_connections[key]

#     async def force_disconnect(self, event):
#         logger.info(f"🟡 [FORCE DISCONNECT] Closing duplicate connection")
#         await self.close()

#     async def receive(self, text_data):
#         logger.info(f"🟢 [RECEIVE] Raw data: {text_data}")
#         try:
#             data = json.loads(text_data)
#         except Exception as e:
#             logger.error(f"Invalid JSON data received: {e}")
#             return

#         action_type = data.get('type')

#         if action_type == "fetch_messages":
#             logger.info(f"🟢 [RECEIVE] Fetching messages for Batch {self.id}")
#             await self.fetch_chat_messages()
#         elif action_type == "send_message":
#             logger.info(f"🟢 [RECEIVE] Sending message for Batch {self.id}")
#             await self.handle_send_message(data)
#         elif action_type == "delete_message":
#             logger.info(f"🟢 [RECEIVE] Deleting message for Batch {self.id}")
#             await self.handle_delete_message(data)
#         else:
#             logger.warning(f"🔴 [RECEIVE] Unknown action type: {action_type}")

#     async def handle_send_message(self, data):
#         raw_message = data.get("message", "")
#         reply_to_id = data.get("reply_to")
#         reply_to_text = data.get("reply_to_text")
#         reply_to_send_by = data.get("reply_to_send_by")

#         if isinstance(raw_message, dict):
#             message = raw_message.get("message", "")
#             reply_to_id = reply_to_id or raw_message.get("reply_to")
#             reply_to_text = reply_to_text or raw_message.get("reply_to_text")
#             reply_to_send_by = reply_to_send_by or raw_message.get("reply_to_send_by")
#         else:
#             message = raw_message

#         file_name = data.get("file_name")
#         file_size = int(data.get("file_size", 0) or 0)
#         file_url = data.get("file_url")
#         is_forwarded = data.get("is_forwarded", False)
#         forwarded_from_id = data.get("forwarded_from")

#         try:
#             if reply_to_id is not None:
#                 reply_to_id = int(reply_to_id)
#         except Exception:
#             reply_to_id = None

#         await self.save_and_broadcast_message(
#             message=message,
#             file_name=file_name,
#             file_size=file_size,
#             file_url=file_url,
#             reply_to_id=reply_to_id,
#             is_forwarded=is_forwarded,
#             forwarded_from_id=forwarded_from_id,
#         )

#     async def handle_delete_message(self, data):
#         """
#         Handle delete message request sent via WebSocket (optional, or can be triggered by API).
#         Expects 'message_id' in data.
#         """
#         message_id = data.get('message_id')
#         if not message_id:
#             await self.send(text_data=json.dumps({
#                 'type': 'error',
#                 'message': 'No message_id provided for deletion.',
#             }))
#             return

#         chat = await self.get_chat()
#         if not chat:
#             await self.send(text_data=json.dumps({
#                 'type': 'error',
#                 'message': 'No chat found for this batch.',
#             }))
#             return

#         try:
#             msg = await sync_to_async(ChatMessage.objects.get)(id=message_id, chat=chat)
#             await sync_to_async(msg.delete)()
#         except ChatMessage.DoesNotExist:
#             await self.send(text_data=json.dumps({
#                 'type': 'error',
#                 'message': 'Message not found or already deleted.',
#             }))
#             return

#         # Notify all clients in the batch that message was deleted
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'delete_message',
#                 'message_id': message_id,
#             }
#         )

#     async def get_chat(self):
#         def fetch_chat(batch_id):
#             batch = Batch.objects.filter(id=batch_id).first()
#             logger.info(f"🟢 [get_chat] Batch Lookup => Found: {bool(batch)} | Batch ID: {batch_id}")
#             if not batch:
#                 return None
#             chat = Chats.objects.filter(batch=batch).first()
#             logger.info(f"🟢 [get_chat] Chat Lookup => Found: {bool(chat)} | Chat: {chat}")
#             return chat
#         return await sync_to_async(fetch_chat)(self.id)

#     async def get_previous_messages(self, chat):
#         logger.info(f"🟢 [get_previous_messages] Fetching previous messages for Chat ID: {chat.id}")

#         def fetch_msgs(chat, user_id):
#             messages_queryset = ChatMessage.objects.filter(chat=chat).select_related(
#                 'send_by', 'chat__batch', 'reply_to', 'forwarded_from'
#             )
#             valid_ids = set(msg.id for msg in messages_queryset)
#             result = []
#             for msg in messages_queryset:
#                 if msg.reply_to and msg.reply_to.id in valid_ids:
#                     reply_to_id = msg.reply_to.id
#                     reply_to_message = msg.reply_to.message
#                     reply_to_send_by = msg.reply_to.send_by.first_name if msg.reply_to.send_by else None
#                 else:
#                     reply_to_id = None
#                     reply_to_message = None
#                     reply_to_send_by = None

#                 result.append({
#                     'id': msg.id,
#                     'batch_code': msg.chat.batch.batch_id,
#                     'sender': msg.sender,
#                     'send_by': msg.send_by.first_name if msg.send_by else "Unknown",
#                     'message': msg.message,
#                     'gen_time': localtime(msg.gen_time).isoformat(),
#                     'isSelf': msg.send_by.id == user_id if msg.send_by else False,
#                     'reply_to': reply_to_id,
#                     'reply_to_message': reply_to_message,
#                     'reply_to_send_by': reply_to_send_by,
#                     'is_forwarded': msg.is_forwarded,
#                     'forwarded_from': msg.forwarded_from.id if msg.forwarded_from else None,
#                     'forwarded_from_message': msg.forwarded_from.message if msg.forwarded_from else None,
#                     'file_name': msg.file_name,
#                     'file_size': msg.file_size,
#                     'file_url': msg.file.url if msg.file else None,
#                 })
#             return result

#         return await sync_to_async(fetch_msgs)(chat, self.user.id)


#     async def fetch_chat_messages(self):
#         chat = await self.get_chat()
#         if not chat:
#             logger.warning(f"🔴 [fetch_chat_messages] No Chat Found for Batch ID {self.id}")
#             await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
#             return

#         messages = await self.get_previous_messages(chat)
#         batch = chat.batch
#         batch_name = (
#             f"{batch.trainer.name} - {batch.course.name} - {batch.batch_time.start_time.strftime('%I:%M %p')} - {batch.batch_time.end_time.strftime('%I:%M %p')}"
#             if batch.trainer and batch.course and batch.batch_time
#             else f"{batch.batch_id}"
#         )

#         logger.info(f"🟢 [fetch_chat_messages] Sending Messages | Batch: {batch_name} | Total Messages: {len(messages)}")
#         await self.send(text_data=json.dumps({
#             'type': 'chat_history',
#             'batch_name': batch_name,
#             'messages': messages
#         }))

#     async def save_and_broadcast_message(self, message, file_name=None, file_size=0, file_url=None,
#                                          reply_to_id=None, is_forwarded=False, forwarded_from_id=None):
#         logger.info(f"🟢 [save_and_broadcast_message] Incoming Message: {message}")
#         logger.info(f"🟢 [save_and_broadcast_message] reply_to_id: {reply_to_id}, forwarded_from_id: {forwarded_from_id}")

#         chat = await self.get_chat()
#         if not chat:
#             logger.warning(f"🔴 [save_and_broadcast_message] No Chat Found to Save Message")
#             await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
#             return

#         reply_to = await sync_to_async(ChatMessage.objects.filter(id=reply_to_id).select_related('send_by').first)() if reply_to_id else None
#         forwarded_from = await sync_to_async(ChatMessage.objects.filter(id=forwarded_from_id).first)() if forwarded_from_id else None

#         msg = await sync_to_async(ChatMessage.objects.create)(
#             chat=chat,
#             sender=self.user.role,
#             send_by=self.user,
#             message=message,
#             file_name=file_name,
#             file_size=file_size,
#             file=file_url if file_url else None,
#             reply_to=reply_to,
#             is_forwarded=is_forwarded,
#             forwarded_from=forwarded_from,
#             gen_time=timezone_now()
#         )
#         logger.info(f"🟢 [save_and_broadcast_message] Message saved with id: {msg.id}")

#         reply_to_message = reply_to.message if reply_to else None
#         reply_to_send_by = await sync_to_async(lambda: reply_to.send_by.first_name)() if reply_to and reply_to.send_by else None
#         forwarded_from_message = forwarded_from.message if forwarded_from else None

#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'chat_message',
#                 'id': msg.id,
#                 'user': self.user.username,
#                 'send_by': self.user.first_name,
#                 'sender': self.user.role,
#                 'message': message,
#                 'user_id': self.user.id,
#                 'gen_time': localtime(msg.gen_time).isoformat(),
#                 'reply_to': reply_to_id,
#                 'reply_to_message': reply_to_message,
#                 'reply_to_send_by': reply_to_send_by,
#                 'is_forwarded': is_forwarded,
#                 'forwarded_from': forwarded_from_id,
#                 'forwarded_from_message': forwarded_from_message,
#                 'file_name': file_name,
#                 'file_size': file_size,
#                 'file_url': file_url,
#             }
#         )

#     # GROUP EVENT HANDLERS

#     async def chat_message(self, event):
#         """
#         Handler for 'chat_message' events sent via group_send.
#         """
#         await self.send(text_data=json.dumps({
#             'type': 'chat_message',
#             'id': event.get('id'),
#             'user': event.get('user'),
#             'send_by': event.get('send_by'),
#             'sender': event.get('sender'),
#             'message': event.get('message'),
#             'user_id': event.get('user_id'),
#             'gen_time': event.get('gen_time'),
#             'reply_to': event.get('reply_to'),
#             'reply_to_message': event.get('reply_to_message'),
#             'reply_to_send_by': event.get('reply_to_send_by'),
#             'is_forwarded': event.get('is_forwarded'),
#             'forwarded_from': event.get('forwarded_from'),
#             'forwarded_from_message': event.get('forwarded_from_message'),
#             'file_name': event.get('file_name'),
#             'file_size': event.get('file_size'),
#             'file_url': event.get('file_url'),
#         }))

#     async def delete_message(self, event):
#         """
#         Handler for 'delete_message' events sent via group_send.
#         All clients in the batch will receive the deleted message id.
#         """
#         await self.send(text_data=json.dumps({
#             'type': 'delete_message',
#             'message_id': event.get('message_id'),
#         }))


}


# consumers.py
import json
import logging

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils.timezone import localtime
from django.utils import timezone

from .models import Batch, Chats, ChatMessage

logger = logging.getLogger("admin_chat")

# one active WS connection per (user,batch)
active_connections = {}


class BatchChatAndMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['url_route']['kwargs']['id']  # may be pk or batch_id string
        self.group_name = f'batch_chat_{self.id}'
        self.user = self.scope['user']

        logger.info(
            "🟢 [CONNECT] User: %s | Role: %s | Batch Key: %s",
            self.user, getattr(self.user, 'role', None), self.id
        )

        if not hasattr(self.user, 'role') or self.user.role not in ['admin', 'coordinator']:
            logger.warning("🔴 [CONNECT] Invalid/Missing Role | Closing Connection")
            await self.close()
            return

        # Only one connection per user per batch
        key = f"{self.user.id}_{self.id}"
        old_channel = active_connections.get(key)
        if old_channel and old_channel != self.channel_name:
            logger.info("🟡 [CONNECT] Closing old WebSocket connection for key %s", key)
            await self.channel_layer.send(old_channel, {"type": "force_disconnect"})

        active_connections[key] = self.channel_name

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        chat = await self.get_chat()
        if chat:
            logger.info("🟢 [CONNECT] Chat Found for Batch Key %s (chat_id=%s)", self.id, chat.id)
            messages = await self.get_previous_messages(chat)
            await self.send(text_data=json.dumps({
                'type': 'history',
                'messages': messages,
            }))
        else:
            logger.warning("🔴 [CONNECT] No Chat Found for Batch Key %s", self.id)
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No chat found for this batch.'
            }))

    async def disconnect(self, close_code):
        logger.info("🟡 [DISCONNECT] Closing connection | Group: %s", self.group_name)
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        key = f"{self.user.id}_{self.id}"
        if key in active_connections and active_connections[key] == self.channel_name:
            del active_connections[key]

    async def force_disconnect(self, event):
        logger.info("🟡 [FORCE DISCONNECT] Closing duplicate connection")
        await self.close()

    async def receive(self, text_data):
        logger.info("🟢 [RECEIVE] Raw data: %s", text_data)
        try:
            data = json.loads(text_data)
        except Exception as e:
            logger.error("🔴 [RECEIVE] Invalid JSON data: %s", e)
            return

        action_type = data.get('type')

        if action_type == "fetch_messages":
            logger.info("🟢 [RECEIVE] Fetching messages for Batch %s", self.id)
            await self.fetch_chat_messages()
        elif action_type == "send_message":
            logger.info("🟢 [RECEIVE] Sending message for Batch %s", self.id)
            await self.handle_send_message(data)
        elif action_type == "delete_message":
            logger.info("🟢 [RECEIVE] Deleting message for Batch %s", self.id)
            await self.handle_delete_message(data)
        else:
            logger.warning("🔴 [RECEIVE] Unknown action type: %s", action_type)

    async def handle_send_message(self, data):
        raw_message = data.get("message", "")
        reply_to_id = data.get("reply_to")
        reply_to_text = data.get("reply_to_text")
        reply_to_send_by = data.get("reply_to_send_by")

        if isinstance(raw_message, dict):
            message = raw_message.get("message", "")
            reply_to_id = reply_to_id or raw_message.get("reply_to")
            reply_to_text = reply_to_text or raw_message.get("reply_to_text")
            reply_to_send_by = reply_to_send_by or raw_message.get("reply_to_send_by")
        else:
            message = raw_message

        file_name = data.get("file_name")
        file_size = int(data.get("file_size", 0) or 0)
        file_url = data.get("file_url")  # Note: we don't write this into FileField
        is_forwarded = data.get("is_forwarded", False)
        forwarded_from_id = data.get("forwarded_from")

        try:
            if reply_to_id is not None:
                reply_to_id = int(reply_to_id)
        except Exception:
            reply_to_id = None

        await self.save_and_broadcast_message(
            message=message,
            file_name=file_name,
            file_size=file_size,
            file_url=file_url,
            reply_to_id=reply_to_id,
            is_forwarded=is_forwarded,
            forwarded_from_id=forwarded_from_id,
        )

    async def handle_delete_message(self, data):
        message_id = data.get('message_id')
        if not message_id:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No message_id provided for deletion.',
            }))
            return

        chat = await self.get_chat()
        if not chat:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No chat found for this batch.',
            }))
            return

        try:
            msg = await sync_to_async(ChatMessage.objects.get)(id=message_id, chat=chat)
            await sync_to_async(msg.delete)()
        except ChatMessage.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Message not found or already deleted.',
            }))
            return

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'delete_message',
                'message_id': message_id,
            }
        )

    async def get_chat(self):
        # Accept either numeric pk or Batch.batch_id (string)
        def fetch_chat(batch_key):
            # Try primary key first
            batch = Batch.objects.filter(id=batch_key).first()
            if not batch:
                # Then try by batch_id field
                batch = Batch.objects.filter(batch_id=batch_key).first()
            logger.info("🟢 [get_chat] Batch Lookup => Found: %s | Key: %s | batch_pk=%s",
                        bool(batch), batch_key, getattr(batch, 'pk', None))
            if not batch:
                return None
            chat = Chats.objects.filter(batch=batch).first()
            # Avoid __str__ on chat (in case model methods change)
            logger.info("🟢 [get_chat] Chat Lookup => Found: %s | chat_id=%s",
                        bool(chat), getattr(chat, 'id', None))
            return chat

        return await sync_to_async(fetch_chat)(self.id)

    async def get_previous_messages(self, chat):
        logger.info("🟢 [get_previous_messages] Fetching previous messages for Chat ID: %s", chat.id)

        def fetch_msgs(chat_obj, user_id):
            qs = (ChatMessage.objects
                  .filter(chat=chat_obj)
                  .select_related('send_by', 'chat__batch', 'reply_to', 'forwarded_from')
                  .order_by('gen_time'))
            valid_ids = set(msg.id for msg in qs)
            result = []
            for msg in qs:
                if msg.reply_to and msg.reply_to.id in valid_ids:
                    reply_to_id = msg.reply_to.id
                    reply_to_message = msg.reply_to.message
                    reply_to_send_by = msg.reply_to.send_by.first_name if msg.reply_to.send_by else None
                else:
                    reply_to_id = None
                    reply_to_message = None
                    reply_to_send_by = None

                result.append({
                    'id': msg.id,
                    'batch_code': msg.chat.batch.batch_id,
                    'sender': msg.sender,
                    'send_by': msg.send_by.first_name if msg.send_by else "Unknown",
                    'message': msg.message,
                    'gen_time': localtime(msg.gen_time).isoformat(),
                    'isSelf': (msg.send_by.id == user_id) if msg.send_by else False,
                    'reply_to': reply_to_id,
                    'reply_to_message': reply_to_message,
                    'reply_to_send_by': reply_to_send_by,
                    'is_forwarded': msg.is_forwarded,
                    'forwarded_from': msg.forwarded_from.id if msg.forwarded_from else None,
                    'forwarded_from_message': msg.forwarded_from.message if msg.forwarded_from else None,
                    'file_name': msg.file_name,
                    'file_size': msg.file_size,
                    'file_url': (msg.file.url if msg.file else None),
                })
            return result

        return await sync_to_async(fetch_msgs)(chat, self.user.id)

    async def fetch_chat_messages(self):
        chat = await self.get_chat()
        if not chat:
            logger.warning("🔴 [fetch_chat_messages] No Chat Found for Batch Key %s", self.id)
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
            return

        messages = await self.get_previous_messages(chat)
        batch = chat.batch

        # Safely build a readable batch name
        try:
            if batch.trainer and batch.course and batch.batch_time:
                batch_name = (
                    f"{getattr(batch.trainer, 'name', 'Trainer')} - "
                    f"{getattr(batch.course, 'name', 'Course')} - "
                    f"{batch.batch_time.start_time.strftime('%I:%M %p')} - "
                    f"{batch.batch_time.end_time.strftime('%I:%M %p')}"
                )
            else:
                batch_name = f"{batch.batch_id}"
        except Exception:
            batch_name = f"{batch.batch_id}"

        logger.info("🟢 [fetch_chat_messages] Sending Messages | Batch: %s | Total: %d",
                    batch_name, len(messages))
        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'batch_name': batch_name,
            'messages': messages
        }))

    async def save_and_broadcast_message(self, message, file_name=None, file_size=0, file_url=None,
                                         reply_to_id=None, is_forwarded=False, forwarded_from_id=None):
        logger.info("🟢 [save_and_broadcast_message] Incoming Message | reply_to_id=%s | forwarded_from_id=%s",
                    reply_to_id, forwarded_from_id)

        chat = await self.get_chat()
        if not chat:
            logger.warning("🔴 [save_and_broadcast_message] No Chat Found to Save Message")
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
            return

        # DB ops in threadpool
        reply_to = await sync_to_async(
            lambda: ChatMessage.objects.select_related('send_by').filter(id=reply_to_id).first()
        )() if reply_to_id else None

        forwarded_from = await sync_to_async(
            lambda: ChatMessage.objects.filter(id=forwarded_from_id).first()
        )() if forwarded_from_id else None

        # IMPORTANT: do NOT set FileField with a URL string
        msg = await sync_to_async(ChatMessage.objects.create)(
            chat=chat,
            sender=self.user.role,
            send_by=self.user,
            message=message,
            file_name=file_name,
            file_size=file_size,
            # file remains None unless actually uploaded via Django storage
            reply_to=reply_to,
            is_forwarded=is_forwarded,
            forwarded_from=forwarded_from,
            gen_time=timezone.now()
        )
        logger.info("🟢 [save_and_broadcast_message] Message saved id=%s", msg.id)

        reply_to_message = reply_to.message if reply_to else None
        reply_to_send_by = (reply_to.send_by.first_name if (reply_to and reply_to.send_by) else None)
        forwarded_from_message = forwarded_from.message if forwarded_from else None

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'id': msg.id,
                'user': self.user.username,
                'send_by': self.user.first_name,
                'sender': self.user.role,
                'message': message,
                'user_id': self.user.id,
                'gen_time': localtime(msg.gen_time).isoformat(),
                'reply_to': reply_to_id,
                'reply_to_message': reply_to_message,
                'reply_to_send_by': reply_to_send_by,
                'is_forwarded': is_forwarded,
                'forwarded_from': forwarded_from_id,
                'forwarded_from_message': forwarded_from_message,
                'file_name': file_name,
                'file_size': file_size,
                # Prefer actual stored file URL if present; else echo the client-provided URL (if you use one)
                'file_url': (msg.file.url if getattr(msg, 'file', None) else file_url),
            }
        )

    # === GROUP EVENT HANDLERS ===

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id': event.get('id'),
            'user': event.get('user'),
            'send_by': event.get('send_by'),
            'sender': event.get('sender'),
            'message': event.get('message'),
            'user_id': event.get('user_id'),
            'gen_time': event.get('gen_time'),
            'reply_to': event.get('reply_to'),
            'reply_to_message': event.get('reply_to_message'),
            'reply_to_send_by': event.get('reply_to_send_by'),
            'is_forwarded': event.get('is_forwarded'),
            'forwarded_from': event.get('forwarded_from'),
            'forwarded_from_message': event.get('forwarded_from_message'),
            'file_name': event.get('file_name'),
            'file_size': event.get('file_size'),
            'file_url': event.get('file_url'),
        }))

    async def delete_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'delete_message',
            'message_id': event.get('message_id'),
        }))














