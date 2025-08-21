# Finance Career Mentor (Next.js + Clerk + Stripe + OpenAI)

An MVP chat app where users get **one free question**, then must **sign in** and **subscribe monthly** to continue.
Tailored for **financecareermentor.com** with marketing copy focused on finance use cases and AI mentor benefits.

## Quick Start (Local)
1. `npm i`
2. Copy `.env.example` to `.env.local` and fill values.
3. `npm run dev`

## Deploy (GitHub UI + Vercel UI)
1. Upload this project to a GitHub repo.
2. Import the repo into Vercel. Add env vars:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PRICE_ID`
   - `NEXT_PUBLIC_APP_URL` = `https://financecareermentor.com`
3. Deploy.

## Notes
- First question is free (client-side). Subsequent messages require sign-in and an active Stripe subscription (checked server-side by email).
- Not legal, financial, or HR advice. Avoid sharing confidential or proprietary info.
