"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export default function LikeButton({
  postId,
  initialLiked = false,
  initialCount = 0,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current like status when component mounts
    fetchLikeStatus();
  }, [postId, session]);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/likes?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  };

  const handleLike = async () => {
    if (!session) {
      // Redirect to sign in if not authenticated
      router.push("/auth/signin?callbackUrl=" + window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } else {
        alert("Failed to like post");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to like post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          liked
            ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={session ? (liked ? "Unlike this post" : "Like this post") : "Sign in to like"}
      >
        <svg
          className={`w-5 h-5 ${liked ? "fill-current" : "stroke-current"}`}
          fill={liked ? "currentColor" : "none"}
          stroke={liked ? "none" : "currentColor"}
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">{likeCount}</span>
      </button>
      {!session && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          <a href="/auth/signin" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
            Sign in
          </a>
          {" "}to like
        </span>
      )}
    </div>
  );
}
