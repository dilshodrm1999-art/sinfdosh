from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Classroom, District, Region, School
from .serializers import (
    ClassroomSerializer,
    DistrictSerializer,
    RegionSerializer,
    SchoolSerializer,
)


class ReadOrAdminMixin:
    """O'qish hammaga ochiq, yozish faqat admin uchun."""

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]


class RegionViewSet(ReadOrAdminMixin, viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    search_fields = ["name"]


class DistrictViewSet(ReadOrAdminMixin, viewsets.ModelViewSet):
    queryset = District.objects.select_related("region").all()
    serializer_class = DistrictSerializer
    filterset_fields = ["region"]
    search_fields = ["name"]


class SchoolViewSet(ReadOrAdminMixin, viewsets.ModelViewSet):
    queryset = School.objects.select_related("district", "district__region").all()
    serializer_class = SchoolSerializer
    filterset_fields = ["district", "district__region", "is_verified"]
    search_fields = ["name", "number"]


class ClassroomViewSet(ReadOrAdminMixin, viewsets.ModelViewSet):
    queryset = Classroom.objects.select_related("school").all()
    serializer_class = ClassroomSerializer
    filterset_fields = ["school", "graduation_year"]
    search_fields = ["name"]
