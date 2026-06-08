from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.geo.serializers import (
    ClassroomSerializer,
    DistrictSerializer,
    RegionSerializer,
    SchoolSerializer,
)

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "email",
            "first_name",
            "last_name",
            "birth_year",
            "gender",
            "password",
            "password2",
            "region",
            "district",
            "school",
            "classroom",
            "graduation_year",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password2": "Parollar mos emas"})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class PublicUserSerializer(serializers.ModelSerializer):
    """Boshqalarga ko'rinadigan qisqa profil."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "avatar",
            "is_online",
            "is_verified",
            "role",
        ]


class UserSerializer(serializers.ModelSerializer):
    """To'liq profil — geo ma'lumotlar bilan."""

    full_name = serializers.CharField(read_only=True)
    region_detail = RegionSerializer(source="region", read_only=True)
    district_detail = DistrictSerializer(source="district", read_only=True)
    school_detail = SchoolSerializer(source="school", read_only=True)
    classroom_detail = ClassroomSerializer(source="classroom", read_only=True)
    phone_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "phone_display",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "birth_year",
            "gender",
            "role",
            "avatar",
            "cover",
            "bio",
            "living_place",
            "social_links",
            "phone_hidden",
            "is_verified",
            "is_online",
            "last_active",
            "graduation_year",
            "region",
            "district",
            "school",
            "classroom",
            "region_detail",
            "district_detail",
            "school_detail",
            "classroom_detail",
        ]
        read_only_fields = ["role", "is_verified", "is_online", "last_active", "phone"]

    def get_phone_display(self, obj):
        request = self.context.get("request")
        is_self = request and request.user.is_authenticated and request.user.id == obj.id
        if obj.phone_hidden and not is_self:
            return None
        return obj.phone


class TokenSerializer(TokenObtainPairSerializer):
    """Login javobiga foydalanuvchi ma'lumotini qo'shamiz."""

    username_field = "phone"

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user, context=self.context).data
        return data
