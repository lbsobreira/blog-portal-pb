# Blog Portal - Project Guide

A modern, full-featured blog and portfolio platform built with Next.js 16, featuring authentication, admin dashboard, and customizable branding.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js) with magic link email
- **Styling**: Tailwind CSS v4 with dark/light mode toggle
- **Email**: Resend for transactional emails
- **Deployment**: Vercel (recommended)

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
│   ├── blog/               # Blog components (ContentRenderer, etc.)
│   ├── comments/           # Comment system components
│   ├── layout/             # Header, Footer
│   ├── providers/          # Context providers (Session, Theme)
│   └── ui/                 # Reusable UI components
├── lib/                    # Utilities (prisma, sanitize, rate-limit)
├── prisma/                 # Database schema
└── public/                 # Static assets (icons, logo)
```

## Key Features

### Authentication
- Magic link (passwordless) authentication via email
- Role-based access control (USER, ADMIN)
- Rate-limited sign-in attempts (5 per minute per IP)

### Blog System
- Rich text editor (TipTap) with code highlighting
- Categories and tags
- Comments (authenticated + anonymous with moderation)
- Like system
- Reading time estimation
- SEO-friendly slugs

### Portfolio/Projects
- Project showcase with technologies
- GitHub and live demo links
- Featured projects on homepage

### Admin Dashboard
- Post/project management (CRUD)
- Comment moderation
- Site settings (branding, profile, social links)
- Category and tag management
- Analytics overview

### Customization
- Site name, logo (with position editor), tagline
- Profile section (image, bio, experience, skills, certifications, badges)
- Social links (GitHub, LinkedIn, Twitter, email)
- Dark/light mode toggle (defaults to dark)

## Environment Variables

Create a `.env` file with:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Auth.js
AUTH_URL="http://localhost:3000"
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# Email (Resend)
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="noreply@yourdomain.com"

# Optional: Force email auth in development
FORCE_RESEND="true"
NEXT_PUBLIC_FORCE_RESEND="true"
```

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Run development server
npm run dev
```

## Database Management

```bash
# View/edit data in browser
npx prisma studio

# Push schema changes (dev - may lose data)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy
```

## Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Vercel auto-deploys on push to main
4. `postinstall` script runs `prisma generate` automatically

## Security Features

- XSS prevention with DOMPurify (whitelist-based sanitization)
- SQL injection prevented (Prisma ORM, no raw queries)
- Rate limiting on auth (5/min), comments (10/min), likes (30/min)
- CSRF protection via NextAuth
- Role-based API authorization

## Common Tasks

### Adding a new admin
1. User signs in via magic link
2. Run in database: `UPDATE users SET role = 'ADMIN' WHERE email = 'user@email.com';`

### Customizing the site
1. Sign in as admin
2. Go to Admin > Settings
3. Update site name, logo, profile, social links, etc.

### Adding blog posts
1. Admin > Posts > New Post
2. Write content with rich text editor
3. Add category, tags, cover image
4. Publish when ready

## File Conventions

- API routes: `app/api/[resource]/route.ts`
- Pages: `app/[route]/page.tsx`
- Components: PascalCase (`ContentRenderer.tsx`)
- Utilities: camelCase (`rate-limit.ts`)

## Styling Notes

- Dark mode: `darkMode: "class"` in Tailwind config
- Theme toggle stores preference in localStorage
- Use `dark:` prefix for dark mode variants
- Logo auto-inverts in dark mode (`dark:brightness-0 dark:invert`)
