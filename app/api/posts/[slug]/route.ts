import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// In-memory view tracker (IP hash -> timestamp)
// Cleaned up periodically to prevent memory growth
const viewTracker = new Map<string, number>();
const VIEW_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewTracker.entries()) {
    if (now - timestamp > VIEW_WINDOW) {
      viewTracker.delete(key);
    }
  }
}, 60 * 60 * 1000);

// GET /api/posts/[slug] - Get single post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch post with all relations FIRST (before incrementing views)
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          where: {
            parentId: null, // Only top-level comments
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post is published (unless user is admin)
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    if (!post.published && !isAdmin) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // IP-based view deduplication (cookieless)
    // Hash the IP for privacy, track views per IP+post for 24 hours
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const ipHash = crypto.createHash("sha256").update(ip + post.id).digest("hex").slice(0, 16);

    const hasViewed = viewTracker.has(ipHash);

    if (!hasViewed) {
      await prisma.post.update({
        where: { slug },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      // Track this view for 24 hours
      viewTracker.set(ipHash, Date.now());
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[slug] - Update post (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      coverImage,
      published,
      categoryId,
      tags,
    } = body;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Generate new slug if title changed
    let newSlug = slug;
    if (title && title !== existingPost.title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug already exists (and it's not the current post)
      const slugExists = await prisma.post.findUnique({
        where: { slug: newSlug },
      });

      if (slugExists && slugExists.id !== existingPost.id) {
        return NextResponse.json(
          { error: "A post with this title already exists" },
          { status: 400 }
        );
      }
    }

    // Calculate reading time if content changed
    let readingTime = existingPost.readingTime;
    if (content && content !== existingPost.content) {
      const wordCount = content.split(/\s+/).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Update post
    const post = await prisma.post.update({
      where: { slug },
      data: {
        ...(title && { title }),
        ...(newSlug !== slug && { slug: newSlug }),
        ...(content && { content, readingTime }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && {
          published,
          publishedAt:
            published && !existingPost.published ? new Date() : undefined,
        }),
        ...(categoryId !== undefined && { categoryId }),
        // Handle tags update
        ...(tags && {
          tags: {
            deleteMany: {}, // Remove all existing tags
            create: tags.map((tagId: string) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[slug] - Delete post (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete post (cascade will handle comments, likes, tags)
    await prisma.post.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
