"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { useState } from "react";

export function DataTable<TData, TValue>({ columns, data, emptyText = "Kayıt bulunamadı." }: { columns: ColumnDef<TData, TValue>[]; data: TData[]; emptyText?: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">{table.getHeaderGroups().map(group => <tr key={group.id}>{group.headers.map(header => <th className="whitespace-nowrap px-4 py-3 font-semibold" key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
          <tbody>{table.getRowModel().rows.length ? table.getRowModel().rows.map(row => <tr className="border-t hover:bg-slate-50/70" key={row.id}>{row.getVisibleCells().map(cell => <td className="whitespace-nowrap px-4 py-3" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td className="px-4 py-12 text-center text-slate-500" colSpan={columns.length}>{emptyText}</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
