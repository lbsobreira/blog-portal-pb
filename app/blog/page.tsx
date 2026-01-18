"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Author {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  views: number;
  readingTime: number | null;
  createdAt: string;
  publishedAt: string | null;
  author: Author;
  category: Category | null;
  tags: Array<{ tag: Tag }>;
  _count: {
    comments: number;
    likes: number;
  };
}

interface GroupedPosts {
  [categoryName: string]: Post[];
}

function BlogContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeTag = searchParams.get("tag");
  const activeCategory = searchParams.get("category");

  useEffect(() => {
    fetchPosts();
  }, [activeTag, activeCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTag) params.append("tag", activeTag);
      if (activeCategory) params.append("category", activeCategory);

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Group posts by category
  const groupPostsByCategory = (posts: Post[]): GroupedPosts => {
    const grouped: GroupedPosts = {};

    posts.forEach((post) => {
      const categoryName = post.category?.name || "Uncategorized";
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(post);
    });

    return grouped;
  };

  const groupedPosts = groupPostsByCategory(posts);

  // Sort categories: named categories first (alphabetically), then Uncategorized
  const sortedCategories = Object.keys(groupedPosts).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  // Get all unique tags from posts
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags.map((t) => t.tag)))
  ).sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            IT insights, tutorials, and experiences
          </p>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && !activeCategory && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Filter by Tag
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeTag && (
                <button
                  onClick={() => router.push("/blog")}
                  className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Clear filter
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() =>
                    router.push(
                      activeTag === tag.slug ? "/blog" : `/blog?tag=${tag.slug}`
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeTag === tag.slug
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filter Indicator */}
        {(activeTag || activeCategory) && (
          <div className="mb-6 flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Showing:</span>
            {activeCategory && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full">
                {activeCategory}
              </span>
            )}
            {activeTag && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full">
                #{activeTag}
              </span>
            )}
            <button
              onClick={() => router.push("/blog")}
              className="text-red-600 dark:text-red-400 hover:underline ml-2"
            >
              Clear
            </button>
          </div>
        )}

        {/* Posts by Category */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No posts found
            </p>
            {(activeTag || activeCategory) && (
              <button
                onClick={() => router.push("/blog")}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all posts
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {sortedCategories.map((categoryName) => (
              <section key={categoryName}>
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categoryName}
                  </h2>
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedPosts[categoryName].map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      isAdmin={session?.user?.role === "ADMIN"}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, isAdmin }: { post: Post; isAdmin: boolean }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Clickable Image with Title Overlay */}
      <Link href={`/blog/${post.slug}`} className="block relative">
        {/* Image or Gradient Placeholder */}
        <div className="aspect-video w-full bg-gradient-to-br from-blue-500 to-purple-600">
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
            {post.title}
          </h3>
          {/* Draft Badge */}
          {!post.published && isAdmin && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-500 text-yellow-900 rounded text-xs font-medium">
              Draft
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                #{tag.name}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span>{post.readingTime || 5} min</span>
            <span>{post._count.likes} likes</span>
          </div>
          <time>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            )}
          </time>
        </div>
      </div>
    </article>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BlogContent />
    </Suspense>
  );
}
