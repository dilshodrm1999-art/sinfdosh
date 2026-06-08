from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer

from .models import Friendship


class FriendshipSerializer(serializers.ModelSerializer):
    from_user_detail = PublicUserSerializer(source="from_user", read_only=True)
    to_user_detail = PublicUserSerializer(source="to_user", read_only=True)

    class Meta:
        model = Friendship
        fields = [
            "id",
            "from_user",
            "to_user",
            "from_user_detail",
            "to_user_detail",
            "status",
            "created_at",
        ]
        read_only_fields = ["from_user", "status"]
