import React from "react";
import { cn } from "@/lib/utils";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
}

export function Tag({ label, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "text-[14px] font-normal text-[var(--color-ash-gray)] tracking-normal uppercase select-none inline-block",
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}
