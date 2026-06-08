from django.contrib.auth import get_user_model
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Block
from .serializers import (
    PublicUserSerializer,
    RegisterSerializer,
    TokenSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Ro'yxatdan o'tish."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    """Telefon + parol orqali JWT olish."""

    serializer_class = TokenSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    """Joriy foydalanuvchi profili (ko'rish/tahrirlash)."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Boshqa foydalanuvchilar profillari + qidiruv."""

    queryset = User.objects.select_related(
        "region", "district", "school", "classroom"
    ).all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = [
        "region",
        "district",
        "school",
        "classroom",
        "graduation_year",
        "gender",
    ]
    search_fields = ["first_name", "last_name", "phone"]
    ordering_fields = ["created_at", "first_name"]

    def get_queryset(self):
        qs = super().get_queryset()
        # Meni bloklaganlar va men bloklaganlarni chiqarib tashlash
        blocked_ids = Block.objects.filter(blocker=self.request.user).values_list(
            "blocked_id", flat=True
        )
        blocked_by_ids = Block.objects.filter(blocked=self.request.user).values_list(
            "blocker_id", flat=True
        )
        return qs.exclude(id__in=list(blocked_ids) + list(blocked_by_ids))

    @action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        target = self.get_object()
        if target.id == request.user.id:
            return Response(
                {"detail": "O'zingizni bloklay olmaysiz"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        Block.objects.get_or_create(blocker=request.user, blocked=target)
        return Response({"detail": "Bloklandi"})

    @action(detail=True, methods=["post"])
    def unblock(self, request, pk=None):
        Block.objects.filter(blocker=request.user, blocked_id=pk).delete()
        return Response({"detail": "Blokdan chiqarildi"})
