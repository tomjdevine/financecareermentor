import { clerkMiddleware } from "@clerk/nextjs/server";

// All routes public by default; gating happens in the UI/API routes.
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
