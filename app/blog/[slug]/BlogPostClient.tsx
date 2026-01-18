"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ContentRenderer from "@/components/blog/ContentRenderer";
import LikeButton from "@/components/blog/LikeButton";
import CommentSection from "@/components/comments/CommentSection";

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
  content: string;
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

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${slug}`);

      if (response.status === 404) {
        setError("Post not found");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch post");

      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {error === "Post not found" ? "404" : "Error"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Post not found"}
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-800">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Row */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>

          {/* Category Badge */}
          {post.category && (
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {post.category.name}
            </Link>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          {/* Author */}
          <div className="flex items-center gap-3">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || "Author"}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                {(post.author?.name || post.author?.email || "A")[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {post.author?.name || "Anonymous"}
              </p>
              <p className="text-sm">
                {new Date(
                  post.publishedAt || post.createdAt
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span>{post.readingTime || 5} min read</span>
            <span>•</span>
            <span>{post.views} views</span>
            <span>•</span>
            <span>{post._count.comments} comments</span>
            <span>•</span>
            <span>{post._count.likes} likes</span>
          </div>

          {/* Draft Badge (Admin Only) */}
          {!post.published && session?.user?.role === "ADMIN" && (
            <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-semibold">
              Draft
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="mb-12">
          <ContentRenderer content={post.content} />
        </div>

        {/* Like Button */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <LikeButton postId={post.id} initialCount={post._count.likes} />
        </div>

        {/* Admin Actions */}
        {session?.user?.role === "ADMIN" && (
          <div className="flex gap-4 mb-12 pb-12 border-b border-gray-200 dark:border-gray-700">
            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Post
            </Link>
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to delete this post?")) {
                  try {
                    const response = await fetch(`/api/posts/${post.slug}`, {
                      method: "DELETE",
                    });
                    if (response.ok) {
                      router.push("/blog");
                    } else {
                      alert("Failed to delete post");
                    }
                  } catch (error) {
                    alert("Failed to delete post");
                  }
                }
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Post
            </button>
          </div>
        )}

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </article>
    </div>
  );
}
