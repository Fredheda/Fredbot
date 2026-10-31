# Fredbot

Fredbot is Frederik's personal AI assistant: a React + Tailwind chat UI talking to a FastAPI agent
backend over the [AG-UI protocol](https://docs.ag-ui.com).

> Work is planned and tracked on the FRED Jira board.

## Architecture

```
frontend/   React + TypeScript + Tailwind (Vite)   -> http://localhost:5173
backend/    FastAPI (Python)                       -> http://localhost:8000
```

In development the Vite dev server proxies `/api/*` to the backend.

## Prerequisites

- Python 3.10+
- Node.js 22+

## Getting started

```bash
make install                         # backend venv + frontend node_modules
cp backend/.env.example backend/.env # then fill in your keys
make dev                             # runs backend and frontend together
```

Open http://localhost:5173.

## Common commands

| Command        | What it does                                   |
| -------------- | ---------------------------------------------- |
| `make dev`     | Run backend (reload) and frontend dev servers  |
| `make lint`    | ruff, oxlint, prettier and TypeScript checks   |
| `make test`    | pytest and vitest                              |

## Configuration

Backend settings are read from environment variables (or `backend/.env`) with the `FREDBOT_` prefix.
See [`backend/.env.example`](backend/.env.example).
