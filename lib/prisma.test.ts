import { describe, expect, it } from "vitest";
import { getRuntimeDatabaseUrl } from "./prisma";

describe("getRuntimeDatabaseUrl", () => {
  it("Supabase session pooler adresini serverless transaction moduna çevirir", () => {
    const result = getRuntimeDatabaseUrl("postgresql://postgres.ref:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres");
    expect(result).toContain(":6543/postgres");
    expect(result).toContain("pgbouncer=true");
    expect(result).toContain("connection_limit=1");
  });

  it("diğer veritabanı adreslerini değiştirmez", () => {
    const input = "postgresql://user:secret@localhost:5432/app";
    expect(getRuntimeDatabaseUrl(input)).toBe(input);
  });

  it("geçersiz direct-host 6543 adresini DIRECT_URL pooler hostuyla düzeltir", () => {
    const runtime = "postgresql://postgres:secret@db.ref.supabase.co:6543/postgres";
    const migration = "postgresql://postgres.ref:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
    const result = getRuntimeDatabaseUrl(runtime, migration);
    expect(result).toContain("aws-0-us-east-1.pooler.supabase.com:6543/postgres");
    expect(result).toContain("pgbouncer=true");
    expect(result).toContain("connection_limit=1");
  });
});
