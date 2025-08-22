
"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import type { PDFDocumentProxy } from "pdfjs-dist";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I’m your finance career mentor. What’s on your mind?" }
  ]);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [freeUsed, setFreeUsed] = useState<boolean>(false);
  const { isSignedIn } = useUser();
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFreeUsed(localStorage.getItem("free_used") === "1");
    }
  }, []);

  // Pre-fill input when arriving via /chat?q=...
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !input) {
      setInput(q);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const canSend = () => {
    if (!freeUsed) return true;
    return isSignedIn;
  };

  const onSend = async () => {
    if (!input.trim()) return;
    setError(null);

    if (!freeUsed) {
      localStorage.setItem("free_used", "1");
      setFreeUsed(true);
    } else {
      if (!isSignedIn) {
        setError("Please sign in to continue after your first free question.");
        return;
      }
      const sub = await fetch("/api/subscription/check");
      const data = await sub.json();
      if (!data.active) {
        window.location.href = "/subscribe";
        return;
      }
    }

    const newMessages: Msg[] = [...messages, { role: "user", content: input }];
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
      const assistantMsg: Msg = { role: "assistant", content: data.reply as string };
      setMessages([...newMessages, assistantMsg]);
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

  // --- File upload handlers ---
  const openFilePicker = () => fileRef.current?.click();

  const handleFile = async (file: File) => {
    try {
      const ext = (file.name.toLowerCase().split(".").pop() || "").trim();
      if (ext === "txt" || file.type.startsWith("text/")) {
        const text = await file.text();
        setInput((prev) => `${prev ? prev + "\n\n" : ""}Please review the following resume:\n\n${text}`);
        textareaRef.current?.focus();
        return;
      }
      if (ext === "pdf" || file.type === "application/pdf") {
        const buf = await file.arrayBuffer();
        // Lazy-load pdfjs to keep bundle light
        const pdfjs = await import("pdfjs-dist/build/pdf");
        (pdfjs as any).GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";
        const pdf: PDFDocumentProxy = await (pdfjs as any).getDocument({ data: buf }).promise;
        const out: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = (content.items as any[]).map((it) => ("str" in it ? it.str : "")).join(" ");
          out.push(text);
          if (out.join(" ").length > 12000) break; // avoid overly long prompts
        }
        const combined = out.join("\n\n").trim();
        setInput((prev) => `${prev ? prev + "\n\n" : ""}Please review the following resume (extracted from PDF):\n\n${combined}`);
        textareaRef.current?.focus();
        return;
      }
      // Fallback: unsupported
      setError("Unsupported file type. Please upload a PDF or TXT file.");
    } catch (err: any) {
      console.error(err);
      setError("Couldn't read that file. Please try a different format (PDF or TXT).");
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await handleFile(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="container py-6">
      <div className="card p-4 md:p-6">
        <div ref={listRef} className="h-[60vh] overflow-y-auto pr-1 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 border ${
                  m.role === "user"
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-slate-100 text-slate-900 border-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2 border bg-slate-100 text-slate-900 border-slate-200">
                <p>Thinking…</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask your finance mentor… (or attach a PDF/TXT resume)"
            className="w-full min-h-[80px] p-3 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,text/plain,application/pdf"
                className="hidden"
                onChange={onFileChange}
              />
              <button
                onClick={openFilePicker}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Attach file
              </button>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <SignedOut>
                {freeUsed ? (
                  <div className="text-sm text-amber-700">Sign in to continue after your first free question.</div>
                ) : (
                  <div className="text-sm text-emerald-700">Your first question is free.</div>
                )}
              </SignedOut>
              <SignedIn>
                <div className="text-sm text-slate-600">Subscribers get unlimited conversations.</div>
              </SignedIn>
              <button
                onClick={onSend}
                disabled={sending || !canSend()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-60 hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </div>
    </main>
  );
}
