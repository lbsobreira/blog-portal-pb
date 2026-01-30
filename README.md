# Blog Portal

A modern, full-featured blog and portfolio platform built with Next.js 16, featuring passwordless authentication, admin dashboard, and customizable branding.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green)

## Screenshots

### Homepage
![Homepage](screenshots/homepage.jpg)

### About Page
![About Page](screenshots/about-page.jpg)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.jpg)

### Post Editor
![Post Editor](screenshots/admin-new-post.jpg)

### Categories & Tags Management
![Categories & Tags](screenshots/admin-categories.jpg)

## Features

### Blog System
- Rich text editor (TipTap) with code syntax highlighting
- Categories and tags for organization
- Comments (authenticated + anonymous with moderation)
- Like system for posts
- Automatic reading time estimation
- SEO-friendly URLs

### Portfolio/Projects
- Showcase your projects with descriptions
- Link to GitHub repos and live demos
- Feature projects on homepage
- Technology tags

### Authentication
- Passwordless magic link authentication via email
- Role-based access control (User/Admin)
- Rate-limited sign-in attempts

### Admin Dashboard
- Post and project management (CRUD)
- Comment moderation
- Category and tag management
- Site settings and branding
- Analytics overview

### Customization
- Site name, logo (with position editor), tagline
- Profile section (bio, experience, skills, certifications, badges)
- Social links (GitHub, LinkedIn, Twitter, email)
- Dark/light mode toggle

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Auth.js v5](https://authjs.dev/) (NextAuth)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Email**: [Resend](https://resend.com/)
- **Editor**: [TipTap](https://tiptap.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- [Resend](https://resend.com/) account (free tier: 3,000 emails/month)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lbsobreira/blog-portal-pb.git
   cd blog-portal-pb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database** (see [Database Setup](#database-setup) below)

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/blog_portal"

   # Auth.js
   AUTH_URL="http://localhost:3000"
   AUTH_SECRET="generate-with-openssl-rand-base64-32"

   # Email (Resend)
   RESEND_API_KEY="re_xxxxx"
   EMAIL_FROM="onboarding@resend.dev"
   ```

5. **Set up database with security**
   ```bash
   # Push schema and enable Row Level Security (recommended)
   npm run db:setup

   # (Optional) Seed with sample data
   npm run db:seed
   ```

   > **Note:** `db:setup` automatically enables Row Level Security (RLS) on all tables,
   > which is required for Supabase deployments to pass security checks.

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## Database Setup

### Option 1: Local Development with Docker (Recommended)

The easiest way to run PostgreSQL locally:

1. **Start PostgreSQL container**
   ```bash
   docker-compose up -d
   ```

   This starts PostgreSQL on port 5432 with:
   - Database: `blog_portal`
   - User: `postgres`
   - Password: `postgres`

2. **Set your DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blog_portal"
   ```

3. **Manage the container**
   ```bash
   # Stop the database
   docker-compose down

   # View logs
   docker-compose logs -f

   # Reset database (deletes all data)
   docker-compose down -v && docker-compose up -d
   ```

### Option 2: Cloud Database (Production)

For production deployments, use a managed PostgreSQL service:

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| [Supabase](https://supabase.com) | 500MB, 2 projects | Full-featured, great dashboard |
| [Neon](https://neon.tech) | 512MB, branching | Serverless, auto-scaling |
| [Vercel Postgres](https://vercel.com/storage/postgres) | 256MB | Seamless Vercel integration |
| [Railway](https://railway.app) | $5 credit/month | Simple setup |

#### Supabase Setup Example

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string**
3. Copy the **Transaction Pooler** connection string (port 6543)
4. Add `?pgbouncer=true` to the end:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

> **Important for Serverless (Vercel):**
> - Use **Transaction Pooler** (port 6543), not Direct Connection
> - Add `?pgbouncer=true` to disable prepared statements
> - This prevents connection timeout errors

#### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?options
```

| Component | Description |
|-----------|-------------|
| `USER` | Database username |
| `PASSWORD` | Database password (URL-encoded if special chars) |
| `HOST` | Database server address |
| `PORT` | 5432 (direct) or 6543 (pooler) |
| `DATABASE` | Database name |
| `?pgbouncer=true` | Required for connection poolers |

### Database Commands

```bash
# Set up database with schema + RLS security (recommended)
npm run db:setup

# Push schema only (without RLS)
npm run db:push

# Enable RLS on existing database
npm run db:setup-rls

# Open visual database browser
npm run db:studio

# Create migration (production)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Seed with sample data
npm run db:seed

# Reset database (caution: deletes all data)
npx prisma migrate reset
```

### Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| Connection timeout | Using Direct Connection with serverless | Use Transaction Pooler (port 6543) |
| Prepared statement error | Missing pgbouncer parameter | Add `?pgbouncer=true` to DATABASE_URL |
| Authentication failed | Wrong password or user | Check credentials, URL-encode special characters |
| Database does not exist | Database not created | Create database or use `prisma db push` |

### Becoming an Admin

1. Sign in with your email (magic link)
2. Run this SQL command in your database:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```
3. Refresh the page - you'll see the Admin link in the header

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Add environment variables in Project Settings
4. Deploy!

Vercel will automatically:
- Run `prisma generate` on install
- Build and deploy on every push

### Other Platforms

Works with any platform that supports Node.js:
- Railway
- Render
- DigitalOcean App Platform
- Self-hosted with Docker

## Project Structure

```
blog-portal/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard (protected)
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── blog/               # Blog listing and posts
│   ├── portfolio/          # Projects showcase
│   └── about/              # About page
├── components/
│   ├── admin/              # Admin-specific components
│   ├── blog/               # Blog components
│   ├── comments/           # Comment system
│   ├── layout/             # Header, Footer
│   ├── providers/          # Context providers
│   └── ui/                 # Reusable UI components
├── lib/                    # Utilities
├── prisma/                 # Database schema & seed
└── public/                 # Static assets
```

## Security Features

- **Row Level Security (RLS)** - Enabled on all tables for Supabase deployments
- XSS prevention with DOMPurify
- SQL injection protection (Prisma ORM)
- Rate limiting on auth, comments, and likes
- CSRF protection via Auth.js
- Role-based API authorization

### Supabase Security

When using Supabase as your database, run `npm run db:setup` (instead of `db:push`) to automatically enable Row Level Security on all tables. This:

- Blocks unauthorized access via Supabase's PostgREST API
- Protects sensitive data (tokens, sessions, user info)
- Satisfies Supabase's security linter requirements
- Works seamlessly with Prisma (which uses service_role to bypass RLS)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with amazing open-source tools:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Auth.js](https://authjs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TipTap](https://tiptap.dev/)
- [Resend](https://resend.com/)
