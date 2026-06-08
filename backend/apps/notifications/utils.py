"""Bildirishnoma yaratish va real-time yuborish yordamchilari."""
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification


def notify(recipient, verb, actor=None, text="", target_url=""):
    """Bildirishnoma yaratadi va WebSocket orqali yuboradi."""
    if recipient is None:
        return None
    notification = Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
        text=text,
        target_url=target_url,
    )

    # Real-time push (WebSocket guruhi: notifications_<user_id>)
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        actor_name = actor.full_name if actor else ""
        try:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{recipient.id}",
                {
                    "type": "notify",
                    "data": {
                        "id": notification.id,
                        "verb": verb,
                        "text": text,
                        "actor": actor_name,
                        "actor_id": actor.id if actor else None,
                        "created_at": notification.created_at.isoformat(),
                    },
                },
            )
        except Exception:
            # Redis ishlamasa ham bildirishnoma DB'da saqlanib qoladi
            pass
    return notification
