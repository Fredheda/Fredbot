from llm.openai_llm import openai_llm
from tfl_api import construct_tfl_status
from datetime import datetime

tfl_status = construct_tfl_status()

model_id = "microsoft/Phi-3.5-mini-instruct"
llm = openai_llm('gpt4o-mini')

user_message = 'Is the district line running a good service?'

current_datetime = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
prompt = llm.construct_prompt(user_message, 'prompt_templates/tfl_disruption.txt', tfl_status=tfl_status, current_datetime=current_datetime)

#prompt = llm.construct_prompt('How are you?')

gen = llm.generate_response(prompt, stream=True)
for chunk in gen:
    print(chunk, end='', flush=True)