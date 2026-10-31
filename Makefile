.PHONY: install install-backend install-frontend dev dev-backend dev-frontend lint test

BACKEND_VENV := backend/.venv
PY := $(BACKEND_VENV)/bin

install: install-backend install-frontend

install-backend:
	python3 -m venv $(BACKEND_VENV)
	$(PY)/pip install -e 'backend[dev]'

install-frontend:
	cd frontend && npm ci

dev:
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && .venv/bin/uvicorn fredbot.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

lint:
	cd backend && .venv/bin/ruff check . && .venv/bin/ruff format --check .
	cd frontend && npm run lint && npm run format:check && npm run typecheck

test:
	cd backend && .venv/bin/pytest
	cd frontend && npm test
