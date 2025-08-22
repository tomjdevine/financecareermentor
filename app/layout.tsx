import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Inter } from "next/font/google";
import Script from "next/script";
import SignInCta from "../components/SignInCta";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://financecareermentor.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Finance Career Mentor — Specific, senior-level advice on demand",
  description: "Chat with an AI mentor tuned for finance careers. Resume reviews, offer decisions, raise planning, interview prep.",
  openGraph: {
    title: "Finance Career Mentor — Specific, senior-level advice on demand",
    description: "Chat with an AI mentor tuned for finance careers. Resume reviews, offer decisions, raise planning, interview prep.",
    url: "/",
    siteName: "Finance Career Mentor",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Career Mentor — Specific, senior-level advice on demand",
    description: "Chat with an AI mentor tuned for finance careers. Resume reviews, offer decisions, raise planning, interview prep.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* Google Analytics */}
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-RCX9Y9PNK9" strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', 'G-RCX9Y9PNK9', { send_page_view: true });
            `}
          </Script>

          <nav className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200">
            <div className="container flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <Link href="/" className="font-semibold tracking-tight text-slate-900">Finance Career Mentor</Link>
                {/* Removed Chat and Subscribe links per request */}
              </div>
              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInCta />
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonTrigger: "rounded-full border border-slate-200" } }} />
                </SignedIn>
              </div>
            </div>
          </nav>
          {children}
          <footer className="py-10 text-center text-sm text-slate-600">
            <div className="container">
              <p>© {new Date().getFullYear()} Finance Career Mentor.</p>
              <p className="mt-2">Not legal or financial advice. Avoid sharing confidential or proprietary information.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
