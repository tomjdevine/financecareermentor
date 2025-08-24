import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "";
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Finance Career Mentor <onboarding@resend.dev>";

function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();
    const company = String(body?.company || "").trim(); // honeypot

    if (company) return NextResponse.json({ ok: true }); // silently drop bots
    if (!name || name.length > 120) return bad("Invalid name");
    if (!email || email.length > 200 || !email.includes("@")) return bad("Invalid email");
    if (!message || message.length < 10 || message.length > 5000) return bad("Invalid message");
    const sub = subject && subject.length <= 200 ? subject : "New contact form submission";

    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
      return bad("Contact form not configured", 500);
    }

    const text = [
      `New message from FinanceCareerMentor.com contact form`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${sub}`,
      ``,
      message,
    ].join("\n");

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        subject: sub,
        text,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return bad(`Email provider error: ${t}`, 502);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return bad(e?.message || "Failed to send", 500);
  }
}