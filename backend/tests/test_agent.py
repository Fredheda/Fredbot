import json
from collections.abc import AsyncIterator

import litellm
import pytest
from fastapi.testclient import TestClient

from fredbot.api.agent import get_chat_model
from fredbot.config import Settings, get_settings
from fredbot.llm import ChatMessage, LiteLLMChatModel, friendly_error
from fredbot.main import create_app


class FakeChatModel:
    def __init__(self, deltas: list[str], error: Exception | None = None) -> None:
        self.deltas = deltas
        self.error = error
        self.calls: list[tuple[list[ChatMessage], str]] = []

    async def stream(self, messages: list[ChatMessage], model: str) -> AsyncIterator[str]:
        self.calls.append((messages, model))
        for delta in self.deltas:
            yield delta
        if self.error:
            raise self.error


SETTINGS = Settings(default_model="test/model", system_prompt="You are a test bot.")


def run_agent(model: FakeChatModel, messages: list[dict]) -> list[dict]:
    app = create_app(SETTINGS)
    app.dependency_overrides[get_chat_model] = lambda: model
    app.dependency_overrides[get_settings] = lambda: SETTINGS
    payload = {
        "threadId": "t1",
        "runId": "r1",
        "state": {},
        "messages": messages,
        "tools": [],
        "context": [],
        "forwardedProps": {},
    }
    with TestClient(app) as client:
        response = client.post("/api/agent", json=payload, headers={"accept": "text/event-stream"})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    return [
        json.loads(line.removeprefix("data: "))
        for line in response.text.splitlines()
        if line.startswith("data: ")
    ]


def test_streams_ag_ui_events_for_reply() -> None:
    events = run_agent(FakeChatModel(["Hel", "lo"]), [{"id": "1", "role": "user", "content": "Hi"}])

    assert [e["type"] for e in events] == [
        "RUN_STARTED",
        "TEXT_MESSAGE_START",
        "TEXT_MESSAGE_CONTENT",
        "TEXT_MESSAGE_CONTENT",
        "TEXT_MESSAGE_END",
        "RUN_FINISHED",
    ]
    assert events[0]["threadId"] == "t1" and events[0]["runId"] == "r1"
    assert "".join(e["delta"] for e in events if e["type"] == "TEXT_MESSAGE_CONTENT") == "Hello"
    assert len({e["messageId"] for e in events[1:5]}) == 1


def test_sends_system_prompt_and_full_history_to_model() -> None:
    model = FakeChatModel(["ok"])
    run_agent(
        model,
        [
            {"id": "1", "role": "user", "content": "My name is Fred."},
            {"id": "2", "role": "assistant", "content": "Nice to meet you, Fred!"},
            {"id": "3", "role": "user", "content": [{"type": "text", "text": "What's my name?"}]},
        ],
    )

    messages, model_name = model.calls[0]
    assert model_name == "test/model"
    assert messages == [
        {"role": "system", "content": "You are a test bot."},
        {"role": "user", "content": "My name is Fred."},
        {"role": "assistant", "content": "Nice to meet you, Fred!"},
        {"role": "user", "content": "What's my name?"},
    ]


def test_model_error_becomes_run_error_event() -> None:
    error = litellm.AuthenticationError("bad key", llm_provider="openai", model="gpt-4o-mini")
    events = run_agent(FakeChatModel([], error), [{"id": "1", "role": "user", "content": "Hi"}])

    assert [e["type"] for e in events] == ["RUN_STARTED", "RUN_ERROR"]
    assert events[1]["code"] == "auth_error"
    assert "bad key" not in events[1]["message"]


@pytest.mark.parametrize(
    ("error", "code"),
    [
        (litellm.RateLimitError("x", llm_provider="openai", model="m"), "rate_limited"),
        (litellm.Timeout("x", llm_provider="openai", model="m"), "timeout"),
        (litellm.APIConnectionError("x", llm_provider="openai", model="m"), "provider_unavailable"),
        (RuntimeError("boom"), "internal_error"),
    ],
)
def test_friendly_error_codes(error: Exception, code: str) -> None:
    assert friendly_error(error)[0] == code


async def collect(stream: AsyncIterator[str]) -> str:
    return "".join([delta async for delta in stream])


def test_litellm_chat_model_streams_deltas() -> None:
    import asyncio

    model = LiteLLMChatModel(mock_response="Hello from LiteLLM")
    text = asyncio.run(collect(model.stream([{"role": "user", "content": "Hi"}], "openai/gpt-4o")))
    assert text == "Hello from LiteLLM"
