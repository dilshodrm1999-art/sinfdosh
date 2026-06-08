from django.conf import settings
from django.db import models


class Chat(models.Model):
    """Suhbat — shaxsiy (private) yoki guruh (group)."""

    class Type(models.TextChoices):
        PRIVATE = "private", "Shaxsiy"
        SCHOOL = "school", "Maktab"
        CLASSROOM = "classroom", "Sinf"
        REGION = "region", "Hududiy"
        GLOBAL = "global", "Global"

    type = models.CharField(max_length=20, choices=Type.choices, default=Type.PRIVATE)
    title = models.CharField(max_length=200, blank=True)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="chats", blank=True
    )
    # Guruh chatlari uchun bog'lanish (ixtiyoriy)
    school = models.ForeignKey(
        "geo.School", on_delete=models.CASCADE, null=True, blank=True
    )
    classroom = models.ForeignKey(
        "geo.Classroom", on_delete=models.CASCADE, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Chat"
        verbose_name_plural = "Chatlar"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title or f"Chat #{self.id} ({self.type})"


class Message(models.Model):
    """Chat xabari."""

    class Kind(models.TextChoices):
        TEXT = "text", "Matn"
        IMAGE = "image", "Rasm"
        VIDEO = "video", "Video"
        AUDIO = "audio", "Audio"
        FILE = "file", "Fayl"

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.TEXT)
    text = models.TextField(blank=True)
    attachment = models.FileField(
        upload_to="chat/attachments/", blank=True, null=True
    )
    reply_to = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies"
    )
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Xabar"
        verbose_name_plural = "Xabarlar"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender_id}: {self.text[:30]}"


class PinnedMessage(models.Model):
    """Guruh chatlarida pin qilingan xabar."""

    chat = models.OneToOneField(
        Chat, on_delete=models.CASCADE, related_name="pinned"
    )
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    pinned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
