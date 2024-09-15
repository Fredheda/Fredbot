# Fredbot

This repository includes an early prototype of Fredbot - My AI assistant. This early version of Fredbot is a chatbot that is powered by a small language model (SLM) that is run using an ONNX runtime, with a streamlit interface.
<br>

## Running Fredbot locally
The instructions below detail the process of running the Phi3 SLM locally on CPU using the ONNX Runtime generate() API. The model can also be ran using Nvidia Cuda using [these instructions.](https://onnxruntime.ai/docs/genai/tutorials/phi3-python.html#run-with-nvidia-cuda)

- Clone the repository
- Install dependencies
```
pip install -r requirements.txt
```

- Run the Streamlit app
```
streamlit run app.py
```
<br>

### Using ONNX runtime
- Download the required ONNX model from Huggingface in the `code` directory (Example below) and store the relevant path to the model in as an env variable.
```
huggingface-cli download microsoft/Phi-3-mini-4k-instruct-onnx --include cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4/* --local-dir .
```

<br><br><br>

![TFL Feature](fredbot_screenshot.png)


 