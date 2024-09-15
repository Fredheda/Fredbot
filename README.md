# Fredbot

This repository includes an early prototype of Fredbot - My AI assistant. This early version of Fredbot is a chatbot that is powered by a small language model (SLM) that is run using an ONNX runtime, with a streamlit interface.

![TFL Feature](fredbot_screenshot.png)

<br><br>
## Running Fredbot locally
The instructions below detail the process of running the Phi3 SLM locally on CPU using the ONNX Runtime generate() API. The model can also be ran using Nvidia Cuda using [these instructions.](https://onnxruntime.ai/docs/genai/tutorials/phi3-python.html#run-with-nvidia-cuda)

- Clone the repository
- Install dependencies
```
pip install -r requirements.txt
```
- Download the required ONNX model from Huggingface in the `code` directory.
```
huggingface-cli download microsoft/Phi-3-mini-4k-instruct-onnx --include cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4/* --local-dir .
```
- Run the Streamlit app
```
streamlit run app.py
```