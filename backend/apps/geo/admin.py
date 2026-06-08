from django.contrib import admin

from .models import Classroom, District, Region, School


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_at"]
    search_fields = ["name"]


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "region", "created_at"]
    list_filter = ["region"]
    search_fields = ["name"]


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "number", "district", "is_verified"]
    list_filter = ["is_verified", "district__region"]
    search_fields = ["name", "number"]
    list_editable = ["is_verified"]


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "graduation_year", "school"]
    list_filter = ["graduation_year"]
    search_fields = ["name", "school__name"]
