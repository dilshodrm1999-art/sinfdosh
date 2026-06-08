"""
ASGI konfiguratsiyasi — HTTP (Django) va WebSocket (Channels) uchun.
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Django ASGI ilovasini avval ishga tushiramiz (apps tayyor bo'lishi uchun)
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402

from apps.chat.middleware import JWTAuthMiddleware  # noqa: E402
from apps.chat.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
