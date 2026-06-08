from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Foydalanuvchi bildirishnomasi."""

    class Verb(models.TextChoices):
        FRIEND_REQUEST = "friend_request", "Do'stlik so'rovi"
        FRIEND_ACCEPT = "friend_accept", "Do'stlik qabul qilindi"
        MESSAGE = "message", "Yangi xabar"
        LIKE = "like", "Like"
        COMMENT = "comment", "Komment"
        PROFILE_VISIT = "profile_visit", "Profilga tashrif"
        NEW_CLASSMATE = "new_classmate", "Yangi sinfdosh"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="actions",
        null=True,
        blank=True,
    )
    verb = models.CharField(max_length=30, choices=Verb.choices)
    text = models.CharField(max_length=255, blank=True)
    target_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bildirishnoma"
        verbose_name_plural = "Bildirishnomalar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.verb} -> {self.recipient_id}"
