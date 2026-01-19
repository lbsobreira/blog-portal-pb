import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// Type bypass: @auth/prisma-adapter and next-auth bundle different versions of @auth/core
// This causes TypeScript conflicts even though runtime behavior is correct
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaAdapter = PrismaAdapter(prisma) as any;

const isDev = process.env.NODE_ENV === "development";
const forceResend = process.env.FORCE_RESEND === "true";
// Use Resend if in production OR if FORCE_RESEND is set (for local testing)
const useResend = !isDev || forceResend;

/**
 * Full Auth.js configuration with Prisma adapter.
 * This file should be used everywhere EXCEPT middleware.ts
 * (middleware uses auth.config.ts which is Edge-compatible).
 *
 * Dev mode (default): Credentials provider (no adapter needed, uses JWT)
 * Dev mode (FORCE_RESEND=true): Both providers available for testing
 * Prod mode: Resend provider only (requires adapter for verification tokens)
 */

// Build config object separately to allow type casting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authOptions: any = {
  // Spread the Edge-compatible base config
  ...authConfig,
  // Add Prisma adapter when using Resend (required for verification tokens)
  ...(useResend ? { adapter: prismaAdapter } : {}),
  // Providers based on environment
  providers: useResend
    ? [
        // Production / Test mode: Magic link via email (requires adapter)
        Resend({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          apiKey: process.env.RESEND_API_KEY,
        }),
        // Also include dev credentials if in development (for fallback)
        ...(isDev
          ? [
              Credentials({
                id: "dev-email",
                name: "Development Email",
                credentials: {
                  email: { label: "Email", type: "email" },
                },
                async authorize(credentials) {
                  if (!credentials?.email) return null;
                  const email = (credentials.email as string).toLowerCase().trim();

                  // Check if any users exist
                  const userCount = await prisma.user.count();

                  let user = await prisma.user.findUnique({
                    where: { email },
                  });

                  if (userCount === 0) {
                    // First user - create as admin
                    if (!user) {
                      user = await prisma.user.create({
                        data: {
                          email,
                          name: email.split("@")[0],
                          role: "ADMIN",
                        },
                      });
                    }
                  } else {
                    // Users exist - only allow existing admins
                    if (!user || user.role !== "ADMIN") {
                      console.log(`Blocked sign-in attempt for non-admin: ${email}`);
                      return null;
                    }
                  }

                  return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                  };
                },
              }),
            ]
          : []),
      ]
    : [
        // Development-only: Direct email login (bypasses verification)
        Credentials({
          id: "dev-email",
          name: "Development Email",
          credentials: {
            email: { label: "Email", type: "email" },
          },
          async authorize(credentials) {
            if (!credentials?.email) return null;

            const email = (credentials.email as string).toLowerCase().trim();

            // Check if any users exist
            const userCount = await prisma.user.count();

            let user = await prisma.user.findUnique({
              where: { email },
            });

            if (userCount === 0) {
              // First user - create as admin
              if (!user) {
                user = await prisma.user.create({
                  data: {
                    email,
                    name: email.split("@")[0],
                    role: "ADMIN",
                  },
                });
              }
            } else {
              // Users exist - only allow existing admins
              if (!user || user.role !== "ADMIN") {
                console.log(`Blocked sign-in attempt for non-admin: ${email}`);
                return null;
              }
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
            };
          },
        }),
      ],
  // Events to handle user creation (for first user = admin logic with Resend)
  events: {
    async createUser({ user }: { user: { id?: string; email?: string | null } }) {
      // When a user is created via Resend/adapter, check if they're the first user
      const userCount = await prisma.user.count();
      if (userCount === 1 && user.id) {
        // First user becomes admin
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
        console.log(`First user ${user.email} promoted to ADMIN`);
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    // signIn callback - block non-admin sign-ins (defense in depth for magic links)
    async signIn({ user, account }: { user: any; account: any }) {
      // Skip check for credentials provider (already handled in authorize)
      if (account?.provider === "dev-email") {
        return true;
      }

      // For magic link (Resend), check if user is admin
      if (account?.provider === "resend") {
        const email = user.email?.toLowerCase().trim();
        if (!email) return false;

        // Check how many users exist
        const userCount = await prisma.user.count();

        // If this is the first user, allow (they'll be promoted to admin)
        if (userCount === 0 || userCount === 1) {
          // Could be 1 if the user was just created by the adapter
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { role: true },
          });
          // Allow first user or if they're already admin
          if (!existingUser || existingUser.role === "ADMIN") {
            return true;
          }
        }

        // Check if user exists and is admin
        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { role: true },
        });

        if (!existingUser || existingUser.role !== "ADMIN") {
          console.log(`Blocked magic link sign-in for non-admin: ${email}`);
          return false;
        }
      }

      return true;
    },
    // Override session callback to fetch fresh role from database
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = (token.id || token.sub) as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | undefined;

        // Get fresh role from database (only if we have a user ID)
        if (session.user.id) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { role: true },
            });
            if (user) {
              session.user.role = user.role;
            }
          } catch {
            // If database query fails, use token role
            session.user.role = token.role as any;
          }
        }
      }
      return session;
    },
  },
};

// Export NextAuth with typed-as-any config to bypass @auth/core version conflicts
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
