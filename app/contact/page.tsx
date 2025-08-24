"use client";

import { useState } from "react";

type Status = { ok: boolean; message: string };

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  // Honeypot
  const [company, setCompany] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      setStatus({ ok: true, message: "Thanks—your message has been sent. We’ll reply to your email soon." });
      setName(""); setEmail(""); setSubject(""); setMessage(""); setCompany("");
    } catch (err: any) {
      setStatus({ ok: false, message: err?.message || "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Contact us</h1>
      <p className="text-slate-600 mb-6">
        Have a question about plans, billing, or the product? Send us a note and we’ll get back to you.
      </p>

      <form onSubmit={onSubmit} className="card p-6 grid gap-4">
        <div className="grid gap-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-800">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Your name"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="you@example.com"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="subject" className="text-sm font-medium text-slate-800">Subject (optional)</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="What’s this about?"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="message" className="text-sm font-medium text-slate-800">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="How can we help?"
          />
        </div>

        {/* Honeypot field (hidden from humans) */}
        <div className="hidden">
          <label htmlFor="company">Company</label>
          <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
          {status && (
            <p className={`text-sm ${status.ok ? "text-emerald-700" : "text-red-600"}`}>
              {status.message}
            </p>
          )}
        </div>
      </form>

      <p className="text-xs text-slate-500 mt-6">
        Not legal or financial advice. Avoid sharing confidential or proprietary information.
      </p>
    </main>
  );
}