// Server-side evaluator for free-text (expression) answers.
// Calls Claude to judge grammar, meaning, whether it answers the question,
// and whether it meets the stated conditions. API key stays in env vars.

const MODEL = process.env.CHECK_MODEL || "claude-sonnet-4-6";

function extractJSON(raw) {
  let t = (raw || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no-json");
  return JSON.parse(t.slice(s, e + 1));
}

export async function GET() {
  return Response.json({ configured: !!process.env.ANTHROPIC_API_KEY });
}

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "missing_api_key" }, { status: 503 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }
  const prompt_fr = (body?.prompt_fr || "").toString().slice(0, 600);
  const instruction_he = (body?.instruction_he || "").toString().slice(0, 300);
  const answer = (body?.answer || "").toString().slice(0, 800);
  if (!answer.trim()) return Response.json({ error: "empty" }, { status: 400 });

  const system = `אתה מורה לצרפתית שמעריך תשובה חופשית של תלמיד דובר עברית ברמת B2/C1.
החזר אך ורק JSON תקין, בלי markdown, במבנה המדויק:
{"grammar_ok":true/false,"meaning_ok":true/false,"answers_question":true/false,"conditions_ok":true/false,"score":0-100,"corrected_fr":"גרסה מתוקנת ומשופרת של התשובה בצרפתית תקנית","feedback_he":"משוב ספציפי בעברית: מה היה טוב, אילו שגיאות דקדוק או משמעות יש, והאם ענה לשאלה ועמד בתנאים","tip_he":"טיפ קצר וממוקד אחד"}
- grammar_ok: האם התשובה תקינה דקדוקית (זמנים, התאמות, מילות יחס).
- meaning_ok: האם המשמעות ברורה והגיונית.
- answers_question: האם התשובה באמת עונה על מה שנשאל.
- conditions_ok: האם עמד בתנאים שצוינו (למשל שימוש בזמן מסוים כמו conditionnel, או מספר משפטים).
היה מדויק וכן, אך גם מעודד. אם יש שגיאות, ציין אותן בבירור ב-feedback_he.`;

  const user = `השאלה בצרפתית: ${prompt_fr}
ההוראה והתנאים (בעברית): ${instruction_he}
תשובת התלמיד: ${answer}

הערך את התשובה והחזר JSON בלבד.`;

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, system, messages: [{ role: "user", content: user }] }),
    });
  } catch (e) {
    return Response.json({ error: "network", detail: String(e).slice(0, 200) }, { status: 502 });
  }
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    return Response.json({ error: "api", status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
  }

  const data = await r.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  try {
    return Response.json(extractJSON(text));
  } catch {
    return Response.json({ error: "parse", raw: text.slice(0, 300) }, { status: 502 });
  }
}
