from fastapi.testclient import TestClient

from fredbot import __version__
from fredbot.main import create_app


def test_health_returns_ok() -> None:
    client = TestClient(create_app())
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": "Fredbot", "version": __version__}
