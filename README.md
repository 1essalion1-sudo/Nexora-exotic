# Nexora — Local Coding AI

A static browser-based coding assistant prototype. It uses [WebLLM](https://github.com/mlc-ai/web-llm) and the Qwen2.5-Coder 0.5B model to run inference on the visitor's device.

## No backend or API key

- No OpenAI key
- No Cloudflare Worker
- No server-side inference API
- No Turnstile configuration
- Chat prompts are sent to the model running in the browser

## Run with GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the default branch and the **/(root)** folder, then save.
4. Open the published Pages URL over HTTPS.

## First use

1. Open the site in a WebGPU-compatible browser.
2. Press **Load model**.
3. Wait for the model download and initialization to finish.
4. Start chatting.

The selected model is `Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC`. The first download is roughly 1 GB; exact download and memory requirements vary. The browser may cache model files for later sessions.

## Compatibility and limitations

WebLLM requires WebGPU and a compatible GPU/browser. Some phones and browsers will not support it. The model is intentionally small to reduce device requirements, but its coding ability is limited compared with larger hosted models. The page reports a clear error if WebGPU is unavailable.

This is an experimental prototype. Generated code should be reviewed and tested before use.

## Technology

- Static HTML, CSS and JavaScript
- WebLLM 0.2.88
- Qwen2.5-Coder 0.5B (MLC format)
