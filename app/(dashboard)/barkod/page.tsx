import { BarkodClient } from "@/components/barkod/barkod-client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BarkodPage() {
  const configured = isDatabaseConfigured();
  const urunler = configured ? await prisma.urun.findMany({ orderBy: { ad: "asc" }, select: { id: true, ad: true } }) : [];
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div><p className="text-sm text-slate-500">Depo İşlemleri</p><h1 className="text-2xl font-bold">Barkod</h1></div>
      {!configured && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Barkod işlemleri için veritabanı bağlantısını yapılandırın.</p>}
      <BarkodClient urunler={urunler} />
    </div>
  );
}
