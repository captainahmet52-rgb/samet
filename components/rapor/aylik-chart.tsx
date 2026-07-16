"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { paraFormat } from "@/lib/utils";

export type ChartRow = { ay: string; gider: number; cikis: number };

export function AylikChart({ data }: { data: ChartRow[] }) {
  if (!data.length) return <div className="grid h-72 place-items-center text-sm text-slate-500">Seçili aralıkta hareket bulunamadı.</div>;
  return <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="ay" fontSize={12}/><YAxis fontSize={12} tickFormatter={value => `${Math.round(Number(value) / 1000)} bin`}/><Tooltip formatter={value => paraFormat.format(Number(value))}/><Legend/><Bar dataKey="gider" name="Gider" fill="#dc2626" radius={[4, 4, 0, 0]}/><Bar dataKey="cikis" name="Çıkış" fill="#059669" radius={[4, 4, 0, 0]}/></BarChart></ResponsiveContainer></div>;
}
