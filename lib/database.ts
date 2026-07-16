export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  return Boolean(url?.startsWith("postgresql://") && !url.includes("PROJECT") && !url.includes("PASSWORD"));
}
