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
- Node.js 26+ (current LTS)

## Getting started

```bash
make install                         # backend venv + frontend node_modules
cp backend/.env.example backend/.env # then fill in your keys
make dev                             # runs backend and frontend together
```

Open http://localhost:5173.

## Common commands

| Command     | What it does                                  |
| ----------- | --------------------------------------------- |
| `make dev`  | Run backend (reload) and frontend dev servers |
| `make lint` | ruff, oxlint, prettier and TypeScript checks  |
| `make test` | pytest and vitest                             |

## Configuration

Backend settings are read from environment variables (or `backend/.env`) with the `FREDBOT_` prefix.
See [`backend/.env.example`](backend/.env.example).

Fredbot is model agnostic: it calls models through [LiteLLM](https://docs.litellm.ai/docs/providers),
so switching provider is a config change. Set `FREDBOT_DEFAULT_MODEL` to a LiteLLM model string
and provide that provider's credentials:

| Provider     | `FREDBOT_DEFAULT_MODEL`   | Credentials                                            |
| ------------ | ------------------------- | ------------------------------------------------------ |
| OpenAI       | `openai/gpt-6-luna`       | `OPENAI_API_KEY`                                       |
| Azure OpenAI | `azure/<deployment-name>` | `AZURE_API_KEY`, `AZURE_API_BASE`, `AZURE_API_VERSION` |
| Anthropic    | `anthropic/<model>`       | `ANTHROPIC_API_KEY`                                    |

## Agent API

`POST /api/agent` implements the AG-UI protocol: it accepts a `RunAgentInput` (conversation so far)
and streams `RUN_STARTED`, `TEXT_MESSAGE_*` and `RUN_FINISHED` (or `RUN_ERROR`) events over SSE.
It works with `HttpAgent` from `@ag-ui/client`.
