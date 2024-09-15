# Fredbot

![ChatGPT](https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&style=plastic)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54&style=plastic)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white&style=plastic)
<br>
This repository includes an early prototype of Fredbot - My AI assistant. This early version of Fredbot is a chatbot that can be powered by a small language model (e.g. **Phi-3**, which can be run via CPU or via an ONNX runtime) or a large language model (e.g. **GPT4o** & **GPT4o-mini**, which require openai api credentials).
<br>

## Installation


- Clone the repository
- Install dependencies
```
pip install -r requirements.txt
```

- Store Openai credentials in a `.env` file

- Run the Streamlit app
```
streamlit run app.py
```

### Using ONNX runtime
The instructions below detail the process of running the Phi3 SLM locally on CPU using the ONNX Runtime generate() API. The model can also be ran using Nvidia Cuda using [these instructions.](https://onnxruntime.ai/docs/genai/tutorials/phi3-python.html#run-with-nvidia-cuda)

- Download the required ONNX model from Huggingface in the `code` directory (Example below) and store the relevant path to the model in as an env variable.
```
huggingface-cli download microsoft/Phi-3-mini-4k-instruct-onnx --include cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4/* --local-dir .
```

<br>

![TFL Feature](fredbot_screenshot.png)