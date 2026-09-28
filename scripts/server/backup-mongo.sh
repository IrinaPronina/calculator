#!/usr/bin/env bash
# Ежедневный бэкап Mongo из docker compose. Запускается по cron на сервере.
# Хранит 14 локальных архивов; при заданном S3_BUCKET копирует в S3 (Timeweb S3, s3cmd или aws cli).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/calculator}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/calculator}"
KEEP_DAYS="${KEEP_DAYS:-14}"
S3_BUCKET="${S3_BUCKET:-}"          # напр. s3://calculator-backups
STAMP="$(date +%F_%H-%M)"
FILE="$BACKUP_DIR/mongo-$STAMP.archive.gz"

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

docker compose exec -T mongo mongodump --archive --gzip > "$FILE"
test -s "$FILE" || { echo "backup empty: $FILE" >&2; exit 1; }

find "$BACKUP_DIR" -name 'mongo-*.archive.gz' -mtime +"$KEEP_DAYS" -delete

if [ -n "$S3_BUCKET" ]; then
  if command -v aws >/dev/null; then
    aws s3 cp "$FILE" "$S3_BUCKET/$(basename "$FILE")" --only-show-errors
  elif command -v s3cmd >/dev/null; then
    s3cmd put --quiet "$FILE" "$S3_BUCKET/$(basename "$FILE")"
  else
    echo "S3_BUCKET задан, но нет aws/s3cmd" >&2; exit 1
  fi
fi

echo "ok $FILE ($(du -h "$FILE" | cut -f1))"
