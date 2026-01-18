import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectDetailClient from "./ProjectDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      imageUrl: true,
      technologies: true,
    },
  });

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    title: `${project.title} | Portfolio`,
    description: project.description.substring(0, 160),
    keywords: project.technologies,
    openGraph: {
      title: project.title,
      description: project.description.substring(0, 160),
      type: "website",
      url: `${baseUrl}/portfolio/${slug}`,
      images: project.imageUrl ? [{ url: project.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description.substring(0, 160),
      images: project.imageUrl ? [project.imageUrl] : undefined,
    },
  };
}

// Server component to check if project exists
export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient slug={slug} />;
}
