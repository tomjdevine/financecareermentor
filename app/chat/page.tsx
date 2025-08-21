"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I’m your finance career mentor. What’s on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freeUsed, setFreeUsed] = useState(false);
  const { isSignedIn } = useUser();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFreeUsed(localStorage.getItem("free_used") === "1");
    }
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const canSend = () => {
    if (!freeUsed) return true; // first question free
    return isSignedIn; // after that, must sign in AND have subscription (checked when sending)
  };

  const onSend = async () => {
    if (!input.trim()) return;
    setError(null);

    if (!freeUsed) {
      localStorage.setItem("free_used", "1");
      setFreeUsed(true);
    } else {
      // Signed in required
      if (!isSignedIn) {
        setError("Please sign in to continue after your first free question.");
        return;
      }
      // Check subscription
      const sub = await fetch("/api/subscription/check");
      const data = await sub.json();
      if (!data.active) {
        window.location.href = "/subscribe";
        return;
      }
    }

    const newMessages = [...messages, { role: "user", content: input } as Msg];
    setMessages(newMessages);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) throw new Error("Failed to get reply");
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <main className="container py-6">
      <div className="card p-4 md:p-6">
        <div ref={listRef} className="h-[60vh] overflow-y-auto pr-1 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 border ${m.role === "user" ? "bg-white text-black border-white/10" : "bg-white/5 border-white/10"}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2 border bg-white/5 border-white/10">
                <p>Thinking…</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask your finance mentor…"
            className="w-full min-h-[80px] p-3 rounded-xl bg-white/5 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <div className="flex items-center justify-between">
            <SignedOut>
              {freeUsed ? (
                <div className="text-sm text-orange-200">Sign in to continue after your first free question.</div>
              ) : (
                <div className="text-sm text-green-200">Your first question is free.</div>
              )}
            </SignedOut>
            <SignedIn>
              <div className="text-sm text-gray-300">Subscribers get unlimited conversations.</div>
            </SignedIn>
            <button
              onClick={onSend}
              disabled={sending || !canSend()}
              className="px-4 py-2 rounded-xl bg-white text-black font-medium disabled:opacity-60"
            >
              Send
            </button>
          </div>
          {error && <p className="text-red-300 text-sm">{error}</p>}
        </div>
      </div>
    </main>
  );
}
