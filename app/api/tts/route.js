// Server-side proxy to ElevenLabs Text-to-Speech.
// The API key never reaches the browser — it lives only in Vercel env vars.

const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // multilingual-capable preset

// GET /api/tts -> tells the client whether the neural voice is configured
export async function GET() {
  return Response.json({ configured: !!process.env.ELEVENLABS_API_KEY });
}

// POST /api/tts  { text }  -> audio/mpeg
export async function POST(req) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return Response.json({ error: "missing_api_key" }, { status: 503 });

  let text = "";
  try {
    const body = await req.json();
    text = (body?.text || "").toString();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  text = text.slice(0, 400).trim(); // cap length to protect quota
  if (!text) return Response.json({ error: "empty_text" }, { status: 400 });

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;

  let r;
  try {
    r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        accept: "audio/mpeg",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2", // handles French natively
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
      }),
    });
  } catch (e) {
    return Response.json({ error: "network", detail: String(e).slice(0, 200) }, { status: 502 });
  }

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    return Response.json({ error: "tts_failed", status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
  }

  const audio = await r.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
