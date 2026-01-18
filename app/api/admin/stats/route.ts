import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats - Get dashboard statistics (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all stats in parallel
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalComments,
      totalLikes,
      totalProjects,
      totalUsers,
      recentPosts,
      topPosts,
    ] = await Promise.all([
      // Total posts
      prisma.post.count(),
      // Published posts
      prisma.post.count({ where: { published: true } }),
      // Draft posts
      prisma.post.count({ where: { published: false } }),
      // Total views (sum of all post views)
      prisma.post.aggregate({ _sum: { views: true } }),
      // Total comments
      prisma.comment.count(),
      // Total likes
      prisma.like.count(),
      // Total projects
      prisma.project.count(),
      // Total users
      prisma.user.count(),
      // Recent posts (last 5)
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          views: true,
          createdAt: true,
        },
      }),
      // Top posts by views
      prisma.post.findMany({
        take: 5,
        where: { published: true },
        orderBy: { views: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        posts: {
          total: totalPosts,
          published: publishedPosts,
          drafts: draftPosts,
        },
        engagement: {
          views: totalViews._sum.views || 0,
          comments: totalComments,
          likes: totalLikes,
        },
        projects: totalProjects,
        users: totalUsers,
      },
      recentPosts,
      topPosts,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
