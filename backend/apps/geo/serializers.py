from rest_framework import serializers

from .models import Classroom, District, Region, School


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name"]


class DistrictSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)

    class Meta:
        model = District
        fields = ["id", "name", "region", "region_name"]


class SchoolSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)
    region = serializers.IntegerField(source="district.region_id", read_only=True)

    class Meta:
        model = School
        fields = [
            "id",
            "name",
            "number",
            "logo",
            "is_verified",
            "district",
            "district_name",
            "region",
        ]


class ClassroomSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.name", read_only=True)

    class Meta:
        model = Classroom
        fields = ["id", "name", "graduation_year", "school", "school_name"]
