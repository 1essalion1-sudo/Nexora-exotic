const MODEL_ID = "@cf/zai-org/glm-4.7-flash";
const MODEL_LABEL = "Exotic";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 10000;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = (env.ALLOWED_ORIGIN || "*").split(",").map((v) => v.trim()).filter(Boolean);
  const allowed = allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? (allowedOrigins.includes("*") ? "*" : origin) : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    throw new Error("Send between 1 and 20 messages.");
  }
  return messages.map((message) => {
    if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string" || !message.content.trim() || message.content.length > MAX_MESSAGE_LENGTH) {
      throw new Error("Each message needs a valid role and non-empty text (maximum 10,000 characters).");
    }
    return { role: message.role, content: message.content.trim() };
  });
}

async function handleChat(request, env, cors) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Request body must be valid JSON." }, 400, cors); }

  let messages;
  try { messages = validateMessages(body.messages); }
  catch (error) { return json({ error: error.message }, 400, cors); }

  try {
    const result = await env.AI.run(MODEL_ID, {
      messages: [
        {
          role: "system",
          content: "You are Neora, a helpful programming assistant. Your model identity label is Exotic. Help with programming, debugging, code explanations, and software design. Give accurate practical answers and use fenced code blocks. If unsure, say so. Never claim you executed or tested code unless you actually did.",
        },
        ...messages,
      ],
      max_tokens: 1800,
      temperature: 0.2,
    });

    const reply = result?.response ?? result?.choices?.[0]?.message?.content ?? result?.result?.response;
    if (typeof reply !== "string" || !reply.trim()) {
      return json({ error: "The AI model returned an empty response." }, 502, cors);
    }
    return json({ name: "Neora", model: MODEL_LABEL, reply: reply.trim() }, 200, cors);
  } catch (error) {
    return json({ error: "Workers AI request failed.", details: String(error?.message || error).slice(0, 500) }, 502, cors);
  }
}

export default {
  async fetch(request, env) {
    const cors = getCorsHeaders(request, env);
    const origin = request.headers.get("Origin");
    const allowedOrigins = (env.ALLOWED_ORIGIN || "*").split(",").map((v) => v.trim()).filter(Boolean);
    if (origin && !allowedOrigins.includes("*") && !allowedOrigins.includes(origin)) {
      return json({ error: "Origin not allowed." }, 403, cors);
    }
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json({ name: "Neora", project: "Nexora", model: MODEL_LABEL, model_id: MODEL_ID, status: "online", endpoints: { health: "GET /health", chat: "POST /chat" } }, 200, cors);
    }
    if (request.method === "POST" && url.pathname === "/chat") return handleChat(request, env, cors);
    return json({ error: "Not found. Use GET /health or POST /chat." }, 404, cors);
  },
};
