import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS, rateLimitHeaders } from "@/lib/rate-limit";

// POST /api/likes - Toggle like on a post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to like posts" },
        { status: 401 }
      );
    }

    // Rate limit by user ID
    const rateLimitKey = `likes:${session.user.id}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.likes);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
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

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike - delete the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({
        liked: false,
        likeCount,
        message: "Post unliked",
      });
    } else {
      // Like - create new like
      await prisma.like.create({
        data: {
          postId,
          userId: session.user.id,
        },
      });

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({
        liked: true,
        likeCount,
        message: "Post liked",
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

// GET /api/likes?postId=xxx - Get like status for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Get like count
    const likeCount = await prisma.like.count({
      where: { postId },
    });

    // Check if current user liked this post
    let liked = false;
    if (session?.user) {
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: session.user.id,
          },
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error("Error fetching like status:", error);
    return NextResponse.json(
      { error: "Failed to fetch like status" },
      { status: 500 }
    );
  }
}
