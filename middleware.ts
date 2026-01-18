import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Middleware uses the Edge-compatible auth.config.ts (NOT auth.ts)
 * because Prisma is not compatible with Edge runtime.
 *
 * The 'authorized' callback in auth.config.ts handles route protection.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Protect admin and dashboard routes
  // Exclude api, static files, images, and auth routes from middleware
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
