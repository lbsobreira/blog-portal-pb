import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitHeaders } from "@/lib/rate-limit";

// GET requests don't need rate limiting (callbacks, session checks)
export const { GET } = handlers;

// POST requests (sign-in attempts) need rate limiting
export async function POST(request: NextRequest) {
  // Rate limit by IP address
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please try again later." },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Delegate to NextAuth handler
  return handlers.POST(request);
}
