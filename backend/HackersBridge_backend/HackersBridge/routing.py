from django.urls import path
from django.utils.module_loading import import_string

def websocket_urlpatterns():
    MySyncConsumer = import_string('Student_login.consumers.MySyncConsumer')
    StudentBatchChatConsumer = import_string('Student_login.consumers.StudentBatchChatConsumer')
    BatchChatConsumer = import_string('Student_login.consumers.BatchChatConsumer')
    BatchChatAndMessageConsumer = import_string('nexus.consumers.BatchChatAndMessageConsumer')

    return [
        path("ws/test/", MySyncConsumer.as_asgi()),
        path("ws/batchchat/<int:id>/", StudentBatchChatConsumer.as_asgi()),
        path("ws/batch-chat/<int:id>/", BatchChatConsumer.as_asgi()),
        path("ws/admin-batch-chat/<int:id>/", BatchChatAndMessageConsumer.as_asgi()),
    ]
