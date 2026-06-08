from django.contrib import admin

from .models import Comment, Like, Post, Report


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["id", "author", "text", "created_at"]
    search_fields = ["text", "author__phone"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["id", "post", "author", "text", "created_at"]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["id", "reporter", "reported_user", "post", "status", "created_at"]
    list_filter = ["status"]
    list_editable = ["status"]


admin.site.register(Like)
