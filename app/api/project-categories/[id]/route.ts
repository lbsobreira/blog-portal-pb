import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/project-categories/[id] - Update project category (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, order } = body;

    const existing = await prisma.projectCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Generate new slug if name changed
    const slug = name
      ? name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : existing.slug;

    // Check for conflicts
    if (name && name !== existing.name) {
      const conflict = await prisma.projectCategory.findFirst({
        where: {
          OR: [{ name }, { slug }],
          NOT: { id },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.projectCategory.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug,
        description: description !== undefined ? description : existing.description,
        order: order !== undefined ? order : existing.order,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating project category:", error);
    return NextResponse.json(
      { error: "Failed to update project category" },
      { status: 500 }
    );
  }
}

// DELETE /api/project-categories/[id] - Delete project category (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.projectCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete the category - projects will have categoryId set to null (onDelete: SetNull)
    await prisma.projectCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting project category:", error);
    return NextResponse.json(
      { error: "Failed to delete project category" },
      { status: 500 }
    );
  }
}
