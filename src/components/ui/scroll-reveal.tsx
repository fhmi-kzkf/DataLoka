"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "down" | "none";
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  delayMs = 0,
  direction = "up",
}) => {
  // Always default to true on initial render so content is immediately visible and accessible
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: "100px 0px 100px 0px",
      }
    );

    const el = elementRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, []);

  const getTransformClasses = () => {
    if (isVisible) return "opacity-100 translate-y-0";
    if (direction === "up") return "opacity-100 translate-y-2";
    if (direction === "down") return "opacity-100 -translate-y-2";
    return "opacity-100";
  };

  return (
    <div
      ref={elementRef}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-all duration-500 ease-out will-change-transform",
        getTransformClasses(),
        className
      )}
    >
      {children}
    </div>
  );
};
