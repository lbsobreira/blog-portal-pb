"use client";

import { processContentForDisplay } from "@/lib/sanitize";

interface ContentRendererProps {
  content: string;
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  // Sanitize content before rendering
  const sanitizedContent = processContentForDisplay(content);

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
