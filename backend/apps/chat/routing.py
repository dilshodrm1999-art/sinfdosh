from django.urls import path, re_path

from apps.notifications.consumers import NotificationConsumer

from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<chat_id>\d+)/$", ChatConsumer.as_asgi()),
    path("ws/notifications/", NotificationConsumer.as_asgi()),
]
