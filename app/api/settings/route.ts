import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/settings - Get site settings (public)
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update site settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      siteName,
      siteTagline,
      siteLogo,
      siteLogoZoom,
      siteLogoX,
      siteLogoY,
      profileName,
      profileTitle,
      profileLocation,
      profileBio,
      profileImage,
      profileImageZoom,
      profileImageX,
      profileImageY,
      coverImage,
      githubUrl,
      linkedinUrl,
      twitterUrl,
      contactEmail,
      experience,
      skills,
      certifications,
      badges,
      usefulLinks,
    } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        ...(siteName !== undefined && { siteName: siteName || "IT Blog" }),
        ...(siteTagline !== undefined && { siteTagline: siteTagline || "A personal space to showcase IT projects and share technical knowledge" }),
        ...(siteLogo !== undefined && { siteLogo: siteLogo || null }),
        ...(siteLogoZoom !== undefined && { siteLogoZoom: siteLogoZoom || 100 }),
        ...(siteLogoX !== undefined && { siteLogoX: siteLogoX || 0 }),
        ...(siteLogoY !== undefined && { siteLogoY: siteLogoY || 0 }),
        ...(profileName !== undefined && { profileName }),
        ...(profileTitle !== undefined && { profileTitle }),
        ...(profileLocation !== undefined && { profileLocation }),
        ...(profileBio !== undefined && { profileBio }),
        ...(profileImage !== undefined && { profileImage: profileImage || null }),
        ...(profileImageZoom !== undefined && { profileImageZoom: profileImageZoom || 100 }),
        ...(profileImageX !== undefined && { profileImageX: profileImageX || 0 }),
        ...(profileImageY !== undefined && { profileImageY: profileImageY || 0 }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(twitterUrl !== undefined && { twitterUrl: twitterUrl || null }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail || null }),
        ...(experience !== undefined && { experience: JSON.stringify(experience) }),
        ...(skills !== undefined && { skills: JSON.stringify(skills) }),
        ...(certifications !== undefined && { certifications: JSON.stringify(certifications) }),
        ...(badges !== undefined && { badges: JSON.stringify(badges) }),
        ...(usefulLinks !== undefined && { usefulLinks: JSON.stringify(usefulLinks) }),
      },
      create: {
        id: "default",
        siteName: siteName || "IT Blog",
        siteTagline: siteTagline || "A personal space to showcase IT projects and share technical knowledge",
        siteLogo: siteLogo || null,
        siteLogoZoom: siteLogoZoom || 100,
        siteLogoX: siteLogoX || 0,
        siteLogoY: siteLogoY || 0,
        profileName: profileName || "Your Name",
        profileTitle: profileTitle || "IT Professional",
        profileLocation: profileLocation || "Your Location",
        profileBio: profileBio || "Welcome to my blog!",
        profileImage: profileImage || null,
        profileImageZoom: profileImageZoom || 100,
        profileImageX: profileImageX || 0,
        profileImageY: profileImageY || 0,
        coverImage: coverImage || null,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        contactEmail: contactEmail || null,
        experience: experience ? JSON.stringify(experience) : "[]",
        skills: skills ? JSON.stringify(skills) : "[]",
        certifications: certifications ? JSON.stringify(certifications) : "[]",
        badges: badges ? JSON.stringify(badges) : "[]",
        usefulLinks: usefulLinks ? JSON.stringify(usefulLinks) : "[]",
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
