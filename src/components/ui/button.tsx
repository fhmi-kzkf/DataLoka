import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { ButtonVariant, ButtonSize } from "@/types/design-system";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "filled",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-9 px-4 text-[14px]",
      md: "h-11 px-5 text-[16px]",
      lg: "h-13 px-6 text-[17px]",
    };

    const variantClasses = {
      filled:
        "bg-[var(--color-ink-black)] text-[var(--color-paper-white)] border border-[var(--color-ink-black)] hover:opacity-90 active:scale-[0.99]",
      ghost:
        "bg-transparent text-[var(--color-ink-black)] border border-[var(--color-ink-black)] hover:bg-[var(--color-mist-gray)] active:scale-[0.99]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-normal rounded-[9999px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink-black)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap cursor-pointer",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span
              data-testid="loading-spinner"
              aria-hidden="true"
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            />
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
