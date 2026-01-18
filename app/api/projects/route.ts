import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects - List all projects (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const technology = searchParams.get("technology");

    const where: any = {};

    // Filter by featured status
    if (featured === "true") {
      where.featured = true;
    }

    // Filter by technology (case-insensitive contains)
    if (technology) {
      where.technologies = {
        has: technology,
      };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { featured: "desc" }, // Featured projects first
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      featured,
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const projectSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug: projectSlug },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: projectSlug,
        description,
        technologies: technologies || [],
        githubUrl,
        liveUrl,
        imageUrl,
        featured: featured || false,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
