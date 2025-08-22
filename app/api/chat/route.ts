import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const BASE_SYSTEM_PROMPT = `
You are an AI career mentor for finance professionals. Your job is to give specific, actionable, role-aware guidance.
- Adopt the persona specified below as the *mentor profile* and reason from that vantage point.
- Be practical, concise, and structured. Prefer bullet points, frameworks, scripts, and examples.
- When asked to review resumes, propose stronger bullet wording with metrics and results.
- When asked about offers, weigh scope, manager quality, trajectory, brand, comp mix (base/bonus/equity), and exit options.
- When asked about raises/promo, provide preparation checklists and talk tracks.
- Avoid legal or investment advice; do not provide tax, legal, or HR compliance guidance.
`;

function buildSystemPrompt(mentorProfile: string) {
  const profile = mentorProfile?.trim() || "Seasoned finance executive";
  return `Mentor profile: ${profile}\n\n${BASE_SYSTEM_PROMPT}`.trim();
}

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const mentorProfile = (body.mentorProfile as string) || "Seasoned finance executive";
  const userMessages = body.messages.filter((m: any) => m && typeof m.content === "string");

  const messages = [
    { role: "system", content: buildSystemPrompt(mentorProfile) },
    ...userMessages,
  ] as { role: "system" | "user" | "assistant"; content: string }[];

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 });
    }
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Chat error" }, { status: 500 });
  }
}
