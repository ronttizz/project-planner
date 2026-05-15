# Project Planner

A lightweight Jira-style kanban board for managing projects and issues. Run the entire stack with Docker — no local Node or PostgreSQL install required.

## Quick start (Docker)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)

```bash
cp .env.example .env
docker compose up --build
```

Open **http://localhost:8080** in your browser.

### Stop and reset

```bash
# Stop containers (data persists)
docker compose down

# Stop and delete database volume
docker compose down -v
```

## Architecture

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **web** | nginx + React SPA | 8080 | Frontend; proxies `/api` to backend |
| **api** | Express + Prisma | 3001 | REST API (optional host port for debugging) |
| **db** | PostgreSQL 16 | internal | Database with persistent volume |

## Features (MVP)

- Create and delete projects
- Kanban board with default columns: To Do, In Progress, Done
- Create, edit, and delete issues (title + description)
- Drag-and-drop issues within and across columns

## Local development (optional)

Requires Node.js 20+.

```bash
# Start database only
docker compose up db

# In another terminal — from repo root
cp .env.example .env
# Create server/.env with:
# DATABASE_URL=postgresql://planner:planner@localhost:5432/project_planner

npm install
npm run db:migrate -w server
npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` to the API)
- API: http://localhost:3001

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/board` | Board with columns and issues |
| POST | `/api/projects/:id/issues` | Create issue |
| PATCH | `/api/issues/:id` | Update or move issue |
| DELETE | `/api/issues/:id` | Delete issue |
