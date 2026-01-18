"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: User | null;
  nickname: string | null;
  displayName: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User | null;
  userId: string | null;
  nickname: string | null;
  email: string | null; // Only visible to admin
  displayName: string;
  replies: Reply[];
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  postId,
  onCommentAdded,
  onCommentDeleted,
  isReply = false,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const isOwner = session?.user?.id && comment.userId === session.user.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const displayName = comment.displayName || comment.user?.name || comment.nickname || "Anonymous";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onCommentDeleted();
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      alert("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        setIsEditing(false);
        onCommentAdded(); // Refresh comments
      } else {
        alert("Failed to update comment");
      }
    } catch (error) {
      alert("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-3">
          {comment.user?.image ? (
            <img
              src={comment.user.image}
              alt={displayName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
              {displayName[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
              {/* Show if user is admin */}
              {comment.user && comment.userId && isAdmin && comment.userId !== session?.user?.id && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                  User
                </span>
              )}
              {/* Show anonymous badge for admin view */}
              {!comment.userId && isAdmin && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  Guest
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
              {/* Show email to admin only */}
              {isAdmin && comment.email && (
                <span className="ml-2 text-gray-400">({comment.email})</span>
              )}
            </p>
          </div>

          {/* Actions for owner/admin */}
          {(isOwner || isAdmin) && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Reply Button - anyone can reply */}
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {showReplyForm ? "Cancel Reply" : "Reply"}
              </button>
            )}
          </>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && !isReply && (
        <div className="mt-4 ml-12">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onCommentAdded={() => {
              setShowReplyForm(false);
              onCommentAdded();
            }}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply as unknown as Comment}
              postId={postId}
              onCommentAdded={onCommentAdded}
              onCommentDeleted={onCommentDeleted}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
