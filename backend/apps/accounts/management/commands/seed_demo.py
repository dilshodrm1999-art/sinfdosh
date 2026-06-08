"""Demo ma'lumotlar bilan bazani to'ldirish.

Foydalanish:
    python manage.py seed_demo            # har doim qo'shadi
    python manage.py seed_demo --if-empty # faqat baza bo'sh bo'lsa
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.geo.models import Classroom, District, Region, School

User = get_user_model()


class Command(BaseCommand):
    help = "Demo ma'lumotlar yaratadi (hudud, maktab, sinf, foydalanuvchilar)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--if-empty",
            action="store_true",
            help="Faqat foydalanuvchilar jadvali bo'sh bo'lsa ishlaydi",
        )

    def handle(self, *args, **options):
        if options["if_empty"] and User.objects.exists():
            self.stdout.write("Baza bo'sh emas — seed o'tkazib yuborildi.")
            return

        # --- Superuser / Admin ---
        if not User.objects.filter(phone="+998900000000").exists():
            admin = User.objects.create_superuser(
                phone="+998900000000",
                password="admin12345",
                first_name="Admin",
                last_name="Sinfdosh",
            )
            self.stdout.write(self.style.SUCCESS(f"Admin yaratildi: {admin.phone} / admin12345"))

        # --- Hudud ---
        region, _ = Region.objects.get_or_create(name="Toshkent shahri")
        district, _ = District.objects.get_or_create(region=region, name="Chilonzor tumani")
        district2, _ = District.objects.get_or_create(region=region, name="Yunusobod tumani")

        school, _ = School.objects.get_or_create(
            district=district, name="123-maktab", defaults={"number": "123", "is_verified": True}
        )
        school2, _ = School.objects.get_or_create(
            district=district2, name="56-maktab", defaults={"number": "56", "is_verified": True}
        )

        classroom, _ = Classroom.objects.get_or_create(
            school=school, name="11-A", graduation_year=2015
        )
        classroom_b, _ = Classroom.objects.get_or_create(
            school=school, name="11-B", graduation_year=2015
        )
        Classroom.objects.get_or_create(
            school=school2, name="9-A", graduation_year=2018
        )

        # --- Demo foydalanuvchilar ---
        demo_users = [
            ("+998901111111", "Ali", "Valiyev", "male"),
            ("+998902222222", "Vali", "Aliyev", "male"),
            ("+998903333333", "Gulnora", "Karimova", "female"),
            ("+998904444444", "Sardor", "Tursunov", "male"),
            ("+998905555555", "Dilnoza", "Yusupova", "female"),
        ]
        created = 0
        for phone, fn, ln, gender in demo_users:
            if User.objects.filter(phone=phone).exists():
                continue
            User.objects.create_user(
                phone=phone,
                password="demo12345",
                first_name=fn,
                last_name=ln,
                gender=gender,
                region=region,
                district=district,
                school=school,
                classroom=classroom,
                graduation_year=2015,
                is_verified=True,
            )
            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed tugadi. {created} ta demo foydalanuvchi yaratildi. "
                f"Parol: demo12345"
            )
        )
