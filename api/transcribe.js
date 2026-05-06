// Vercel serverless function: transcreve áudio via Groq Whisper
// Recebe áudio em base64 (data URL) + senha do app, retorna texto transcrito.

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Auth: senha do app (mesma do chat)
  const expectedPassword = process.env.APP_PASSWORD;
  const sentPassword = req.headers["x-app-password"];
  if (!expectedPassword) {
    return res.status(500).json({ error: "Servidor não configurado: defina APP_PASSWORD" });
  }
  if (sentPassword !== expectedPassword) {
    return res.status(401).json({ error: "Senha inválida" });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return res.status(500).json({ error: "Servidor não configurado: defina GROQ_API_KEY" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { audio, mimeType, language } = body || {};

    if (!audio || typeof audio !== "string") {
      return res.status(400).json({ error: "Campo 'audio' (base64) é obrigatório" });
    }

    // Decodifica base64 pra Buffer
    // Aceita tanto data URL ("data:audio/webm;base64,XXX") quanto base64 puro
    const cleanBase64 = audio.includes(",") ? audio.split(",")[1] : audio;
    const audioBuffer = Buffer.from(cleanBase64, "base64");

    // Detecta extensão a partir do mime type (Groq exige nome de arquivo com extensão)
    const ext = (mimeType || "audio/webm").includes("mp4") ? "mp4"
      : (mimeType || "").includes("mp3") ? "mp3"
      : (mimeType || "").includes("wav") ? "wav"
      : (mimeType || "").includes("ogg") ? "ogg"
      : (mimeType || "").includes("m4a") ? "m4a"
      : "webm";

    // Monta multipart/form-data manualmente (Groq aceita esse formato)
    // Usa a Web API global FormData/Blob que Vercel suporta no runtime Node 18+
    const form = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || "audio/webm" });
    form.append("file", blob, `audio.${ext}`);
    form.append("model", "whisper-large-v3-turbo"); // rápido e barato
    if (language) form.append("language", language);
    form.append("response_format", "json");
    // Prompt opcional: dá pistas sobre vocabulário pra melhorar transcrição
    form.append(
      "prompt",
      "Termos religiosos e palavras de candomblé: Ibá, Oxalá, Oxum, Ogum, Oxóssi, Iemanjá, Iansã, Xangô, Nanã, Obaluaê, alguidar, miçanga, abebê, ofá, búzios, pemba, axé, orobô, xaôro, aridan, ides, decisas, candomblé, terreiro, orixá, feitura. Lojas de cotação. Valores em reais."
    );

    const upstream = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
      },
      body: form,
    });

    const text = await upstream.text();
    res.status(upstream.status);
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}

// Vercel: aumentar limite de body pra acomodar áudio em base64 (até ~10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb",
    },
  },
};
