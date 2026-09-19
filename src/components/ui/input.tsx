import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-slate-gray)] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full bg-[var(--color-paper-white)] text-[var(--color-ink-black)] placeholder-[var(--color-smoke-gray)] text-[15px] rounded-none border border-slate-gray/20 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-ink-black)] focus:ring-1 focus:ring-[var(--color-ink-black)] disabled:bg-[var(--color-mist-gray)] disabled:cursor-not-allowed",
            leftIcon && "pl-11",
            rightIcon && "pr-11",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
