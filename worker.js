const DEFAULT_MODEL = "Exotic";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 12000;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const configured = (env.ALLOWED_ORIGIN || "*").split(",").map((v) => v.trim());
  const allowed = configured.includes("*") || (origin && configured.includes(origin));

  return {
    "Access-Control-Allow-Origin": allowed ? (configured.includes("*") ? "*" : origin) : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

function cleanMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new Error("Send between 1 and 20 messages.");
  }

  return messages.map((item) => {
    if (!item || !["user", "assistant"].includes(item.role) ||
        typeof item.content !== "string" || !item.content.trim() ||
        item.content.length > MAX_MESSAGE_CHARS) {
      throw new Error("Each message needs a valid role and text content.");
    }
    return { role: item.role, content: item.content.trim() };
  });
}

async function handleChat(request, env, headers) {
  if (!env.MODEL_BASE_URL || !env.MODEL_NAME) {
    return json({
      error: "Backend is not configured yet.",
      required: ["MODEL_BASE_URL", "MODEL_NAME"],
      optional: ["MODEL_API_KEY"],
    }, 503, headers);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400, headers);
  }

  let messages;
  try {
    messages = cleanMessages(body.messages);
  } catch (error) {
    return json({ error: error.message }, 400, headers);
  }

  const endpoint = env.MODEL_BASE_URL.replace(/\/+$/, "") + "/chat/completions";
  const payload = {
    model: env.MODEL_NAME,
    messages: [
      {
        role: "system",
        content: "You are Neora, a helpful programming assistant. Help users understand, write, debug, and improve code. Be accurate, explain assumptions, and never claim to have executed code unless you actually did.",
      },
      ...messages,
    ],
    temperature: 0.2,
    stream: false,
  };

  const upstreamHeaders = { "Content-Type": "application/json" };
  if (env.MODEL_API_KEY) {
    upstreamHeaders.Authorization = "Bearer " + env.MODEL_API_KEY;
  }

  let upstream;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify(payload),
    });
  } catch {
    return json({ error: "Could not reach the AI provider. Check MODEL_BASE_URL." }, 502, headers);
  }

  const raw = await upstream.text();
  if (!upstream.ok) {
    return json({
      error: "AI provider returned an error.",
      provider_status: upstream.status,
      details: raw.slice(0, 1200),
    }, 502, headers);
  }

  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    return json({ error: "AI provider returned an invalid response." }, 502, headers);
  }

  const reply = result?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    return json({ error: "AI provider response did not contain a text reply." }, 502, headers);
  }

  return json({
    name: "Neora",
    model: DEFAULT_MODEL,
    reply: reply.trim(),
  }, 200, headers);
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    const origin = request.headers.get("Origin");
    const allowedOrigins = (env.ALLOWED_ORIGIN || "*").split(",").map((v) => v.trim());

    if (origin && !allowedOrigins.includes("*") && !allowedOrigins.includes(origin)) {
      return json({ error: "Origin not allowed." }, 403, headers);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ name: "Neora", project: "Nexora", status: "online" }, 200, headers);
    }

    if (request.method === "POST" && url.pathname === "/chat") {
      return handleChat(request, env, headers);
    }

    return json({ error: "Not found. Use GET /health or POST /chat." }, 404, headers);
  },
};
