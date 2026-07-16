import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getRuntimeDatabaseUrl(
  value = process.env.DATABASE_URL,
  migrationValue = process.env.DIRECT_URL,
) {
  if (!value) return undefined;

  try {
    let url = new URL(value);

    // Supabase free tier'da db.<ref>.supabase.co:6543 bir pooler adresi değildir.
    // DIRECT_URL session pooler ise aynı kimlik bilgileriyle doğru hostu ondan al.
    if (url.hostname.startsWith("db.") && url.port === "6543" && migrationValue) {
      const migrationUrl = new URL(migrationValue);
      if (migrationUrl.hostname.endsWith(".pooler.supabase.com")) {
        url = migrationUrl;
      }
    }

    if (url.hostname.endsWith(".pooler.supabase.com")) {
      // Vercel fonksiyonlarında kalıcı session bağlantıları havuzu tüketir.
      // Runtime trafiğini Supavisor transaction moduna yönlendir.
      if (url.port === "5432") url.port = "6543";
      if (url.port === "6543") {
        url.searchParams.set("pgbouncer", "true");
        url.searchParams.set("connection_limit", "1");
      }
    }
    return url.toString();
  } catch {
    return value;
  }
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  runtimeDatabaseUrl ? { datasourceUrl: runtimeDatabaseUrl } : undefined,
);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
