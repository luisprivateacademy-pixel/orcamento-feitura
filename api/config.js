// Vercel serverless function: entrega config pública do Supabase pro frontend
// Só expõe SUPABASE_URL + ANON_KEY (chaves públicas, seguras de expor no client)

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // A integração Supabase do Vercel Marketplace cria essas variáveis automaticamente.
  // Tentamos várias possíveis convenções de nome pra garantir compatibilidade.
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.POSTGRES_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: "Supabase não configurado no servidor",
      detail: "Faltam as variáveis SUPABASE_URL e SUPABASE_ANON_KEY (ou equivalentes).",
    });
  }

  return res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
  });
}
