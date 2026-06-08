from django.conf import settings
from django.db import models


class Post(models.Model):
    """Foydalanuvchi posti."""

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts"
    )
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to="posts/images/", blank=True, null=True)
    video = models.FileField(upload_to="posts/videos/", blank=True, null=True)
    # Repost — boshqa postga havola
    repost_of = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="reposts"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Postlar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author_id}: {self.text[:30]}"


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "user")


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Komment"
        verbose_name_plural = "Kommentlar"
        ordering = ["created_at"]


class Report(models.Model):
    """Shikoyat — post, komment yoki foydalanuvchi ustidan."""

    class Status(models.TextChoices):
        OPEN = "open", "Ochiq"
        RESOLVED = "resolved", "Hal qilingan"
        REJECTED = "rejected", "Rad etilgan"

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports_made"
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports_received",
        null=True,
        blank=True,
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, null=True, blank=True
    )
    reason = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Shikoyat"
        verbose_name_plural = "Shikoyatlar"
        ordering = ["-created_at"]
