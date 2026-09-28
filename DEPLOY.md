# Прод: calcapp.webtm.ru

Сервер: Timeweb VPS `72.56.248.211` (Ubuntu 26.04), код в `/opt/calculator`.
Схема: docker compose (app + mongo:7 replica set) → nginx (80/443, HTTPS Let's Encrypt).
Приложение слушает только 127.0.0.1:3000, наружу — через nginx.

## Обновление прода

1. Проверить сборку локально (на маке, в папке проекта):

```bash
npm run build
```

2. Залить код на сервер (на маке, одной строкой):

```bash
rsync -av --exclude node_modules --exclude .next --exclude .env --exclude .git ~/Documents/Проекты/NEXT/calculator/ root@72.56.248.211:/opt/calculator/
```

3. Пересобрать и перезапустить (на сервере):

```bash
cd /opt/calculator
docker compose up -d --build
```

4. Если появились новые миграции (на сервере):

```bash
cd /opt/calculator
DB_URL='mongodb://localhost:27017/?directConnection=true' DB_NAME=calculator npx migrate-mongo up
```

5. Проверить: открыть https://calcapp.webtm.ru, при проблемах — логи:

```bash
docker compose logs --tail=50 app
```

## Откат

Код: вернуть предыдущую версию файлов на маке (git checkout) → повторить шаги 2–3.
Данные БД живут в volume `calculator_mongo-data` и пересборок не боятся.
НИКОГДА не запускать `docker compose down -v` — флаг `-v` удаляет базу.

## Бэкап базы

```bash
docker compose exec mongo mongodump --archive > backup-$(date +%F).archive
```

Восстановление:

```bash
docker compose exec -T mongo mongorestore --archive --drop < backup-ДАТА.archive
```

## Прочее

- Сброс пароля юзера: `DB_URL='mongodb://localhost:27017/?directConnection=true' node scripts/reset-password.mjs email 'НовыйПароль'`
- Выдать админа: `docker compose exec mongo mongosh calculator --eval 'db.user.updateOne({email: "..."}, {$set: {role: "admin"}})'`
- Зеркало Docker Hub настроено в `/etc/docker/daemon.json` (иначе 429 с российских IP)
- HTTPS продлевается автоматически (certbot)

## Автобэкап и деплой из git (добавлено 2026-09-28)

Скрипты лежат в `scripts/server/`. Разовая настройка на сервере:

```bash
# 1. Репозиторий вместо rsync (один раз). Нужен deploy key или токен на GitHub.
cd /opt && mv calculator calculator.rsync-bak && git clone git@github.com:IrinaPronina/calculator.git
cp calculator.rsync-bak/.env calculator/.env
cd calculator && docker compose up -d --build

# 2. Бэкап каждый день в 03:15 (crontab -e)
15 3 * * * /opt/calculator/scripts/server/backup-mongo.sh >> /var/log/calculator-backup.log 2>&1
# с копией в S3 Timeweb: добавить перед командой  S3_BUCKET=s3://<bucket>  и настроить aws cli / s3cmd

# 3. Проверить восстановление один раз (обязательно):
docker compose exec -T mongo mongorestore --archive --gzip --drop --nsFrom='calculator.*' --nsTo='calculator_restore_test.*' < /opt/backups/calculator/mongo-<дата>.archive.gz
docker compose exec mongo mongosh calculator_restore_test --eval 'db.user.countDocuments()'
docker compose exec mongo mongosh calculator_restore_test --eval 'db.dropDatabase()'
```

Обновление прода теперь одной командой (после `git push` с мака):

```bash
/opt/calculator/scripts/server/deploy.sh main
```

Скрипт сам делает бэкап, тянет ветку, пересобирает, применяет миграции и проверяет, что приложение отвечает. Откат — `git reset --hard <старый коммит>` и `docker compose up -d --build`; команду печатает сам скрипт при неудаче.
