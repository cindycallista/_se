# HW6 — StackBoard Docker Microservice

Student: 楊莉思 (111210555)

Live Demo: https://cindycallista.github.io/_se/hw6/

Repository: https://github.com/cindycallista/_se/tree/main/hw6

StackBoard is a small task board built as three services:

- Nginx serves the web interface and acts as a reverse proxy.
- Flask provides a REST API.
- PostgreSQL stores tasks in a persistent volume.

The GitHub Pages link runs in browser-demo mode with `localStorage`. The same interface uses the real Flask and PostgreSQL services when started with Docker Compose.

## Architecture

```text
Browser :8080
     |
     v
Nginx web / reverse proxy
     | /api/*
     v
Flask API :5000
     |
     v
PostgreSQL :5432
```

Only Nginx exposes a host port. The API and database communicate through the private Compose network.

## Files

```text
hw6/
├── index.html
├── style.css
├── app.js
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── app.py
├── init.sql
└── nginx.conf
```

## Run with Docker

```bash
docker --version
docker compose version
docker compose up --build -d
docker compose ps
```

Open http://localhost:8080 after the services become healthy.

```bash
docker compose logs -f
docker compose down
```

Use `docker compose down -v` only when the PostgreSQL data volume should also be removed.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and database health |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Change completion state |
| `DELETE` | `/api/tasks/:id` | Delete a task |

Example:

```bash
curl http://localhost:8080/api/health
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Review Docker logs","category":"Operations"}'
```

## Docker notes

- An image is an immutable application template; a container is a running image instance.
- `Dockerfile` builds the Flask service image.
- Compose starts all services and provides internal DNS names: `web`, `api`, and `db`.
- Nginx forwards `/api/*` requests to `http://api:5000`.
- `db_data` keeps PostgreSQL records after containers are recreated.
- Health checks prevent dependent services from starting before their requirements are ready.

The database credentials in `docker-compose.yml` are classroom-only values. Production credentials should use environment files or a secret manager.
