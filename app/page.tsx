"use client";

import Link from "next/link";

export default function Home() {
  const trackStartChat = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "start_chat_click", { location: "hero" });
    }
  };

  return (
    <main className="container py-16">
      {/* Hero */}
      <section className="grid gap-6">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
          Chat with a seasoned finance mentor—anytime
        </h1>
        <h2 className="text-lg text-slate-600 max-w-2xl">
          Get actionable guidance from an AI mentor trained on 50,000 finance-career insights curated from industry-leading executives.
        </h2>
        <div>
          <Link
            href="/chat"
            onClick={trackStartChat}
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Ask your question
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2 text-slate-900">High-impact use cases</h3>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li><strong>Resume / CV Review:</strong> Improve framing, keywords, and quantified achievements for FP&amp;A, IB/PE, Big 4, corporate, and startup roles.</li>
            <li><strong>Raise & Promotion Prep:</strong> Build the case, choose timing, rehearse the conversation, and plan fallback options.</li>
            <li><strong>Offer Decisions:</strong> Compare scope, trajectory, brand, manager quality, compensation, and exit options.</li>
            <li><strong>Interview Prep:</strong> Targeted drills on metrics, stakeholder stories, and financial modeling narratives.</li>
            <li><strong>Career Pathing:</strong> Navigate moves from analyst → manager → director → CFO; or pivot into FP&amp;A, corp dev, or investor roles.</li>
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2 text-slate-900">Why an AI mentor?</h3>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li><strong>Always on:</strong> Night or day, ask as long as you want.</li>
            <li><strong>No judgement:</strong> Practice answers, iterate drafts, explore options freely.</li>
            <li><strong>Fast & specific:</strong> Structured, practical guidance in minutes.</li>
            <li><strong>Affordable coaching:</strong> A fraction of traditional mentoring or career coaching.</li>
          </ul>
        </div>
      </section>

      {/* Grounding */}
      <section className="card p-6 mt-6">
        <h3 className="text-xl font-semibold mb-2 text-slate-900">Grounded in real finance know-how</h3>
        <p className="text-slate-700">
          The mentor is tuned to think like a seasoned finance executive. It emphasizes concrete frameworks used by VPs, CFOs, and hiring managers.
          We’re evolving toward a richer knowledge base curated from industry leaders and high-quality public sources to deliver highly relevant, role-specific advice.
        </p>
        <p className="text-slate-500 text-sm mt-2">Note: Do not share confidential or proprietary information.</p>
      </section>

      {/* Pricing */}
      <section className="mt-10">
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">$9/month</h3>
              <p className="text-slate-700">Unlimited chats with your finance mentor. Cancel anytime.</p>
            </div>
            <Link
              href="/subscribe"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-center"
            >
              Subscribe
            </Link>
          </div>
          <ul className="list-disc list-inside text-slate-700 mt-4 space-y-1">
            <li>Unlimited questions & follow-ups</li>
            <li>Resume/CV reviews with targeted wording</li>
            <li>Offer evaluations & negotiation prep</li>
            <li>Interview drills and story refinement</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10">
        <div className="card p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Ready to get tailored advice?</h3>
            <p className="text-slate-700">Start a conversation in seconds.</p>
          </div>
          <Link
            href="/chat"
            onClick={trackStartChat}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Ask your question
          </Link>
        </div>
      </section>
    </main>
  );
}
