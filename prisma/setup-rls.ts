import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Enable Row Level Security (RLS) on all tables
 *
 * This script enables RLS on all tables to protect against direct database access
 * via Supabase's PostgREST API. Since this app uses Prisma (which connects with
 * the service_role), the application continues working normally while unauthorized
 * PostgREST access is blocked.
 *
 * Safe to run multiple times - enabling RLS on an already-enabled table is a no-op.
 */
async function main() {
  console.log("Enabling Row Level Security (RLS) on all tables...\n");

  const tables = [
    // Auth-related tables (sensitive - tokens, sessions)
    { name: "accounts", description: "OAuth accounts (contains access/refresh tokens)" },
    { name: "sessions", description: "User sessions" },
    { name: "verification_tokens", description: "Magic link tokens" },
    // User table
    { name: "users", description: "User accounts" },
    // Content tables
    { name: "posts", description: "Blog posts" },
    { name: "categories", description: "Post categories" },
    { name: "tags", description: "Post tags" },
    { name: "tags_on_posts", description: "Post-tag relationships" },
    { name: "comments", description: "Post comments" },
    { name: "likes", description: "Post likes" },
    // Portfolio tables
    { name: "projects", description: "Portfolio projects" },
    { name: "project_categories", description: "Project categories" },
    // Settings table
    { name: "site_settings", description: "Site configuration" },
  ];

  let enabled = 0;
  let skipped = 0;

  for (const table of tables) {
    try {
      // Check if table exists before trying to enable RLS
      const tableExists = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${table.name}'
        );
      `);

      if (!tableExists[0]?.exists) {
        console.log(`  ⏭️  ${table.name} - table doesn't exist yet, skipping`);
        skipped++;
        continue;
      }

      // Enable RLS (idempotent - safe to run multiple times)
      await prisma.$executeRawUnsafe(`
        ALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY;
      `);
      console.log(`  ✅ ${table.name} - ${table.description}`);
      enabled++;
    } catch (error) {
      // If the error is about RLS already being enabled, that's fine
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("already enabled")) {
        console.log(`  ✅ ${table.name} - already enabled`);
        enabled++;
      } else {
        console.error(`  ❌ ${table.name} - failed: ${errorMessage}`);
      }
    }
  }

  console.log(`\n✅ RLS enabled on ${enabled} tables`);
  if (skipped > 0) {
    console.log(`⏭️  ${skipped} tables skipped (don't exist yet - run db:push first)`);
  }

  console.log("\n📝 Note: No RLS policies are created because:");
  console.log("   • This app only accesses the database through Prisma (server-side)");
  console.log("   • Prisma uses the service_role which bypasses RLS");
  console.log("   • With RLS enabled but no policies, PostgREST access is blocked");
  console.log("   • This satisfies Supabase security requirements");
}

main()
  .catch((e) => {
    console.error("RLS setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
