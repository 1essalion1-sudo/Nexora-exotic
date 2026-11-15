# Nexora — Neora Backend

A small Cloudflare Worker backend for **Neora**, the programming assistant. It connects to an OpenAI-compatible chat-completions API. The model label defaults to **Exotic**.

## Endpoints

- `GET /health` — health check.
- `POST /chat` — send conversation messages.

Example request:

```json
{
  "messages": [
    { "role": "user", "content": "Write a JavaScript hello world." }
  ]
}
```

Example response:

```json
{
  "name": "Neora",
  "model": "Exotic",
  "reply": "..."
}
```

## Deploy on Cloudflare Workers

1. Create a Worker and paste the contents of `worker.js`, or deploy this folder with Wrangler.
2. In Worker Settings → Variables and Secrets, set:
   - `MODEL_BASE_URL`: provider base URL (without `/chat/completions`).
   - `MODEL_NAME`: exact model ID supplied by the provider.
   - `MODEL_API_KEY`: optional secret if the provider requires a key.
3. Set `ALLOWED_ORIGIN` to your frontend's exact origin before public launch. The current `*` value is only for initial testing.
4. Test `/health`, then send a POST request to `/chat`.

**Important:** “Exotic” is currently the model label, not a verified provider/model ID. The backend uses the OpenAI-compatible Chat Completions format. We need the actual Exotic provider endpoint and model ID before real AI replies can work. Never put a provider API key in frontend code or commit it to GitHub.
