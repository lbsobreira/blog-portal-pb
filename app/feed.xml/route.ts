import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Get all published posts and site settings
  const [posts, settings] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { siteName: true, siteTagline: true },
    }),
  ]);

  const siteName = settings?.siteName || "IT Blog";
  const siteTagline = settings?.siteTagline || "A personal space to showcase IT projects and share technical knowledge";

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteName.replace(/&/g, "&amp;")}</title>
    <link>${baseUrl}</link>
    <description>${siteTagline.replace(/&/g, "&amp;")}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || post.content.substring(0, 200) + "..."}]]></description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ""}</pubDate>
      ${post.author?.name ? `<author>${post.author.email} (${post.author.name})</author>` : ""}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
