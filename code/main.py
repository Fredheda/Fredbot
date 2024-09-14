from llm.phi3 import phi3_llm
from tfl_api import construct_tfl_status

tfl_status = construct_tfl_status()

model_id = "microsoft/Phi-3.5-mini-instruct"
llm = phi3_llm(model_id)

prompt_path = 'prompt_templates/tfl_disruption.txt'
user_message = 'Is the district line running a good service?'

prompt = llm.construct_streaming_prompt(user_message, prompt_path, tfl_status=tfl_status)
llm.streaming_response(prompt)