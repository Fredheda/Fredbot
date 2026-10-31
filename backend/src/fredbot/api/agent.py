import logging
from collections.abc import AsyncIterator
from typing import Annotated
from uuid import uuid4

from ag_ui.core import (
    AssistantMessage,
    BaseEvent,
    DeveloperMessage,
    Message,
    RunAgentInput,
    RunErrorEvent,
    RunFinishedEvent,
    RunStartedEvent,
    SystemMessage,
    TextMessageContentEvent,
    TextMessageEndEvent,
    TextMessageStartEvent,
    UserMessage,
)
from ag_ui.encoder import EventEncoder
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from fredbot.config import Settings, get_settings
from fredbot.llm import ChatMessage, ChatModel, LiteLLMChatModel, friendly_error

logger = logging.getLogger(__name__)

router = APIRouter()


def get_chat_model() -> ChatModel:
    return LiteLLMChatModel()


def to_chat_messages(messages: list[Message], system_prompt: str) -> list[ChatMessage]:
    chat: list[ChatMessage] = [{"role": "system", "content": system_prompt}]
    for message in messages:
        match message:
            case UserMessage(content=str() as content):
                chat.append({"role": "user", "content": content})
            case UserMessage(content=parts):
                text = "\n".join(part.text for part in parts if part.type == "text")
                chat.append({"role": "user", "content": text})
            case AssistantMessage(content=str() as content) if content:
                chat.append({"role": "assistant", "content": content})
            case SystemMessage(content=content) | DeveloperMessage(content=content):
                chat.append({"role": "system", "content": content})
    return chat


async def run_events(
    run: RunAgentInput, chat_model: ChatModel, settings: Settings
) -> AsyncIterator[BaseEvent]:
    yield RunStartedEvent(thread_id=run.thread_id, run_id=run.run_id)
    message_id = str(uuid4())
    started = False
    try:
        messages = to_chat_messages(run.messages, settings.system_prompt)
        async for delta in chat_model.stream(messages, model=settings.default_model):
            if not started:
                yield TextMessageStartEvent(message_id=message_id, role="assistant")
                started = True
            yield TextMessageContentEvent(message_id=message_id, delta=delta)
    except Exception as exc:
        logger.exception("Agent run %s failed", run.run_id)
        code, message = friendly_error(exc)
        yield RunErrorEvent(message=message, code=code)
        return
    if started:
        yield TextMessageEndEvent(message_id=message_id)
    yield RunFinishedEvent(thread_id=run.thread_id, run_id=run.run_id)


@router.post("/agent")
async def run_agent(
    run: RunAgentInput,
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    chat_model: Annotated[ChatModel, Depends(get_chat_model)],
) -> StreamingResponse:
    encoder = EventEncoder(accept=request.headers.get("accept"))

    async def stream() -> AsyncIterator[str]:
        async for event in run_events(run, chat_model, settings):
            yield encoder.encode(event)

    return StreamingResponse(stream(), media_type=encoder.get_content_type())
