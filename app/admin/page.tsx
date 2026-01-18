"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  posts: {
    total: number;
    published: number;
    drafts: number;
  };
  engagement: {
    views: number;
    comments: number;
    likes: number;
  };
  projects: number;
  users: number;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  views: number;
  createdAt: string;
}

interface TopPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  _count: {
    comments: number;
    likes: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentPosts(data.recentPosts);
        setTopPosts(data.topPosts);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/admin/posts"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Total Posts
          </h3>
          <p className="text-3xl font-bold">{stats?.posts.total || 0}</p>
        </Link>

        <Link
          href="/admin/posts?filter=published"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Published
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.posts.published || 0}
          </p>
        </Link>

        <Link
          href="/admin/posts?filter=drafts"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Drafts
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats?.posts.drafts || 0}
          </p>
        </Link>

        <Link
          href="/admin/posts"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Total Views
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.engagement.views || 0}
          </p>
        </Link>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/comments"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Comments
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.engagement.comments || 0}
          </p>
        </Link>

        <Link
          href="/admin/posts"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Likes
          </h3>
          <p className="text-3xl font-bold text-red-500">
            {stats?.engagement.likes || 0}
          </p>
        </Link>

        <Link
          href="/admin/projects"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Projects
          </h3>
          <p className="text-3xl font-bold text-indigo-600">
            {stats?.projects || 0}
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
          {recentPosts.length === 0 ? (
            <p className="text-gray-500">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/posts/${post.slug}/edit`}
                      className="text-sm font-medium hover:text-blue-600 truncate block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      post.published
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Top Posts by Views</h2>
          {topPosts.length === 0 ? (
            <p className="text-gray-500">No published posts yet</p>
          ) : (
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-medium hover:text-blue-600"
                      >
                        {post.title}
                      </Link>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>{post.views} views</span>
                        <span>{post._count.comments} comments</span>
                        <span>{post._count.likes} likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/posts/new"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📝</div>
            <p className="font-medium">New Post</p>
          </Link>

          <Link
            href="/admin/posts"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📄</div>
            <p className="font-medium">Manage Posts</p>
          </Link>

          <Link
            href="/admin/projects/new"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🚀</div>
            <p className="font-medium">New Project</p>
          </Link>

          <Link
            href="/admin/categories"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🏷️</div>
            <p className="font-medium">Categories & Tags</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
