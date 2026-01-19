import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible Auth.js configuration.
 * This file should NOT import Prisma or any Edge-incompatible libraries.
 * Used by middleware.ts for route protection.
 *
 * NOTE: Providers that require database (like Resend/Email) should be in auth.ts only.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  // Providers are defined in auth.ts (Resend requires adapter, Credentials needs Prisma)
  providers: [],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // This callback determines if a user is authorized to access a route
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as any)?.role === "ADMIN";
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnAdmin) {
        // Admin routes require ADMIN role, not just being logged in
        if (isAdmin) return true;
        // Redirect non-admins to home page (not login, to avoid redirect loop)
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true; // Allow access to public pages
    },
    // JWT callback to persist user data
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    // Session callback to expose user data
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id || token.sub) as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | undefined;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
};

export default authConfig;
