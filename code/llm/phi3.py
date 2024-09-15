import onnxruntime_genai as og
import os
from dotenv import load_dotenv
from threading import Thread
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline, TextStreamer, TextIteratorStreamer
from utils import read_file
from typing import Generator

_ = load_dotenv()

class phi3_llm():

    def __init__(self, model_id) -> None:
        self.model = AutoModelForCausalLM.from_pretrained(model_id,device_map="cpu", torch_dtype="auto", trust_remote_code=True)
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    def construct_prompt(self, user_question: str, prompt_path=None, **kwargs) -> str:
        if prompt_path:
            prompt_template = read_file(prompt_path)
            user_question = prompt_template.format(user_question=user_question, **kwargs)
        prompt = f'<|user|>\n{user_question} <|end|>\n<|assistant|>'
        return prompt

    def generate_response(self, messages, stream: bool=False) -> Generator[str, None, None]:
        inputs = self.tokenizer(messages, return_tensors="pt")
        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True)
        generation_kwargs = dict(inputs, streamer=streamer, max_new_tokens=500)
        thread = Thread(target=self.model.generate, kwargs=generation_kwargs).start()
        generated_text = ""
        for new_text in streamer:
            new_text = new_text.replace("<|end|>", "")
            if stream:
                yield new_text
            else:
                generated_text += new_text
            yield generated_text
        
    def generate_response_onnx(self, prompt: str, stream: bool=False)-> Generator[str, None, None]:
        onnx_model_path = os.getenv('phi-3.5-mini-128k-instruct')
        model = og.Model(onnx_model_path)
        tokenizer = og.Tokenizer(model)
        tokenizer_stream = tokenizer.create_stream()

        search_options = {'max_length' : 2048}        
        input_tokens = tokenizer.encode(prompt)
        params = og.GeneratorParams(model)
        params.set_search_options(**search_options)
        params.input_ids = input_tokens
        generator = og.Generator(model, params)
        generated_text = ""
        while not generator.is_done():
            generator.compute_logits()
            generator.generate_next_token()
            new_token = generator.get_next_tokens()[0]
            new_text = tokenizer_stream.decode(new_token)
            if stream:
                yield new_text
            else:
                generated_text += new_text
        yield generated_text
        del generator