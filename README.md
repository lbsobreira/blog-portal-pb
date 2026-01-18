# Blog Portal

A modern, full-featured blog and portfolio platform built with Next.js 16, featuring passwordless authentication, admin dashboard, and customizable branding.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green)

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
- PostgreSQL database
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

3. **Configure environment variables**
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

4. **Set up the database**
   ```bash
   # Push schema to database
   npx prisma db push

   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

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

## Database Commands

```bash
# View/edit data in browser
npm run db:studio

# Push schema changes (development)
npm run db:push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Seed database
npm run db:seed
```

## Security Features

- XSS prevention with DOMPurify
- SQL injection protection (Prisma ORM)
- Rate limiting on auth, comments, and likes
- CSRF protection via Auth.js
- Role-based API authorization

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
