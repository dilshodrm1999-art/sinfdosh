from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Block, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-created_at"]
    list_display = [
        "id",
        "phone",
        "first_name",
        "last_name",
        "role",
        "school",
        "is_verified",
        "is_online",
    ]
    list_filter = ["role", "is_verified", "gender", "is_online"]
    search_fields = ["phone", "first_name", "last_name", "email"]
    list_editable = ["is_verified", "role"]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Shaxsiy", {"fields": ("first_name", "last_name", "email", "birth_year", "gender")}),
        ("Geo", {"fields": ("region", "district", "school", "classroom", "graduation_year")}),
        ("Profil", {"fields": ("avatar", "cover", "bio", "living_place", "social_links")}),
        ("Holat", {"fields": ("role", "is_verified", "is_online", "phone_hidden")}),
        ("Ruxsatlar", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "first_name", "last_name", "password1", "password2"),
        }),
    )


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ["id", "blocker", "blocked", "created_at"]
