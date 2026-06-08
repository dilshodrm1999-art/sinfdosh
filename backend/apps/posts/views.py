from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.utils import notify

from .models import Comment, Like, Post, Report
from .serializers import (
    CommentSerializer,
    PostSerializer,
    ReportSerializer,
)


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["author"]

    def get_queryset(self):
        return Post.objects.select_related("author").prefetch_related(
            "likes", "comments"
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Bu post sizniki emas")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author_id != self.request.user.id and not self.request.user.is_moderator:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Ruxsat yo'q")
        instance.delete()

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(post=post, user=request.user)
        if not created:
            like.delete()
            return Response({"liked": False, "likes_count": post.likes.count()})
        if post.author_id != request.user.id:
            notify(
                recipient=post.author,
                actor=request.user,
                verb="like",
                text="postingizni yoqtirdi",
                target_url=f"/posts/{post.id}",
            )
        return Response({"liked": True, "likes_count": post.likes.count()})

    @action(detail=True, methods=["get", "post"])
    def comments(self, request, pk=None):
        post = self.get_object()
        if request.method == "GET":
            qs = post.comments.select_related("author")
            return Response(CommentSerializer(qs, many=True).data)
        # POST — yangi komment
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "Matn bo'sh"}, status=400)
        comment = Comment.objects.create(post=post, author=request.user, text=text)
        if post.author_id != request.user.id:
            notify(
                recipient=post.author,
                actor=request.user,
                verb="comment",
                text="postingizga komment qoldirdi",
                target_url=f"/posts/{post.id}",
            )
        return Response(
            CommentSerializer(comment).data, status=status.HTTP_201_CREATED
        )


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_moderator:
            return Report.objects.all()
        return Report.objects.filter(reporter=user)

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
