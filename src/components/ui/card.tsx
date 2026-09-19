import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { CardSurface, CardPadding } from "@/types/design-system";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: CardSurface;
  padding?: CardPadding;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      surface = "mist",
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const surfaceClasses = {
      mist: "bg-[var(--color-mist-gray)] text-[var(--color-ink-black)] rounded-none border border-slate-gray/15",
      peach: "bg-[var(--color-blush-peach)] text-[var(--color-sienna-brown)] rounded-none border border-[#f7cdb2]",
      elevated:
        "bg-[var(--color-paper-white)] text-[var(--color-ink-black)] rounded-none border border-slate-gray/20 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]",
      canvas: "bg-[var(--color-paper-white)] text-[var(--color-ink-black)] rounded-none border border-slate-gray/15",
    };

    const paddingClasses = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      editorial: "p-10",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-200",
          surfaceClasses[surface],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
