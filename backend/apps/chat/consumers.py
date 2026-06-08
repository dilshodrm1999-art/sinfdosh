"""Chat uchun real-time WebSocket consumer."""
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.group_name = f"chat_{self.chat_id}"

        if self.user is None or not self.user.is_authenticated:
            await self.close()
            return

        is_member = await self.is_member()
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.set_online(True)

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )
        if getattr(self, "user", None) and self.user.is_authenticated:
            await self.set_online(False)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data or "{}")
        action = data.get("action", "message")

        if action == "typing":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "typing",
                    "user_id": self.user.id,
                    "user_name": self.user.full_name,
                },
            )
            return

        if action == "message":
            text = (data.get("text") or "").strip()
            reply_to = data.get("reply_to")
            if not text:
                return
            message = await self.save_message(text, reply_to)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "message": {
                        "id": message["id"],
                        "chat": int(self.chat_id),
                        "text": message["text"],
                        "sender": self.user.id,
                        "sender_name": self.user.full_name,
                        "reply_to": reply_to,
                        "created_at": message["created_at"],
                    },
                },
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({"event": "message", **event["message"]}))

    async def typing(self, event):
        if event["user_id"] != self.user.id:
            await self.send(
                text_data=json.dumps(
                    {
                        "event": "typing",
                        "user_id": event["user_id"],
                        "user_name": event["user_name"],
                    }
                )
            )

    # --- DB yordamchilari ---
    @database_sync_to_async
    def is_member(self):
        from .models import Chat

        chat = Chat.objects.filter(id=self.chat_id).first()
        if not chat:
            return False
        if chat.type == Chat.Type.GLOBAL:
            return True
        return chat.members.filter(id=self.user.id).exists()

    @database_sync_to_async
    def save_message(self, text, reply_to):
        from .models import Chat, Message

        msg = Message.objects.create(
            chat_id=self.chat_id,
            sender=self.user,
            text=text,
            reply_to_id=reply_to,
        )
        Chat.objects.filter(id=self.chat_id).update(updated_at=msg.created_at)
        return {
            "id": msg.id,
            "text": msg.text,
            "created_at": msg.created_at.isoformat(),
        }

    @database_sync_to_async
    def set_online(self, online):
        from django.utils import timezone

        type(self.user).objects.filter(id=self.user.id).update(
            is_online=online, last_active=timezone.now()
        )
