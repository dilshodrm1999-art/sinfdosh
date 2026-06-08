from django.db import models


class Region(models.Model):
    """Viloyat."""

    name = models.CharField("Nomi", max_length=120, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Viloyat"
        verbose_name_plural = "Viloyatlar"
        ordering = ["name"]

    def __str__(self):
        return self.name


class District(models.Model):
    """Shahar / Tuman."""

    region = models.ForeignKey(
        Region, on_delete=models.CASCADE, related_name="districts"
    )
    name = models.CharField("Nomi", max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Shahar/Tuman"
        verbose_name_plural = "Shahar/Tumanlar"
        ordering = ["name"]
        unique_together = ("region", "name")

    def __str__(self):
        return f"{self.name} ({self.region.name})"


class School(models.Model):
    """Maktab."""

    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name="schools"
    )
    name = models.CharField("Nomi", max_length=200)
    number = models.CharField("Raqami", max_length=20, blank=True)
    logo = models.ImageField("Logo", upload_to="schools/logos/", blank=True, null=True)
    is_verified = models.BooleanField("Tasdiqlangan", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Maktab"
        verbose_name_plural = "Maktablar"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Classroom(models.Model):
    """Sinf (bir maktab ichida, bitiruv yili bilan)."""

    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="classrooms"
    )
    name = models.CharField("Sinf nomi", max_length=20, help_text="Masalan: 11-A")
    graduation_year = models.PositiveIntegerField("Bitiruv yili")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sinf"
        verbose_name_plural = "Sinflar"
        ordering = ["-graduation_year", "name"]
        unique_together = ("school", "name", "graduation_year")

    def __str__(self):
        return f"{self.school.name} — {self.name} ({self.graduation_year})"
