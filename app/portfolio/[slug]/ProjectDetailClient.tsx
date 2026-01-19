"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  technologies: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  featured: boolean;
  createdAt: string;
  categoryId: string | null;
  category: Category | null;
}

interface RelatedProject {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  category: Category | null;
}

interface ProjectDetailClientProps {
  slug: string;
}

export default function ProjectDetailClient({ slug }: ProjectDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<RelatedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (slug) {
      setImageError(false);
      fetchProject();
    }
  }, [slug]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLightbox) {
        setShowLightbox(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox]);

  useEffect(() => {
    if (project) {
      fetchRelatedProjects();
    }
  }, [project?.id, project?.categoryId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${slug}`);

      if (response.status === 404) {
        setError("Project not found");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch project");

      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProjects = async () => {
    if (!project) return;

    try {
      const params = new URLSearchParams();
      params.append("limit", "4"); // Fetch 4 to have 3 after excluding current
      if (project.categoryId) {
        params.append("categoryId", project.categoryId);
      }

      const response = await fetch(`/api/projects?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current project and take first 3
        const filtered = data.projects
          .filter((p: RelatedProject) => p.id !== project.id)
          .slice(0, 3);
        setRelatedProjects(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch related projects:", err);
    }
  };

  const handleDelete = async () => {
    if (!project || !confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/portfolio");
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      alert("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {error === "Project not found" ? "404" : "Error"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Project not found"}
          </p>
          <Link
            href="/portfolio"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Back Link */}
            <Link
              href="/portfolio"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Projects
            </Link>

            {/* Project Image */}
            <div className="mb-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
              {project.imageUrl && !imageError ? (
                <button
                  onClick={() => setShowLightbox(true)}
                  className="w-full relative group cursor-zoom-in"
                >
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-80 md:h-96 object-cover object-top"
                    onError={() => setImageError(true)}
                  />
                  {/* Expand hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Click to expand
                    </span>
                  </div>
                </button>
              ) : (
                <div className="w-full h-80 md:h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-white opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Featured Badge & Category */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.featured && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-semibold">
                  Featured Project
                </span>
              )}
              {project.category && (
                <Link
                  href={`/portfolio?category=${project.categoryId}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  {project.category.name}
                </Link>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>

            {/* Technologies */}
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View on GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Live Demo
                </a>
              )}
            </div>

            {/* Admin Actions */}
            {session?.user?.role === "ADMIN" && (
              <div className="flex gap-4 mb-8">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Project
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Project
                </button>
              </div>
            )}

            {/* Meta Info */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                Created on{" "}
                {new Date(project.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </article>

          {/* Sidebar - Related Projects */}
          {relatedProjects.length > 0 && (
            <aside className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  {project.category ? `More in ${project.category.name}` : "More Projects"}
                </h2>
                <div className="space-y-4">
                  {relatedProjects.map((relatedProject) => (
                    <Link
                      key={relatedProject.id}
                      href={`/portfolio/${relatedProject.slug}`}
                      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden group"
                    >
                      {/* Image */}
                      <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600">
                        {relatedProject.imageUrl && (
                          <img
                            src={relatedProject.imageUrl}
                            alt={relatedProject.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                      {/* Title */}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {relatedProject.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* View All Link */}
                <Link
                  href={project.category ? `/portfolio?category=${project.categoryId}` : "/portfolio"}
                  className="block mt-4 text-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View all {project.category?.name || "projects"} →
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && project.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full size image */}
          <img
            src={project.imageUrl}
            alt={project.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Click outside hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Click outside or press X to close
          </p>
        </div>
      )}
    </div>
  );
}
