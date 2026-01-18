"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  _count?: {
    comments: number;
  };
}

interface ParentComment {
  id: string;
  content: string;
  user: {
    name: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  post: Post;
  parent: ParentComment | null;
  _count: {
    replies: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedPost, setSelectedPost] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Reply state
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchComments();
  }, [selectedPost, currentPage]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPost) params.set("postId", selectedPost);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", currentPage.toString());

      const response = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch comments");

      const data = await response.json();
      setComments(data.comments);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment? This will also delete all replies.")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchComments();
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      alert("Failed to delete comment");
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent("");
        fetchComments();
      } else {
        alert("Failed to update comment");
      }
    } catch (error) {
      alert("Failed to update comment");
    }
  };

  const handleReply = async () => {
    if (!replyingTo || !replyContent.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: replyingTo.post.id,
          content: replyContent.trim(),
          parentId: replyingTo.id,
        }),
      });

      if (response.ok) {
        setReplyingTo(null);
        setReplyContent("");
        fetchComments();
      } else {
        alert("Failed to post reply");
      }
    } catch (error) {
      alert("Failed to post reply");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setReplyingTo(null);
  };

  const startReply = (comment: Comment) => {
    setReplyingTo(comment);
    setReplyContent("");
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage all comments across your posts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Post Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Filter by Post</label>
            <select
              value={selectedPost}
              onChange={(e) => {
                setSelectedPost(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="">All Posts</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title} ({post._count?.comments || 0} comments)
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search comments or users..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        {pagination && (
          <span>
            Showing {comments.length} of {pagination.totalCount} comments
            {selectedPost && " (filtered)"}
          </span>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {selectedPost || searchQuery ? "No comments match your filters" : "No comments yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {comment.user.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                      {(comment.user.name || comment.user.email || "A")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{comment.user.name || "Anonymous"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <p>{new Date(comment.createdAt).toLocaleDateString()}</p>
                  <p>{new Date(comment.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Post Link */}
              <div className="mb-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">On: </span>
                <Link
                  href={`/blog/${comment.post.slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {comment.post.title}
                </Link>
              </div>

              {/* Reply To indicator */}
              {comment.parent && (
                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Reply to </span>
                  <span className="font-medium">{comment.parent.user.name || "Anonymous"}</span>
                  <span className="text-gray-500 dark:text-gray-400">: </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {comment.parent.content.substring(0, 100)}
                    {comment.parent.content.length > 100 && "..."}
                  </span>
                </div>
              )}

              {/* Comment Content */}
              {editingId === comment.id ? (
                <div className="mb-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                  {comment.content}
                </p>
              )}

              {/* Reply Form */}
              {replyingTo?.id === comment.id && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Reply to this comment:</p>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    placeholder="Write your reply..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleReply}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={cancelReply}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-4">
                  <button
                    onClick={() => startReply(comment)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => startEdit(comment)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
                {comment._count.replies > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {comment._count.replies} {comment._count.replies === 1 ? "reply" : "replies"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
