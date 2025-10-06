from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.utils.timezone import localtime, now as timezone_now
from asgiref.sync import sync_to_async
import json
from nexus.models import *
from Trainer.models import Trainer
from channels.db import database_sync_to_async

User = get_user_model()

# Temporary in-memory connection registry (for dev/testing)
active_connections = {}

class TrainerBatchChatAndMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['url_route']['kwargs']['id']
        self.group_name = f'batch_chat_{self.id}'
        self.user = self.scope['user']

        print(f"🟢 [CONNECT] User: {self.user} | User Role: {getattr(self.user, 'role', None)} | Batch ID Param: {self.id}")

        if not hasattr(self.user, 'role') or self.user.role != 'Trainer':
            print(f"🔴 [CONNECT] Invalid Role or Missing Role | Closing Connection")
            await self.close()
            return

        is_assigned = await self.is_trainer_assigned()
        print(f"🟢 [CONNECT] Trainer Assigned Check Result: {is_assigned}")

        if not is_assigned:
            print(f"🔴 [CONNECT] Trainer not assigned to Batch ID {self.id} | Closing Connection")
            await self.close()
            return

        # ✅ Disconnect any old connection for same user+batch
        key = f"{self.user.id}_{self.id}"
        old_channel = active_connections.get(key)
        if old_channel and old_channel != self.channel_name:
            print(f"🟡 [CONNECT] Closing old WebSocket connection for key {key}")
            await self.channel_layer.send(old_channel, {
                "type": "force_disconnect",
            })

        # ✅ Register current connection
        active_connections[key] = self.channel_name

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        chat = await self.get_chat()
        if chat:
            print(f"🟢 [CONNECT] Chat Found for Batch ID {self.id}")
            messages = await self.get_previous_messages(chat)
            await self.send(text_data=json.dumps({
                'type': 'history',
                'messages': messages,
            }))
        else:
            print(f"🔴 [CONNECT] No Chat Found for Batch ID {self.id}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No chat found for this batch.'
            }))

    async def disconnect(self, close_code):
        print(f"🟡 [DISCONNECT] Closing connection | Group: {self.group_name}")
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        key = f"{self.user.id}_{self.id}"
        if key in active_connections and active_connections[key] == self.channel_name:
            del active_connections[key]

    async def receive(self, text_data):
        data = json.loads(text_data)
        action_type = data.get('type')

        if action_type == "fetch_messages":
            await self.fetch_chat_messages()

        elif action_type == "send_message":
            # --- SUPPORT BOTH NESTED AND FLAT PAYLOADS ---
            raw_message = data.get("message", "")
            # Default values for reply fields
            reply_to_id = data.get("reply_to")
            reply_to_text = data.get("reply_to_text")
            reply_to_send_by = data.get("reply_to_send_by")

            if isinstance(raw_message, dict):
                # Your current frontend: reply fields are nested
                message = raw_message.get("message", "")
                if reply_to_id is None:
                    reply_to_id = raw_message.get("reply_to")
                if reply_to_text is None:
                    reply_to_text = raw_message.get("reply_to_text")
                if reply_to_send_by is None:
                    reply_to_send_by = raw_message.get("reply_to_send_by")
            else:
                # Flat format
                message = raw_message

            file_name = data.get("file_name")
            file_size = data.get("file_size", 0)
            file_url = data.get("file_url")
            is_forwarded = data.get("is_forwarded", False)
            forwarded_from_id = data.get("forwarded_from")

            # --- Convert reply_to_id to int if present ---
            if reply_to_id is not None:
                try:
                    reply_to_id = int(reply_to_id)
                except Exception:
                    reply_to_id = None

            # Defensive: file_size must be int, not None/null/blank
            if file_size is None:
                file_size = 0
            try:
                file_size = int(file_size)
            except Exception:
                file_size = 0

            await self.save_and_broadcast_message(
                message=message,
                file_name=file_name,
                file_size=file_size,
                file_url=file_url,
                reply_to_id=reply_to_id,
                is_forwarded=is_forwarded,
                forwarded_from_id=forwarded_from_id,
            )

    async def force_disconnect(self, event):
        print(f"🟡 [FORCE DISCONNECT] Closing duplicate connection")
        await self.close()

    async def is_trainer_assigned(self):
        def check_trainer(batch_id, user):
            trainer = Trainer.objects.filter(email=user.email, trainer_id=user.username).first()
            print(f"🟢 [is_trainer_assigned] Trainer Lookup => Found: {bool(trainer)} | Trainer: {trainer}")
            if not trainer:
                return False
            exists = Batch.objects.filter(id=batch_id, trainer=trainer).exists()
            print(f"🟢 [is_trainer_assigned] Batch Assign Check => Exists: {exists}")
            return exists

        return await sync_to_async(check_trainer)(self.id, self.user)

    async def get_chat(self):
        def fetch_chat(batch_id):
            batch = Batch.objects.filter(id=batch_id).first()
            print(f"🟢 [get_chat] Batch Lookup => Found: {bool(batch)} | Batch ID: {batch_id}")
            if not batch:
                return None
            chat = Chats.objects.filter(batch=batch).first()
            print(f"🟢 [get_chat] Chat Lookup => Found: {bool(chat)} | Chat: {chat}")
            return chat

        return await sync_to_async(fetch_chat)(self.id)

    async def get_previous_messages(self, chat):
        print(f"🟢 [get_previous_messages] Fetching previous messages for Chat ID: {chat.id}")

        def fetch_msgs(chat):
            messages_queryset = ChatMessage.objects.filter(chat=chat).select_related('send_by', 'chat__batch', 'reply_to', 'forwarded_from')
            user_id = self.user.id
            messages = []
            for msg in messages_queryset:
                messages.append({
                    'id': msg.id,
                    'batch_code': msg.chat.batch.batch_id,
                    'sender': msg.sender,
                    'send_by': msg.send_by.first_name if msg.send_by else "Unknown",
                    'message': msg.message,
                    'gen_time': localtime(msg.gen_time).isoformat(),
                    'isSelf': (msg.send_by.id == user_id) if msg.send_by else False,
                    'reply_to': msg.reply_to.id if msg.reply_to else None,
                    'reply_to_message': msg.reply_to.message if msg.reply_to else None,
                    'reply_to_send_by': msg.reply_to.send_by.first_name if (msg.reply_to and msg.reply_to.send_by) else None,
                    'is_forwarded': msg.is_forwarded,
                    'forwarded_from': msg.forwarded_from.id if msg.forwarded_from else None,
                    'file_name': msg.file_name,
                    'file_size': msg.file_size,
                    'file_url': msg.file.url if msg.file else None,
                })
            return messages

        messages = await sync_to_async(fetch_msgs)(chat)
        return messages


    async def fetch_chat_messages(self):
        chat = await self.get_chat()
        if not chat:
            print(f"🔴 [fetch_chat_messages] No Chat Found for Batch ID {self.id}")
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
            return

        messages = await self.get_previous_messages(chat)
        batch = chat.batch
        batch_name = f"{batch.course.name} | {batch.batch_id}"

        print(f"🟢 [fetch_chat_messages] Sending Messages | Batch: {batch_name} | Total Messages: {len(messages)}")
        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'batch_name': batch_name,
            'messages': messages
        }))

    async def save_and_broadcast_message(self, message, file_name=None, file_size=0, file_url=None,
                                        reply_to_id=None, is_forwarded=False, forwarded_from_id=None):
        print(f"🟢 [save_and_broadcast_message] Incoming Message: {message}")
        print(f"🟢 [save_and_broadcast_message] reply_to_id: {reply_to_id}, forwarded_from_id: {forwarded_from_id}")

        chat = await self.get_chat()
        if not chat:
            print(f"🔴 [save_and_broadcast_message] No Chat Found to Save Message")
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'No chat found'}))
            return

        # Lookup reply and forwarded message objects
        reply_to = None
        if reply_to_id:
            reply_to = await sync_to_async(ChatMessage.objects.filter(id=reply_to_id).first)()
            if reply_to:
                print(f"🟢 [save_and_broadcast_message] Reply To Found: id={reply_to.id}, message='{reply_to.message}'")
            else:
                print("🟢 [save_and_broadcast_message] Reply To Found: None")

        forwarded_from = None
        if forwarded_from_id:
            forwarded_from = await sync_to_async(ChatMessage.objects.filter(id=forwarded_from_id).first)()
            if forwarded_from:
                print(f"🟢 [save_and_broadcast_message] Forwarded From Found: id={forwarded_from.id}, message='{forwarded_from.message}'")
            else:
                print("🟢 [save_and_broadcast_message] Forwarded From Found: None")

        msg = await sync_to_async(ChatMessage.objects.create)(
            chat=chat,
            sender=self.user.role,
            send_by=self.user,
            message=message,
            file_name=file_name,
            file_size=file_size,
            reply_to=reply_to,
            is_forwarded=is_forwarded,
            forwarded_from=forwarded_from,
            gen_time=timezone_now()
        )
        print(f"🟢 [save_and_broadcast_message] Message saved with id: {msg.id} and reply_to: {msg.reply_to.id if msg.reply_to else None}")

        # --- SAFELY FETCH RELATED FIELDS ---
        reply_to_message = None
        reply_to_send_by = None
        if reply_to:
            reply_to_message = await sync_to_async(lambda: reply_to.message)()
            reply_to_send_by = await sync_to_async(lambda: reply_to.send_by.first_name if reply_to.send_by else None)()

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
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
                'file_name': file_name,
                'file_size': file_size,
                'file_url': file_url,
            }
        )


    async def chat_message(self, event):
        is_self = (event.get('user_id') == self.user.id)
        print(f"🟢 [chat_message] Broadcasting Message | Sender: {event.get('send_by')} | Is Self: {is_self}")

        await self.send(text_data=json.dumps({
            'type': 'chat',
            'user': event['user'],
            'sender': event.get('sender', 'Unknown'),
            'send_by': event.get('send_by', 'Unknown'),
            'message': event['message'],
            'isSelf': is_self,
            'gen_time': event.get('gen_time', ''),
            'reply_to': event.get('reply_to'),
            'reply_to_message': event.get('reply_to_message'),
            'reply_to_send_by': event.get('reply_to_send_by'),
            'is_forwarded': event.get('is_forwarded', False),
            'forwarded_from': event.get('forwarded_from'),
            'file_name': event.get('file_name'),
            'file_size': event.get('file_size'),
            'file_url': event.get('file_url'),
        }))


{


# from channels.generic.websocket import AsyncWebsocketConsumer
# import json

# class TrainerBatchChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.batch_id = self.scope['url_route']['kwargs']['batch_id']
#         self.group_name = f"trainer_batch_chat_{self.batch_id}"

#         await self.channel_layer.group_add(
#             self.group_name,
#             self.channel_name
#         )
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'chat_message',
#                 'message': text_data
#             }
#         )

#     async def chat_message(self, event):
#         await self.send(text_data=event['message'])

}