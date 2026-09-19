import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeClasses =
    size === "sm" ? "w-6 h-6 p-1" : size === "lg" ? "w-8 h-8 p-1.5" : "w-7 h-7 p-1";

  return (
    <div
      className={`rounded-lg bg-ink-black flex items-center justify-center shadow-xs shrink-0 ${sizeClasses} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full text-paper-white"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" fillOpacity="0.25" />
        <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" fillOpacity="0.55" />
        <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
        <path d="M4 8l6-3 7 4" stroke="#fbe1d1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
