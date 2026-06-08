from django.conf import settings
from django.db import models


class Friendship(models.Model):
    """Do'stlik so'rovi / aloqasi."""

    class Status(models.TextChoices):
        PENDING = "pending", "Kutilmoqda"
        ACCEPTED = "accepted", "Qabul qilingan"
        REJECTED = "rejected", "Rad etilgan"

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_requests",
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_requests",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("from_user", "to_user")
        verbose_name = "Do'stlik"
        verbose_name_plural = "Do'stliklar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.from_user_id} -> {self.to_user_id} ({self.status})"
