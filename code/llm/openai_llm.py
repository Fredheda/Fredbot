import os
from dotenv import load_dotenv
from utils import read_file
from typing import Generator
from openai import OpenAI

_ = load_dotenv()

class openai_llm():

    def __init__(self, modelName) -> None:
        self.modelName = modelName
        self.client = OpenAI()

    def construct_prompt(self, user_question: str, prompt_path=None, **kwargs) -> str:
        if prompt_path:
            prompt_template = read_file(prompt_path)
            user_question = prompt_template.format(user_question=user_question, **kwargs)
        prompt =[{"role": "user", "content": user_question}]
        return prompt
    
    def generate_response(self, prompt, stream: bool=False)-> Generator[str, None, None]:
        stream = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=prompt,
            stream=True
            )
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    