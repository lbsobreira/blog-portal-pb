import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings/branding - Get site branding (public, cached)
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: {
        siteName: true,
        siteTagline: true,
        siteLogo: true,
        siteLogoZoom: true,
        siteLogoX: true,
        siteLogoY: true,
      },
    });

    // Return defaults if no settings exist
    const branding = {
      siteName: settings?.siteName || "IT Blog",
      siteTagline: settings?.siteTagline || "A personal space to showcase IT projects and share technical knowledge",
      siteLogo: settings?.siteLogo || null,
      siteLogoZoom: settings?.siteLogoZoom || 100,
      siteLogoX: settings?.siteLogoX || 0,
      siteLogoY: settings?.siteLogoY || 0,
    };

    // Short cache for development, can increase in production
    return NextResponse.json(branding, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching branding:", error);
    return NextResponse.json(
      { siteName: "IT Blog", siteTagline: "A personal space to showcase IT projects and share technical knowledge", siteLogo: null, siteLogoZoom: 100, siteLogoX: 0, siteLogoY: 0 },
      { status: 200 }
    );
  }
}
