#!/usr/bin/env bash
#
# GitHub Codespaces uchun avtomatik sozlash va ishga tushirish skripti.
# - Codespaces forwarded URL'larini aniqlaydi (frontend backend'ga to'g'ri ulanishi uchun)
# - .env faylini tayyorlaydi
# - docker compose orqali hamma servislarni ishga tushiradi
#
set -e

# Loyiha ildiziga o'tish (skript .devcontainer/ ichida)
cd "$(dirname "$0")/.."

echo "==> Sinfdosh sozlanmoqda..."

# .env mavjud bo'lmasa, namunadan yaratamiz
if [ ! -f .env ]; then
  cp .env.example .env
fi

# --- GitHub Codespaces forwarded URL'lari ---
if [ -n "$CODESPACE_NAME" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  API_URL="https://${CODESPACE_NAME}-8000.${DOMAIN}"
  WEB_URL="https://${CODESPACE_NAME}-3000.${DOMAIN}"

  # Frontend (brauzerda ishlaydi) backend'ga forwarded URL orqali ulanadi
  export NEXT_PUBLIC_API_URL="${API_URL}"
  export NEXT_PUBLIC_WS_URL="${API_URL/https:/wss:}"

  # Backend CORS/CSRF uchun frontend manzilini .env ga yozamiz
  if grep -q '^FRONTEND_ORIGIN=' .env; then
    sed -i "s|^FRONTEND_ORIGIN=.*|FRONTEND_ORIGIN=${WEB_URL}|" .env
  else
    echo "FRONTEND_ORIGIN=${WEB_URL}" >> .env
  fi
  if grep -q '^CORS_ALLOWED_ORIGINS=' .env; then
    sed -i "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=${WEB_URL}|" .env
  else
    echo "CORS_ALLOWED_ORIGINS=${WEB_URL}" >> .env
  fi

  echo "==> Frontend API manzili: ${API_URL}"
  echo "==> Frontend veb manzili:  ${WEB_URL}"

  # Portlarni ommaviy (public) qilishga urinish — best-effort
  gh codespace ports visibility 8000:public 3000:public -c "$CODESPACE_NAME" 2>/dev/null || \
    echo "(!) Portlarni avtomatik public qila olmadim — kerak bo'lsa 'Ports' tabida 8000 ni Public qiling."
fi

# --- Servislarni ishga tushirish ---
echo "==> Docker konteynerlar qurilmoqda va ishga tushmoqda (biroz vaqt oladi)..."
docker compose up -d --build

echo ""
echo "================================================================"
echo " Sinfdosh tayyor!"
if [ -n "$CODESPACE_NAME" ]; then
  echo " Veb ilova:  https://${CODESPACE_NAME}-3000.${DOMAIN}"
  echo " Backend:    https://${CODESPACE_NAME}-8000.${DOMAIN}/api/"
  echo " Admin:      https://${CODESPACE_NAME}-8000.${DOMAIN}/admin/"
else
  echo " Veb ilova:  http://localhost:3000"
  echo " Backend:    http://localhost:8000/api/"
fi
echo " Demo login: +998901111111 / demo12345"
echo " Admin:      +998900000000 / admin12345"
echo "================================================================"
