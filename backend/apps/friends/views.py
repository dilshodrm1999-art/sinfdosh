from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.serializers import PublicUserSerializer
from apps.notifications.utils import notify

from .models import Friendship
from .serializers import FriendshipSerializer


class FriendshipViewSet(viewsets.ModelViewSet):
    """Do'stlik so'rovlarini boshqarish."""

    serializer_class = FriendshipSerializer

    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.select_related("from_user", "to_user").filter(
            Q(from_user=user) | Q(to_user=user)
        )

    def perform_create(self, serializer):
        to_user = serializer.validated_data["to_user"]
        fs = serializer.save(from_user=self.request.user)
        notify(
            recipient=to_user,
            actor=self.request.user,
            verb="friend_request",
            text="sizga do'stlik so'rovi yubordi",
        )
        return fs

    def create(self, request, *args, **kwargs):
        to_user_id = request.data.get("to_user")
        if str(to_user_id) == str(request.user.id):
            return Response(
                {"detail": "O'zingizga so'rov yubora olmaysiz"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Teskari yo'nalishda yoki mavjud so'rovni tekshirish
        existing = Friendship.objects.filter(
            Q(from_user=request.user, to_user_id=to_user_id)
            | Q(from_user_id=to_user_id, to_user=request.user)
        ).first()
        if existing:
            return Response(
                FriendshipSerializer(existing).data, status=status.HTTP_200_OK
            )
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        fs = self.get_object()
        if fs.to_user_id != request.user.id:
            return Response({"detail": "Ruxsat yo'q"}, status=403)
        fs.status = Friendship.Status.ACCEPTED
        fs.save(update_fields=["status", "updated_at"])
        notify(
            recipient=fs.from_user,
            actor=request.user,
            verb="friend_accept",
            text="do'stlik so'rovingizni qabul qildi",
        )
        return Response(FriendshipSerializer(fs).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        fs = self.get_object()
        if fs.to_user_id != request.user.id:
            return Response({"detail": "Ruxsat yo'q"}, status=403)
        fs.status = Friendship.Status.REJECTED
        fs.save(update_fields=["status", "updated_at"])
        return Response(FriendshipSerializer(fs).data)

    @action(detail=False, methods=["get"])
    def requests(self, request):
        """Menga kelgan kutilayotgan so'rovlar."""
        qs = Friendship.objects.select_related("from_user").filter(
            to_user=request.user, status=Friendship.Status.PENDING
        )
        return Response(FriendshipSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def list_friends(self, request):
        """Qabul qilingan do'stlar ro'yxati."""
        user = request.user
        qs = Friendship.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            status=Friendship.Status.ACCEPTED,
        ).select_related("from_user", "to_user")
        friends = []
        for fs in qs:
            friend = fs.to_user if fs.from_user_id == user.id else fs.from_user
            friends.append(friend)
        return Response(PublicUserSerializer(friends, many=True).data)
