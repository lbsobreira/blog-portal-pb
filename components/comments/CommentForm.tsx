"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  postId,
  parentId = null,
  onCommentAdded,
  onCancel,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    // Anonymous users must provide nickname
    if (!isAuthenticated && !nickname.trim()) {
      setError("Please enter your name or nickname");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId,
          // Include nickname and email for anonymous users
          ...(!isAuthenticated && {
            nickname: nickname.trim(),
            email: email.trim() || undefined,
          }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post comment");
      }

      // Clear form and notify parent
      setContent("");
      if (!isAuthenticated) {
        // Keep nickname for convenience, clear email
        setEmail("");
      }
      onCommentAdded();

      // Call onCancel if it exists (for reply forms)
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* User Avatar or Anonymous Icon */}
        {isAuthenticated && session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-10 h-10 rounded-full"
          />
        ) : isAuthenticated ? (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {(session.user.name || session.user.email || "U")[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Comment Input */}
        <div className="flex-1 space-y-3">
          {/* Name and Email fields for anonymous users */}
          {!isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Name / Nickname *"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional, not displayed)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-sm"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 resize-none"
            disabled={loading}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !content.trim() || (!isAuthenticated && !nickname.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {loading ? "Posting..." : parentId ? "Reply" : "Comment"}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
