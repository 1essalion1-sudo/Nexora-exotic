# Nexora

A prototype programming assistant website powered by **Cloudflare Workers AI**.

- **Assistant:** Nexora
- **Project:** Nexora
- **Model:** GLM-4.7-Flash by Zhipu AI
- **Inference platform:** Cloudflare Workers AI

## Website

The static website is `index.html`. It connects to the deployed Worker at:

`https://nexora-exotic.1essalion1.workers.dev`

The browser sends chat messages to `POST /chat` and checks `GET /health`.

## Model credit

This prototype uses **GLM-4.7-Flash**, developed by **Zhipu AI** and served through **Cloudflare Workers AI**.

- [Cloudflare Workers AI model documentation](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/)
- [Zhipu AI](https://www.zhipuai.cn/)

Nexora is the assistant/interface name used by this project; it is not the name of the underlying foundation model.

## Publish with GitHub Pages

1. Open the repository's **Settings → Pages**.
2. Under Build and deployment, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`, then save.
4. Wait for GitHub Pages to publish the site.

## Backend

The Worker source is `worker.js`; Wrangler configuration is `wrangler.toml`. The Worker requires a Cloudflare Workers AI binding named `AI`.

Before public launch, replace `ALLOWED_ORIGIN = "*"` in the Worker configuration with the exact published website origin and redeploy.

This is an early prototype. More features and design changes will be added later.
