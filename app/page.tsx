import Link from "next/link";

export default function Home() {
  return (
    <main className="container py-16">
      <section className="grid gap-6">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Specific career advice for finance professionals — on demand
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl">
          Chat with an AI mentor tuned for finance careers. Get practical guidance from the perspective of senior finance leaders.
          Your first question is free — sign in and subscribe to continue.
        </p>
        <div className="flex gap-3">
          <Link href="/chat" className="px-4 py-2 rounded-xl bg-white text-black font-medium">
            Ask your free question
          </Link>
          <Link href="/subscribe" className="px-4 py-2 rounded-xl border border-white/20">
            View pricing
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">High-impact use cases</h2>
          <ul className="list-disc list-inside text-gray-200 space-y-2">
            <li><strong>Resume / CV Review:</strong> Improve framing, keywords, and quantified achievements for FP&amp;A, IB/PE, Big 4, corporate, and startup roles.</li>
            <li><strong>Raise & Promotion Prep:</strong> Build the case, choose timing, rehearse the conversation, and plan fallback options.</li>
            <li><strong>Offer Decisions:</strong> Compare scope, trajectory, brand, manager quality, compensation, and exit options.</li>
            <li><strong>Interview Prep:</strong> Targeted drills on metrics, stakeholder stories, and financial modeling narratives.</li>
            <li><strong>Career Pathing:</strong> Navigate moves from analyst → manager → director → CFO; or pivot into FP&amp;A, corp dev, or investor roles.</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">Why an AI mentor?</h2>
          <ul className="list-disc list-inside text-gray-200 space-y-2">
            <li><strong>Always on:</strong> Night or day, ask as long as you want.</li>
            <li><strong>No judgement:</strong> Practice answers, iterate drafts, explore options freely.</li>
            <li><strong>Fast & specific:</strong> Structured, practical guidance in minutes.</li>
            <li><strong>Affordable coaching:</strong> A fraction of traditional mentoring or career coaching.</li>
          </ul>
        </div>
      </section>

      <section className="card p-6 mt-6">
        <h2 className="text-xl font-semibold mb-2">Grounded in real finance know-how</h2>
        <p className="text-gray-200">
          The mentor is tuned to think like a seasoned finance executive. It emphasizes concrete frameworks used by VPs, CFOs, and hiring managers.
          We’re evolving toward a richer knowledge base curated from industry leaders and high-quality public sources to deliver highly relevant, role-specific advice.
        </p>
        <p className="text-gray-400 text-sm mt-2">Note: Do not share confidential or proprietary information.</p>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="card p-6">
          <h3 className="font-semibold">1) Ask</h3>
          <p className="text-gray-300">Your first question is free. Describe your situation or paste a resume snippet.</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">2) Sign in</h3>
          <p className="text-gray-300">Create an account to keep your conversation thread going.</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">3) Subscribe</h3>
          <p className="text-gray-300">Unlock unlimited conversations for ongoing guidance and iteration.</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="card p-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Ready to get tailored advice?</h2>
            <p className="text-gray-300">Ask your first question free — takes under a minute.</p>
          </div>
          <Link href="/chat" className="px-4 py-2 rounded-xl bg-white text-black font-medium">
            Start chatting
          </Link>
        </div>
      </section>
    </main>
  );
}
