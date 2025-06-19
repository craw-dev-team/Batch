"""
ASGI config for HackersBridge project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

# import os

# # ✅ MUST be set before importing any Django modules
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HackersBridge.settings')

# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from HackersBridge.routing import websocket_urlpatterns as get_websocket_urlpatterns

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(get_websocket_urlpatterns())
#     ),
# })


# asgi.py
import os

# ✅ Set env variable before importing Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HackersBridge.settings')

import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack
from HackersBridge.routing import websocket_urlpatterns as get_websocket_urlpatterns

# ✅ Import your custom JWT WebSocket middleware
from HackersBridge.middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        SessionMiddlewareStack(
            URLRouter(get_websocket_urlpatterns())
        )
    ),
})
