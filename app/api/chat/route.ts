import { NextRequest, NextResponse } from "next/server";

const systemPrompt = `You are a seasoned finance executive (CFO / Head of Finance) offering career advice.
Be candid, specific, and practical. Use bullet points when helpful.
When asked to review a CV/resume, suggest structure, keywords, and quantified achievements.
When asked about offers, analyze role scope, trajectory, brand, manager quality, comp, and exit options.
When asked about raises, propose a plan: evidence, timing, framing, and alternatives.
Avoid legal/HR-sensitive claims; recommend professional help when necessary. Keep answers under ~200 words unless asked for more.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages;
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: "OpenAI error", detail: text }, { status: 500 });
    }
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
