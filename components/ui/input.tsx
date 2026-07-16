import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600", className)}
      {...props}
    />
  );
}
