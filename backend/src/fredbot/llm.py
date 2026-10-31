"""Model-agnostic chat completion via LiteLLM."""

from collections.abc import AsyncIterator
from typing import Any, Protocol

import litellm

ChatMessage = dict[str, str]


class ChatModel(Protocol):
    def stream(self, messages: list[ChatMessage], model: str) -> AsyncIterator[str]: ...


class LiteLLMChatModel:
    """Streams completions from any provider LiteLLM supports, selected by model string
    (e.g. ``openai/gpt-4o-mini`` or ``azure/<deployment>``)."""

    def __init__(self, **completion_kwargs: Any) -> None:
        self._completion_kwargs = completion_kwargs

    async def stream(self, messages: list[ChatMessage], model: str) -> AsyncIterator[str]:
        response = await litellm.acompletion(
            model=model, messages=messages, stream=True, **self._completion_kwargs
        )
        async for chunk in response:
            if chunk.choices and (delta := chunk.choices[0].delta.content):
                yield delta


def friendly_error(exc: Exception) -> tuple[str, str]:
    """Map an LLM exception to an AG-UI error code and a user-facing message."""
    match exc:
        case litellm.AuthenticationError() | litellm.PermissionDeniedError():
            return "auth_error", "The model provider rejected Fredbot's credentials."
        case litellm.RateLimitError():
            return (
                "rate_limited",
                "The model provider is rate limiting requests. Try again shortly.",
            )
        case litellm.Timeout():
            return "timeout", "The model provider took too long to respond. Try again."
        case litellm.ContextWindowExceededError():
            return (
                "context_too_long",
                "This conversation is too long for the model. Start a new one.",
            )
        case litellm.APIConnectionError() | litellm.ServiceUnavailableError():
            return "provider_unavailable", "Couldn't reach the model provider. Try again shortly."
        case _:
            return "internal_error", "Something went wrong while generating a reply."
