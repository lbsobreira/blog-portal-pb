import { User, Post, Comment, Project, Category, Tag } from '@prisma/client';

// Extended types with relations
export type PostWithRelations = Post & {
  author: User;
  category: Category | null;
  tags: (Tag & { posts: any[] })[];
  comments: Comment[];
  likes: { userId: string }[];
  _count?: {
    comments: number;
    likes: number;
  };
};

export type CommentWithUser = Comment & {
  user: User;
  replies?: CommentWithUser[];
};

export type ProjectWithDetails = Project;

// API Response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Form types
export type CreatePostInput = {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  categoryId?: string;
  tags?: string[];
};

export type CreateProjectInput = {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured?: boolean;
};

export type CreateCommentInput = {
  content: string;
  postId: string;
  parentId?: string;
};
