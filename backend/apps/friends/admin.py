from django.contrib import admin

from .models import Friendship


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ["id", "from_user", "to_user", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["from_user__phone", "to_user__phone"]
