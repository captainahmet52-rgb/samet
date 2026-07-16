import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-600",
  {
    variants: {
      variant: {
        default: "bg-emerald-700 text-white hover:bg-emerald-800",
        outline: "border bg-white hover:bg-slate-50",
        ghost: "hover:bg-slate-100",
        destructive: "bg-red-700 text-white hover:bg-red-800",
      },
      size: { default: "h-10 px-4", sm: "h-9 px-3", icon: "size-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
