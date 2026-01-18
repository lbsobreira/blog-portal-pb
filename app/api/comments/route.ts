import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitHeaders } from "@/lib/rate-limit";

// GET /api/comments?postId=xxx - Get comments for a post
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Fetch all comments for the post with nested structure
    const comments = await prisma.comment.findMany({
      where: {
        postId,
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
    });

    // Transform comments to include display name (user name or nickname)
    const transformedComments = comments.map((comment) => ({
      ...comment,
      displayName: comment.user?.name || comment.nickname || "Anonymous",
      replies: comment.replies.map((reply) => ({
        ...reply,
        displayName: reply.user?.name || reply.nickname || "Anonymous",
      })),
    }));

    return NextResponse.json({ comments: transformedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
// Supports both authenticated (admin) and anonymous (readers) comments
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isAuthenticated = !!session?.user;

    // Rate limit by IP for anonymous users, user ID for authenticated
    const clientIp = getClientIp(req);
    const rateLimitKey = isAuthenticated
      ? `comments:user:${session.user.id}`
      : `comments:ip:${clientIp}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.comments);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many comments. Please wait ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body = await req.json();
    const { postId, content, parentId, nickname, email } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 }
      );
    }

    // Anonymous users must provide a nickname
    if (!isAuthenticated && (!nickname || nickname.trim().length === 0)) {
      return NextResponse.json(
        { error: "Nickname is required" },
        { status: 400 }
      );
    }

    // Validate nickname length (max 50 characters)
    if (nickname && nickname.length > 50) {
      return NextResponse.json(
        { error: "Nickname is too long (max 50 characters)" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Validate content length (max 5000 characters)
    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Comment is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Validate content is not just whitespace
    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If replying to a comment, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    // Create comment - authenticated or anonymous
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        // Authenticated user
        ...(isAuthenticated && { userId: session.user.id }),
        // Anonymous user
        ...(!isAuthenticated && {
          nickname: nickname.trim(),
          email: email?.trim() || null,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Add display name to response
    const responseComment = {
      ...comment,
      displayName: comment.user?.name || comment.nickname || "Anonymous",
    };

    return NextResponse.json({ comment: responseComment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
