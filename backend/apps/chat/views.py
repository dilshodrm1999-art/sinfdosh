from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer

User = get_user_model()


class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer

    def get_queryset(self):
        user = self.request.user
        # Foydalanuvchi a'zo bo'lgan chatlar + ochiq guruh chatlari (global)
        return (
            Chat.objects.filter(Q(members=user) | Q(type=Chat.Type.GLOBAL))
            .distinct()
            .prefetch_related("members")
        )

    @action(detail=False, methods=["post"])
    def private(self, request):
        """Boshqa foydalanuvchi bilan shaxsiy chat ochish (mavjud bo'lsa qaytaradi)."""
        other_id = request.data.get("user_id")
        if not other_id:
            return Response({"detail": "user_id majburiy"}, status=400)
        if str(other_id) == str(request.user.id):
            return Response({"detail": "O'zingiz bilan chat bo'lmaydi"}, status=400)

        existing = (
            Chat.objects.filter(type=Chat.Type.PRIVATE, members=request.user)
            .filter(members__id=other_id)
            .first()
        )
        if existing:
            return Response(ChatSerializer(existing, context={"request": request}).data)

        other = User.objects.filter(id=other_id).first()
        if not other:
            return Response({"detail": "Foydalanuvchi topilmadi"}, status=404)
        chat = Chat.objects.create(type=Chat.Type.PRIVATE)
        chat.members.add(request.user, other)
        return Response(
            ChatSerializer(chat, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        chat = self.get_object()
        qs = chat.messages.filter(is_deleted=False).select_related("sender")
        # O'qildi deb belgilash
        chat.messages.filter(is_read=False).exclude(sender=request.user).update(
            is_read=True
        )
        page = self.paginate_queryset(qs)
        serializer = MessageSerializer(page, many=True, context={"request": request})
        return self.get_paginated_response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(chat__members=user) | Q(chat__type=Chat.Type.GLOBAL)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def perform_destroy(self, instance):
        # Haqiqatda o'chirmaymiz — soft delete
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
