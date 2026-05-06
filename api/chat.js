// Vercel serverless function: proxies chat requests to Anthropic
// Keeps the API key on the server, requires a password from the client.

export default async function handler(req, res) {
  // CORS - same origin in prod, but doesn't hurt
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Auth: simple password check
  const expectedPassword = process.env.APP_PASSWORD;
  const sentPassword = req.headers["x-app-password"];
  if (!expectedPassword) {
    return res.status(500).json({ error: "Servidor não configurado: defina APP_PASSWORD" });
  }
  if (sentPassword !== expectedPassword) {
    return res.status(401).json({ error: "Senha inválida" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Servidor não configurado: defina ANTHROPIC_API_KEY" });
  }

  try {
    // Vercel Node runtime: body may already be parsed
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { system, messages, max_tokens, model } = body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages obrigatório" });
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-haiku-4-5",
        max_tokens: max_tokens || 2000,
        system,
        messages,
      }),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}

// Vercel: increase body size limit for image uploads (base64 photos can be ~3-5MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
