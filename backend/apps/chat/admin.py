from django.contrib import admin

from .models import Chat, Message, PinnedMessage


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ["id", "type", "title", "updated_at"]
    list_filter = ["type"]
    filter_horizontal = ["members"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "chat", "sender", "kind", "is_read", "is_deleted", "created_at"]
    list_filter = ["kind", "is_read", "is_deleted"]
    search_fields = ["text"]


admin.site.register(PinnedMessage)
