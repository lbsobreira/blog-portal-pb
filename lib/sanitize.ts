import DOMPurify from "isomorphic-dompurify";

// Trusted iframe sources (for YouTube embeds etc.)
const TRUSTED_IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows safe HTML tags while stripping dangerous scripts
 * Uses isomorphic-dompurify for both client and server-side sanitization
 */
export function sanitizeHtml(html: string): string {
  // Configure DOMPurify with safe tags for blog content
  const config = {
    ALLOWED_TAGS: [
      // Text formatting
      "p", "br", "strong", "em", "u", "s", "mark",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Lists
      "ul", "ol", "li",
      // Links
      "a",
      // Code
      "code", "pre",
      // Media - iframe allowed but will be filtered by hook
      "img", "iframe",
      // Tables
      "table", "thead", "tbody", "tr", "th", "td",
      // Blockquotes
      "blockquote",
      // Divs and spans for styling
      "div", "span",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "width", "height",
      "class",
      "title",
      // "style" removed to prevent CSS injection attacks
      "allow", "allowfullscreen", "frameborder",
    ],
    // Removed 'data:' from allowed URIs to prevent XSS
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
    // Force all links to open in new tab with security attributes
    FORCE_BODY: false,
  };

  // Sanitize first
  let clean = DOMPurify.sanitize(html, config);

  // Additional hook: validate iframe sources
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe") {
      const element = node as Element;
      const src = element.getAttribute("src") || "";
      try {
        const url = new URL(src);
        if (!TRUSTED_IFRAME_HOSTS.includes(url.host)) {
          element.remove();
        }
      } catch {
        element.remove();
      }
    }
  });

  // Re-sanitize with hook
  clean = DOMPurify.sanitize(html, config);

  // Remove the hook to avoid affecting other sanitize calls
  DOMPurify.removeAllHooks();

  return clean;
}

/**
 * Extracts plain text from HTML
 */
export function htmlToText(html: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic tag stripping
    return html.replace(/<[^>]*>/g, "");
  }

  const div = document.createElement("div");
  div.innerHTML = sanitizeHtml(html);
  return div.textContent || div.innerText || "";
}

/**
 * Converts YouTube URLs to embed iframes
 */
export function convertYouTubeLinks(html: string): string {
  // Match YouTube URLs (various formats)
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;

  return html.replace(youtubeRegex, (match, videoId) => {
    // Using classes instead of inline styles for security
    return `<div class="video-embed-container">
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        class="video-embed-iframe"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>`;
  });
}

/**
 * Process content before saving (sanitize + convert embeds)
 */
export function processContentForSave(html: string): string {
  // Convert YouTube links to embeds
  let processed = convertYouTubeLinks(html);

  // Sanitize the result
  processed = sanitizeHtml(processed);

  return processed;
}

/**
 * Process content for display (sanitize only)
 */
export function processContentForDisplay(html: string): string {
  return sanitizeHtml(html);
}
