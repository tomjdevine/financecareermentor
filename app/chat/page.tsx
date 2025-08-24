"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_LENGTH = 12000; // cap the text we inject to keep prompts manageable

const DEFAULT_MENTOR = "Seasoned finance executive";

const PRESETS = [
  "CFO",
  "Finance Director",
  "Controller",
  "Line Manager",
  "Bank MD",
  "Global RM",
  "Other",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I’m your finance career mentor. What’s on your mind?" }
  ]);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [freeUsed, setFreeUsed] = useState<boolean>(false);
  const [locked, setLocked] = useState<boolean>(false); // paywall state after free message is used
  const [rechecking, setRechecking] = useState<boolean>(false);
  const [recheckMsg, setRecheckMsg] = useState<string>("");
  const { isSignedIn } = useUser();
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const [mentorProfile, setMentorProfile] = useState<string>(DEFAULT_MENTOR);
  const [otherMode, setOtherMode] = useState<boolean>(false);
  const [otherValue, setOtherValue] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFreeUsed(localStorage.getItem("free_used") === "1");
    }
  }, []);

  // Pre-fill input when arriving via /chat?q=... and /chat?mentor=...
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !input) {
      setInput(q);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
    const m = searchParams.get("mentor");
    if (m) setMentorProfile(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const canSend = () => {
    if (locked) return false;
    if (!freeUsed) return true;
    // After first question, we check sub in onSend; controls remain enabled until locked
    return true;
  };

  const onSend = async () => {
    if (!input.trim() || locked) return;
    setError(null);
    setRecheckMsg("");

    if (!freeUsed) {
      localStorage.setItem("free_used", "1");
      setFreeUsed(true);
    } else {
      // After first free message, enforce subscription without redirect:
      if (!isSignedIn) {
        setLocked(true);
        return;
      }
      try {
        const sub = await fetch("/api/subscription/check", { headers: { "Content-Type": "application/json" } });
        const data = await sub.json();
        if (!data.active) {
          setLocked(true);
          return;
        }
      } catch {
        // If we cannot verify, be safe and lock
        setLocked(true);
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
        body: JSON.stringify({ messages: newMessages, mentorProfile }),
      });
      if (!res.ok) {
        let errText = "Failed to get reply";
        try {
          const j = await res.json();
          errText = j?.error || errText;
        } catch {}
        throw new Error(errText);
      }
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
  const openFilePicker = () => {
    if (!locked) fileRef.current?.click();
  };

  const handleFile = async (file: File) => {
    try {
      setError(null);
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File too large. Max size is ${Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB.`);
        return;
      }
      const name = file.name || "attachment";
      const ext = (file.name.toLowerCase().split(".").pop() || "").trim();

      // TXT
      if (ext === "txt" || file.type.startsWith("text/")) {
        const text = await file.text();
        injectExtractedText(`Text file: ${name}`, text);
        return;
      }

      // PDF
      if (ext === "pdf" || file.type === "application/pdf") {
        const buf = await file.arrayBuffer();
        const pdfjs: any = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";
        const pdf: any = await pdfjs.getDocument({ data: buf }).promise;
        const out: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = (content.items as any[]).map((it) => ("str" in it ? it.str : "")).join(" ");
          out.push(text);
          if (out.join(" ").length > MAX_TEXT_LENGTH) break;
        }
        const combined = out.join("\n\n").trim();
        injectExtractedText(`PDF document: ${name}`, combined);
        return;
      }

      // DOCX
      if (ext === "docx") {
        const buf = await file.arrayBuffer();
        // @ts-ignore - mammoth browser build has no official types
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.extractRawText({ arrayBuffer: buf });
        const text: string = (result && result.value) || "";
        injectExtractedText(`DOCX document: ${name}`, text);
        return;
      }

      // DOC (legacy)
      if (ext === "doc") {
        setError("Legacy .doc files aren't supported. Please convert to PDF or DOCX and try again.");
        return;
      }

      // CSV
      if (ext === "csv") {
        const text = await file.text();
        injectExtractedText(`CSV data: ${name}`, text);
        return;
      }

      // XLS / XLSX
      if (ext === "xls" || ext === "xlsx") {
        const buf = await file.arrayBuffer();
        const XLSX: any = await import("xlsx");
        const wb = XLSX.read(buf, { type: "array" });
        const pieces: string[] = [];
        wb.SheetNames.forEach((sheetName: string) => {
          const ws = wb.Sheets[sheetName];
          if (!ws) return;
          try {
            const csv = XLSX.utils.sheet_to_csv(ws);
            pieces.push(`--- Sheet: ${sheetName} ---\n${csv}`);
          } catch {
            const json = XLSX.utils.sheet_to_json(ws);
            pieces.push(`--- Sheet: ${sheetName} (JSON) ---\n${JSON.stringify(json)}`);
          }
        });
        const merged = pieces.join("\n\n");
        injectExtractedText(`Spreadsheet: ${name}`, merged);
        return;
      }

      setError("Unsupported file type. Please upload PDF, TXT, DOCX, XLS/XLSX, or CSV.");
    } catch (err: any) {
      console.error(err);
      setError("Couldn't read that file. Please try a different format (PDF, DOCX, XLS/XLSX, CSV, or TXT).");
    }
  };

  const injectExtractedText = (label: string, raw: string) => {
    const clipped = raw.slice(0, MAX_TEXT_LENGTH);
    const prefix = `${label} extracted content (truncated if long):\n\n`;
    setInput((prev) => `${prev ? prev + "\n\n" : ""}${prefix}${clipped}`);
    textareaRef.current?.focus();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && !locked) await handleFile(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  const selectPreset = (p: string) => {
    if (p === "Other") {
      setOtherMode(true);
      setOtherValue("");
      setMentorProfile(DEFAULT_MENTOR);
    } else {
      setOtherMode(false);
      setMentorProfile(p);
    }
  };

  const applyOther = () => {
    const v = (otherValue || "").trim();
    if (v) {
      setMentorProfile(v.slice(0, 80));
      setOtherMode(false);
    }
  };

  async function recheckNow() {
    try {
      setRechecking(true);
      setRecheckMsg("");
      const sub = await fetch("/api/subscription/check", { headers: { "Content-Type": "application/json" } });
      const data = await sub.json();
      if (data?.active) {
        setLocked(false);
        setRecheckMsg("You're good to go! Subscription active.");
        setTimeout(() => setRecheckMsg(""), 3000);
      } else {
        setRecheckMsg("Still not active yet. If you just subscribed, wait a few seconds and try again.");
      }
    } catch {
      setRecheckMsg("Couldn't verify right now. Please refresh and try again.");
    } finally {
      setRechecking(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        {/* Left rail: mentor profile chips */}
        <aside className="card p-3 h-max sticky top-4">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Mentor profile</h3>
          <div className="flex flex-wrap md:flex-col gap-2">
            {PRESETS.map((p) => {
              const active = (!otherMode && mentorProfile === p) || (p === "Other" && otherMode);
              return (
                <button
                  key={p}
                  onClick={() => selectPreset(p)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    active
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Selected: <span className="font-medium">{otherMode ? "Other…" : mentorProfile}</span>
          </div>
          {otherMode && (
            <div className="mt-2 grid gap-2">
              <input
                type="text"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyOther();
                }}
                placeholder="e.g., FP&A VP in SaaS"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={applyOther}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Use profile
                </button>
                <button
                  onClick={() => {
                    setOtherMode(false);
                    setMentorProfile(DEFAULT_MENTOR);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Chat area */}
        <div className="card p-4 md:p-6">
          <div className="mb-3 text-sm text-slate-600">
            Chatting with: <span className="font-medium">{mentorProfile}</span>
          </div>

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

          {/* Input area with paywall overlay */}
          <div className="mt-4 relative">
            <div className={locked ? "opacity-50 pointer-events-none" : ""}>
              <div className="grid gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Ask your finance mentor… (attach PDF, DOCX, XLS/XLSX, CSV or TXT)"
                  disabled={locked}
                  className="w-full min-h-[80px] p-3 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain"
                      className="hidden"
                      onChange={onFileChange}
                      disabled={locked}
                    />
                    <button
                      onClick={openFilePicker}
                      disabled={locked}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Attach file
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <SignedOut>
                      {freeUsed ? (
                        <div className="text-sm text-amber-700">Subscribe to continue.</div>
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
                      className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-medium disabled:opacity-60 hover:bg-blue-700 transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            </div>

            {locked && (
              <div className="absolute inset-0 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-2">You’ve used your free question</h3>
                <p className="text-sm text-slate-600 mb-4 max-w-md">
                  Subscribe to continue this conversation and get unlimited chats with your finance mentor.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="/subscribe"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Subscribe for unlimited chats
                  </a>
                  <button
                    onClick={recheckNow}
                    disabled={rechecking}
                    className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {rechecking ? "Rechecking…" : "Already subscribed? Recheck now"}
                  </button>
                </div>
                {recheckMsg && <p className="text-xs text-slate-600 mt-3">{recheckMsg}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
