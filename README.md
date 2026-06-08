# Sinfdosh 🎓

**Maktabdosh va sinfdoshlarni topish, ular bilan muloqot qilish va eski tanishlarni qayta bog'lash uchun ijtimoiy platforma.**

Telegram + Facebook uslubidagi zamonaviy ijtimoiy tarmoq. Hudud → maktab → sinf ierarxiyasi asosida sinfdoshlarni topish, real-time chat, do'stlik, postlar va bildirishnomalar.

---

## 🧱 Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Backend | Python, Django 5, Django REST Framework |
| Real-time | Django Channels + WebSocket + Redis |
| Auth | JWT (djangorestframework-simplejwt) |
| Ma'lumotlar bazasi | PostgreSQL 16 |
| Frontend | Next.js 14 (App Router), React 18, TailwindCSS |
| Server | Daphne (ASGI) |
| Konteyner | Docker + Docker Compose |

---

## 🚀 Tezkor ishga tushirish (Docker)

Talab: **Docker** va **Docker Compose** o'rnatilgan bo'lishi kerak.

```bash
# 1. Loyiha papkasiga kiring
cd sinfdosh

# 2. .env faylini tayyorlang (allaqachon mavjud, kerak bo'lsa tahrirlang)
cp .env.example .env    # agar .env bo'lmasa

# 3. Hamma servislarni ishga tushiring
docker compose up --build
```

Birinchi ishga tushishda avtomatik:
- ma'lumotlar bazasi migratsiyalari bajariladi,
- demo ma'lumotlar (hudud, maktab, sinf, foydalanuvchilar) yuklanadi.

### Manzillar

| Servis | URL |
|--------|-----|
| 🌐 Frontend (web ilova) | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000/api/ |
| 🛠 Admin panel | http://localhost:8000/admin/ |
| ❤️ Health check | http://localhost:8000/api/health/ |

### Demo loginlar

| Rol | Telefon | Parol |
|-----|---------|-------|
| Administrator | `+998900000000` | `admin12345` |
| Foydalanuvchi | `+998901111111` | `demo12345` |
| Foydalanuvchi | `+998902222222` | `demo12345` |

---

## 🗂 Loyiha tuzilishi

```
sinfdosh/
├── docker-compose.yml         # Barcha servislar (db, redis, backend, frontend)
├── .env                       # Muhit o'zgaruvchilari
├── backend/                   # Django + DRF
│   ├── config/                # settings, urls, asgi (WebSocket), wsgi
│   └── apps/
│       ├── accounts/          # User, auth, profil, qidiruv
│       ├── geo/               # viloyat, tuman, maktab, sinf
│       ├── friends/           # do'stlik so'rovlari
│       ├── chat/              # chat + WebSocket consumer
│       ├── posts/             # postlar, like, komment, shikoyat
│       └── notifications/     # bildirishnomalar + WebSocket
└── frontend/                  # Next.js (App Router)
    └── src/
        ├── app/               # sahifalar (login, register, feed, search, chat...)
        ├── components/        # Navbar, Shell, PostCard
        └── lib/               # api klient, auth context
```

---

## 📡 Asosiy API endpointlar

### Auth (`/api/auth/`)
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| POST | `/register/` | Ro'yxatdan o'tish |
| POST | `/login/` | Kirish (JWT access + refresh qaytaradi) |
| POST | `/refresh/` | Access tokenni yangilash |
| GET/PATCH | `/me/` | Joriy profil (ko'rish/tahrirlash) |
| GET | `/users/` | Foydalanuvchilar + qidiruv filtrlari |
| POST | `/users/{id}/block/` | Bloklash |

**Qidiruv filtrlari:** `?search=&region=&district=&school=&classroom=&graduation_year=&gender=`

### Geo (`/api/geo/`)
`regions/`, `districts/?region=`, `schools/?district=`, `classrooms/?school=`
(o'qish ochiq, yozish faqat admin)

### Friends (`/api/friends/`)
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| POST | `/` | So'rov yuborish (`{ "to_user": id }`) |
| POST | `/{id}/accept/` | Qabul qilish |
| POST | `/{id}/reject/` | Rad etish |
| GET | `/requests/` | Kelgan so'rovlar |
| GET | `/list_friends/` | Do'stlar ro'yxati |

### Chat (`/api/chat/`)
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/chats/` | Suhbatlar ro'yxati |
| POST | `/chats/private/` | Shaxsiy chat ochish (`{ "user_id": id }`) |
| GET | `/chats/{id}/messages/` | Xabarlar tarixi |

### Posts (`/api/posts/`)
`posts/` (CRUD), `posts/{id}/like/`, `posts/{id}/comments/`, `/api/reports/`

### Notifications (`/api/notifications/`)
`/`, `/unread_count/`, `/{id}/read/`, `/read_all/`

---

## 🔌 WebSocket (real-time)

JWT token **query string** orqali uzatiladi:

```
ws://localhost:8000/ws/chat/<chat_id>/?token=<ACCESS_TOKEN>
ws://localhost:8000/ws/notifications/?token=<ACCESS_TOKEN>
```

**Chat xabar yuborish formati:**
```json
{ "action": "message", "text": "Salom!" }
{ "action": "typing" }
```

---

## 🛠 Docker'siz lokal ishga tushirish

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# PostgreSQL va Redis lokal ishlab turishi kerak.
# .env'da POSTGRES_HOST=localhost, REDIS_URL=redis://localhost:6379/0 qiling.

python manage.py makemigrations accounts geo friends chat posts notifications
python manage.py migrate
python manage.py seed_demo
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ✅ MVP funksiyalari (tayyor)

- [x] Ro'yxatdan o'tish (hudud/maktab/sinf tanlash bilan)
- [x] JWT login + token yangilash
- [x] Profil (avatar, bio, tahrirlash, maxfiylik)
- [x] Sinfdoshlarni qidirish (filtrlar)
- [x] Do'stlik tizimi (so'rov/qabul/rad/bloklash)
- [x] Shaxsiy va guruh chatlari (real-time WebSocket, typing indicator)
- [x] Postlar, like, komment
- [x] Bildirishnomalar (real-time)
- [x] Admin panel (hudud, maktab, foydalanuvchi, kontent nazorati)

## 🔮 Keyingi bosqichlar
- SMS/Email tasdiqlash, Google/Telegram OAuth
- Media fayllar uchun MinIO/S3
- Story, video/voice call, marketplace
- Premium obuna, verified badge
- Mobil ilova (Flutter)

---

## ⚠️ Production eslatmalari
- `DJANGO_SECRET_KEY` ni kuchli qiymatga o'zgartiring va `DJANGO_DEBUG=False` qiling.
- `frontend` ni `npm run build && npm run start` orqali production rejimida ishga tushiring.
- Statik/media fayllar uchun Nginx + S3 sozlang.
- HTTPS uchun `wss://` WebSocket manzilidan foydalaning.
