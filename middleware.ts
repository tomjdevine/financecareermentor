import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/chat", "/api/chat", "/api/subscription/check"],
});

export const config = {
  matcher: ["/((?!.*\..*|_next).*)", "/"],
};
