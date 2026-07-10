# Деплой на сервер (Docker)

## Требования на сервере
- Docker + docker compose plugin
- Открытый порт 80/443 (nginx или Caddy как reverse proxy)

## Шаги

1. Скопировать проект на сервер (git clone или rsync).

2. Создать `.env` в корне проекта:

```
DB_NAME=calculator
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://ваш-домен.ру
```

docker compose сам подставит эти значения; `DB_URL` внутри compose указывает на контейнер `mongo`.

3. Собрать и запустить:

```bash
docker compose up -d --build
```

4. Прогнать миграции (один раз после первого запуска и после каждого обновления с новыми миграциями):

```bash
docker compose run --rm \
  -e DB_URL=mongodb://mongo:27017 -e DB_NAME=calculator \
  --entrypoint sh app -c "npx migrate-mongo up"
```

Если в образе нет npm-кэша, проще с сервера (нужен Node):

```bash
DB_URL=mongodb://localhost:27017 npx migrate-mongo up
```

(в этом случае временно пробросьте порт mongo: `ports: - '127.0.0.1:27017:27017'`)

5. Reverse proxy (nginx):

```nginx
server {
    server_name ваш-домен.ру;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

TLS: `certbot --nginx` или взять Caddy — он выпускает сертификаты сам.

## Обновление

```bash
git pull
docker compose up -d --build
# при новых миграциях — шаг 4
```

## Данные

MongoDB хранит данные в volume `mongo-data`. Бэкап:

```bash
docker compose exec mongo mongodump --archive > backup-$(date +%F).archive
```
