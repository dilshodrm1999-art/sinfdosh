from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Telefon raqamni asosiy identifikator sifatida ishlatadigan manager."""

    use_in_migrations = True

    def _create_user(self, phone, password, **extra_fields):
        if not phone:
            raise ValueError("Telefon raqam majburiy")
        email = extra_fields.pop("email", "")
        if email:
            email = self.normalize_email(email)
        user = self.model(phone=phone, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, password, **extra_fields)

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser uchun is_staff=True bo'lishi kerak")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser uchun is_superuser=True bo'lishi kerak")
        return self._create_user(phone, password, **extra_fields)


class User(AbstractUser):
    """Maxsus foydalanuvchi modeli — telefon raqam orqali kirish."""

    class Role(models.TextChoices):
        USER = "user", "Foydalanuvchi"
        MODERATOR = "moderator", "Moderator"
        ADMIN = "admin", "Administrator"

    class Gender(models.TextChoices):
        MALE = "male", "Erkak"
        FEMALE = "female", "Ayol"

    # username'ni o'chiramiz, phone asosiy bo'ladi
    username = None
    phone = models.CharField("Telefon", max_length=20, unique=True)
    email = models.EmailField("Email", blank=True)

    birth_year = models.PositiveIntegerField("Tug'ilgan yil", null=True, blank=True)
    gender = models.CharField(
        "Jins", max_length=10, choices=Gender.choices, blank=True
    )
    role = models.CharField(
        "Rol", max_length=20, choices=Role.choices, default=Role.USER
    )

    # Geo bog'lanish
    region = models.ForeignKey(
        "geo.Region", on_delete=models.SET_NULL, null=True, blank=True
    )
    district = models.ForeignKey(
        "geo.District", on_delete=models.SET_NULL, null=True, blank=True
    )
    school = models.ForeignKey(
        "geo.School", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="students",
    )
    classroom = models.ForeignKey(
        "geo.Classroom", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="students",
    )
    graduation_year = models.PositiveIntegerField(
        "Bitirgan yil", null=True, blank=True
    )

    # Profil
    avatar = models.ImageField("Avatar", upload_to="avatars/", blank=True, null=True)
    cover = models.ImageField("Muqova", upload_to="covers/", blank=True, null=True)
    bio = models.TextField("Bio", blank=True)
    living_place = models.CharField("Yashash joyi", max_length=200, blank=True)
    social_links = models.JSONField("Ijtimoiy tarmoqlar", default=dict, blank=True)

    # Maxfiylik / holat
    phone_hidden = models.BooleanField("Telefon yashirin", default=True)
    is_verified = models.BooleanField("Tasdiqlangan", default=False)
    is_online = models.BooleanField("Online", default=False)
    last_active = models.DateTimeField("Oxirgi faollik", default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        verbose_name = "Foydalanuvchi"
        verbose_name_plural = "Foydalanuvchilar"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.phone})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_moderator(self):
        return self.role in (self.Role.MODERATOR, self.Role.ADMIN) or self.is_staff


class Block(models.Model):
    """Foydalanuvchini bloklash."""

    blocker = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blocking"
    )
    blocked = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blocked_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")
        verbose_name = "Bloklash"
        verbose_name_plural = "Bloklashlar"
