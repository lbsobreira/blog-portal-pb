import Link from "next/link"; // Homepage
import { prisma } from "@/lib/prisma";

// Disable caching so settings changes reflect immediately
export const dynamic = 'force-dynamic';

async function getFeaturedContent() {
  const [recentPosts, featuredProjects, settings] = await Promise.all([
    // Get 3 most recent published posts
    prisma.post.findMany({
      where: { published: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        readingTime: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    // Get featured projects
    prisma.project.findMany({
      where: { featured: true },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        technologies: true,
        githubUrl: true,
        liveUrl: true,
        imageUrl: true,
      },
    }),
    // Get site settings
    prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { siteName: true, siteTagline: true },
    }),
  ]);

  return {
    recentPosts,
    featuredProjects,
    siteName: settings?.siteName || "IT Blog",
    siteTagline: settings?.siteTagline || "A personal space to showcase IT projects and share technical knowledge",
  };
}

export default async function Home() {
  const { recentPosts, featuredProjects, siteName, siteTagline } = await getFeaturedContent();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-8 py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to {siteName}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {siteTagline}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/blog"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Blog
            </Link>
            <Link
              href="/portfolio"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section className="px-8 py-16 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recent Posts</h2>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all posts →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article
                key={post.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : ""}
                    </span>
                    {post.readingTime && (
                      <span>{post.readingTime} min read</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="px-8 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Projects</h2>
              <Link
                href="/portfolio"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all projects →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  {/* Clickable Image with Title Overlay */}
                  <Link href={`/portfolio/${project.slug}`} className="block relative">
                    {/* Image or Gradient Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                      {project.imageUrl && (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                      <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                  </Link>

                  {/* Project Content */}
                  <div className="p-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
                        >
                          GitHub →
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Live Demo →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12">What You'll Find Here</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <img src="/icons/technical-blog.svg" alt="Technical Blog" className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Technical Blog</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Insights, tutorials, and lessons learned from real-world IT projects
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <img src="/icons/my-projects.svg" alt="My Projects" className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">My Projects</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Completed projects with detailed descriptions and live demos
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <img src="/icons/community.svg" alt="Community" className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect through comments, likes, and discussions
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
