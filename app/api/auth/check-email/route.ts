import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Check if an email is allowed to sign in.
 * Rules:
 * - If no users exist: allow (first user becomes admin)
 * - If users exist: only allow existing ADMIN users
 *
 * This prevents non-admin emails from receiving magic links,
 * protecting Resend quota and preventing unauthorized sign-in attempts.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip = getClientIp(request);
    const rateLimitResult = checkRateLimit(`check-email:${ip}`, RATE_LIMITS.auth);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { allowed: false, reason: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { allowed: false, reason: "Email is required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if any users exist
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      // No users yet - first user will become admin
      return NextResponse.json({
        allowed: true,
        isFirstUser: true,
        message: "Welcome! You will be the first admin."
      });
    }

    // Users exist - check if this email belongs to an admin
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { role: true },
    });

    if (!user) {
      // Email not in database - not allowed
      return NextResponse.json({
        allowed: false,
        reason: "Sign-in is restricted to administrators only."
      });
    }

    if (user.role !== "ADMIN") {
      // User exists but is not admin - not allowed
      return NextResponse.json({
        allowed: false,
        reason: "Sign-in is restricted to administrators only."
      });
    }

    // User is an admin - allowed
    return NextResponse.json({
      allowed: true,
      isFirstUser: false
    });

  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { allowed: false, reason: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
