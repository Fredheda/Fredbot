import torch
import onnxruntime_genai as og
import argparse
import time
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from utils import read_file


class phi3_llm():

    def __init__(self, model_id) -> None:
        self.model_id = model_id
    
    def construct_prompt(self, prompt_path, user_question, **kwargs):

        prompt = read_file(prompt_path)
        messages = [{"role": "system", "content": prompt.format(user_question=user_question, **kwargs)}]
        return messages
    
    def construct_streaming_prompt(self, user_question, prompt_path=None, **kwargs):

        if prompt_path:
            prompt_template = read_file(prompt_path)
            user_question = prompt_template.format(user_question=user_question, **kwargs)
        prompt = f'<|user|>\n{user_question} <|end|>\n<|assistant|>'
        return prompt


    def generate_response(self, messages):
        model = AutoModelForCausalLM.from_pretrained(self.model_id,device_map="cpu", torch_dtype="auto", trust_remote_code=True)
        tokenizer = AutoTokenizer.from_pretrained(self.model_id)

        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer
        )

        generation_args = {
            "max_new_tokens": 600,
            "return_full_text": False,
            "temperature": 0
        }

        output = pipe(messages, **generation_args)
        response = output[0]['generated_text']

        return response
    
    def streaming_response(self, prompt):
        model = og.Model("llm/cpu-int4-rtn-block-32-acc-level-4")
        tokenizer = og.Tokenizer(model)
        tokenizer_stream = tokenizer.create_stream()

        search_options = {'max_length' : 2048}        
        

        input_tokens = tokenizer.encode(prompt)

        params = og.GeneratorParams(model)
        params.set_search_options(**search_options)
        params.input_ids = input_tokens
        generator = og.Generator(model, params)
        
        print("Output: ", end='', flush=True)

        try:
            while not generator.is_done():
                generator.compute_logits()
                generator.generate_next_token()

                new_token = generator.get_next_tokens()[0]
                print(tokenizer_stream.decode(new_token), end='', flush=True)
                yield tokenizer_stream.decode(new_token)
        except KeyboardInterrupt:
            print("  --control+c pressed, aborting generation--")
        del generator