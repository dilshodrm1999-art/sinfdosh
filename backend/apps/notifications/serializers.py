from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_detail = PublicUserSerializer(source="actor", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "verb",
            "text",
            "target_url",
            "is_read",
            "actor",
            "actor_detail",
            "created_at",
        ]
        read_only_fields = fields
