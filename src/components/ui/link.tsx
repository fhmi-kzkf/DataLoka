import React, { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TextLinkVariant } from "@/types/design-system";

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: TextLinkVariant;
  withArrow?: boolean;
}

export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  (
    {
      className,
      href,
      variant = "inline",
      withArrow = false,
      children,
      ...props
    },
    ref
  ) => {
    const isNav = variant === "nav";

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "text-[var(--color-ink-black)] transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ink-black)]",
          isNav
            ? "text-[16px] py-[2px] hover:text-[var(--color-slate-gray)]"
            : "text-[16px] py-2 hover:underline underline-offset-4",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {withArrow && <span aria-hidden="true">→</span>}
      </Link>
    );
  }
);

TextLink.displayName = "TextLink";
