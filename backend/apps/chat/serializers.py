from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer

from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_detail = PublicUserSerializer(source="sender", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "chat",
            "sender",
            "sender_detail",
            "kind",
            "text",
            "attachment",
            "reply_to",
            "is_read",
            "is_deleted",
            "created_at",
        ]
        read_only_fields = ["sender", "is_read", "is_deleted"]


class ChatSerializer(serializers.ModelSerializer):
    members_detail = PublicUserSerializer(source="members", many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "type",
            "title",
            "members",
            "members_detail",
            "school",
            "classroom",
            "last_message",
            "unread_count",
            "updated_at",
        ]
        read_only_fields = ["members"]

    def get_last_message(self, obj):
        msg = obj.messages.filter(is_deleted=False).order_by("-created_at").first()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(
            sender=request.user
        ).count()
