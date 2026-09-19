import React from "react";
import { cn } from "@/lib/utils";
import type { AvatarBubbleVariant } from "@/types/design-system";

export interface AvatarBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
  variant?: AvatarBubbleVariant;
  withPointer?: boolean;
  name?: string;
}

export function AvatarBubble({
  initials,
  variant = "green",
  withPointer = true,
  name,
  className,
  ...props
}: AvatarBubbleProps) {
  const variantStyles = {
    green: "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]",
    blue: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
    peach: "bg-[var(--color-blush-peach)] text-[var(--color-sienna-brown)] border-[#f7cdb2]",
  };

  return (
    <div
      className={cn("relative inline-flex items-center select-none", className)}
      title={name || initials}
      {...props}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-[9999px] flex items-center justify-center font-medium text-[14px] border border-solid shadow-xs",
          variantStyles[variant]
        )}
      >
        {initials.slice(0, 2).toUpperCase()}
      </div>
      {withPointer && (
        <svg
          aria-hidden="true"
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 drop-shadow-xs pointer-events-none fill-current text-[var(--color-ink-black)]"
          viewBox="0 0 24 24"
        >
          <path d="M4 0l16 12-7.5 1.5L8 21z" />
        </svg>
      )}
    </div>
  );
}
