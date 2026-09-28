#!/usr/bin/env bash
# Деплой из git на сервере: бэкап → pull → build → migrate → health-check.
# Использование: /opt/calculator/scripts/server/deploy.sh [ветка]   (по умолчанию main)
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/calculator}"
BRANCH="${1:-main}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"

cd "$APP_DIR"

echo "== 1/5 бэкап базы перед выкаткой"
"$APP_DIR/scripts/server/backup-mongo.sh"

echo "== 2/5 git: $BRANCH"
PREV="$(git rev-parse --short HEAD)"
git fetch --prune origin
git checkout -q "$BRANCH"
git reset -q --hard "origin/$BRANCH"
echo "   $PREV -> $(git rev-parse --short HEAD)"

echo "== 3/5 сборка и перезапуск"
docker compose up -d --build

echo "== 4/5 миграции"
DB_URL='mongodb://localhost:27017/?directConnection=true' DB_NAME="${DB_NAME:-calculator}" npx --yes migrate-mongo up

echo "== 5/5 проверка"
for i in $(seq 1 20); do
  if curl -fsS -o /dev/null "$HEALTH_URL"; then echo "   ok: $HEALTH_URL"; exit 0; fi
  sleep 3
done
echo "   приложение не ответило за 60 с. Откат: git reset --hard $PREV && docker compose up -d --build" >&2
docker compose logs --tail=50 app >&2
exit 1
