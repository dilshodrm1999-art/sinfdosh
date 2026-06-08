from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer

from .models import Comment, Like, Post, Report


class CommentSerializer(serializers.ModelSerializer):
    author_detail = PublicUserSerializer(source="author", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "post", "author", "author_detail", "text", "created_at"]
        read_only_fields = ["author"]


class PostSerializer(serializers.ModelSerializer):
    author_detail = PublicUserSerializer(source="author", read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_detail",
            "text",
            "image",
            "video",
            "repost_of",
            "likes_count",
            "comments_count",
            "is_liked",
            "created_at",
        ]
        read_only_fields = ["author"]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "reporter",
            "reported_user",
            "post",
            "reason",
            "status",
            "created_at",
        ]
        read_only_fields = ["reporter", "status"]
