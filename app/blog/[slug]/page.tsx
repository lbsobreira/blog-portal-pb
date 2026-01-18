import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogPostClient from "./BlogPostClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const [post, settings] = await Promise.all([
    prisma.post.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        coverImage: true,
        author: {
          select: { name: true },
        },
      },
    }),
    prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { siteName: true },
    }),
  ]);

  const siteName = settings?.siteName || "IT Blog";

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    title: `${post.title} | ${siteName}`,
    description: post.excerpt || `Read ${post.title} on ${siteName}`,
    authors: post.author?.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} on ${siteName}`,
      type: "article",
      url: `${baseUrl}/blog/${slug}`,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || `Read ${post.title} on ${siteName}`,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

// Server component to check if post exists
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, published: true },
  });

  // Only show unpublished posts to admins (handled in client)
  if (!post) {
    notFound();
  }

  return <BlogPostClient slug={slug} />;
}
