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
  categoryId: string | null;
  tags: Array<{ tag: Tag }>;
  _count: {
    comments: number;
    likes: number;
  };
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  category: Category | null;
}

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (slug) {
      setImageError(false);
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      fetchRelatedPosts();
    }
  }, [post?.id, post?.category?.slug]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLightbox) {
        setShowLightbox(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox]);

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

  const fetchRelatedPosts = async () => {
    if (!post) return;

    try {
      const params = new URLSearchParams();
      params.append("limit", "4"); // Fetch 4 to have 3 after excluding current
      if (post.category?.slug) {
        params.append("category", post.category.slug);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current post and take first 3
        const filtered = data.posts
          .filter((p: RelatedPost) => p.id !== post.id)
          .slice(0, 3);
        setRelatedPosts(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch related posts:", err);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Back Link */}
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
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

            {/* Cover Image */}
            <div className="mb-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
              {post.coverImage && !imageError ? (
                <button
                  onClick={() => setShowLightbox(true)}
                  className="w-full relative group cursor-zoom-in"
                >
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-80 md:h-96 object-cover object-top"
                    onError={() => setImageError(true)}
                  />
                  {/* Expand hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Click to expand
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-full h-80 md:h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-white opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Category Badge & Draft Badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.category && (
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {post.category.name}
                </Link>
              )}
              {!post.published && session?.user?.role === "ADMIN" && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-semibold">
                  Draft
                </span>
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

          {/* Sidebar - Related Posts */}
          {relatedPosts.length > 0 && (
            <aside className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  {post.category ? `More in ${post.category.name}` : "More Posts"}
                </h2>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden group"
                    >
                      {/* Image */}
                      <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600">
                        {relatedPost.coverImage && (
                          <img
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                      {/* Title */}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* View All Link */}
                <Link
                  href={post.category ? `/blog?category=${post.category.slug}` : "/blog"}
                  className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View all {post.category?.name || "posts"} →
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && post.coverImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full size image */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Click outside hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Click outside or press X to close
          </p>
        </div>
      )}
    </div>
  );
}
