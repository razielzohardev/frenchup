const MODEL = "claude-haiku-4-5-20251001";

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "no_key" }, { status: 503 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const text = (body?.text || "").toString().slice(0, 300);
  const lang = body?.lang === "en" ? "en" : "he";
  if (!text.trim()) return Response.json({ error: "empty" }, { status: 400 });

  const targetLang = lang === "he" ? "Hebrew" : "English";

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 120,
        messages: [{ role: "user", content: `Translate this French text to ${targetLang}. Reply with ONLY the translation, no quotes, no explanation:\n\n${text}` }],
      }),
    });
  } catch (e) {
    return Response.json({ error: "network" }, { status: 502 });
  }

  if (!r.ok) return Response.json({ error: "api" }, { status: 502 });

  const data = await r.json();
  const translation = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
  return Response.json({ translation });
}
