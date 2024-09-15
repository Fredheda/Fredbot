from llm.phi3 import phi3_llm
from tfl_api import construct_tfl_status
from datetime import datetime

tfl_status = construct_tfl_status()

model_id = "microsoft/Phi-3.5-mini-instruct"
llm = phi3_llm(model_id)

prompt_path = 'prompt_templates/tfl_disruption.txt'
user_message = 'Is the district line running a good service?'
prompt = llm.construct_prompt('How are you?')

gen = llm.generate_response(prompt, stream=True)
for chunk in gen:
    print(chunk, end='', flush=True)