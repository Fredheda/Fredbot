import streamlit as st
from llm.phi3 import phi3_llm
from llm.openai_llm import openai_llm
from tfl_api import construct_tfl_status
from datetime import datetime

tfl_status = construct_tfl_status()

st.title("Fredbot 💬")

option = st.radio(
    'Model:',
    ('gpt4o-mini', 'gpt4o','Phi-3.5')
)
if option == 'Phi-3.5':
    llm = phi3_llm("microsoft/Phi-3.5-mini-instruct")
else:
    llm = openai_llm(option)
prompt_path = 'prompt_templates/tfl_disruption.txt'

if "chat_messages" not in st.session_state:
    st.session_state["chat_messages"] = [{"role": "assistant", "content": "How can I help you?"}]

for msg in st.session_state.chat_messages:
    st.chat_message(msg["role"]).write(msg['content'])
    
if prompt := st.chat_input(placeholder="Enter your question here"):
    st.session_state.chat_messages.append({"role": "user", "content": prompt})
    st.chat_message("user").write(prompt)
    
    current_datetime = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    prompt = llm.construct_prompt(prompt, prompt_path, tfl_status=tfl_status, current_datetime=current_datetime)
    print(prompt)
    with st.chat_message("assistant"):
        response = st.write_stream(llm.generate_response(prompt, True))
    st.session_state.chat_messages.append({"role": "assistant", "content": response})