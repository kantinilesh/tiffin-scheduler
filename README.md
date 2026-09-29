# Tiffin Scheduler

A full-stack scheduling application built with:

- **Backend**: Node.js, TypeScript, Express.js, BullMQ, Prisma, Elasticsearch, Nodemailer
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Infra**: Docker Compose (PostgreSQL 16, Redis 7, Elasticsearch 8)

## Quick Start

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Verify: `curl http://localhost:4000/health` → `{"status":"ok"}`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — should render a blank light page titled "Tiffin".

## Project Structure

```
tiffin-scheduler/
├── docker-compose.yml        # Postgres, Redis, Elasticsearch
├── backend/
│   ├── src/
│   │   ├── config/           # Env loading, constants
│   │   ├── routes/           # Express routers (thin)
│   │   ├── controllers/      # Request/response handling
│   │   ├── services/         # Business logic
│   │   ├── queues/           # BullMQ queue definitions
│   │   ├── workers/          # BullMQ worker definitions
│   │   ├── db/               # Prisma client, migrations
│   │   ├── middleware/       # Auth, error handling
│   │   └── utils/            # Small helpers
│   └── .env.example
└── frontend/
    └── src/
        ├── app/              # Next.js App Router pages
        ├── components/ui/    # Reusable UI components
        ├── features/         # Feature-specific components
        ├── lib/              # Shared utilities, API client
        └── types/            # Shared TypeScript types
```
