"use client";

import { useEffect } from "react";
import { useCommandStore } from "@/stores/command-store";

export function useCommandBarShortcut() {
  const { toggleCommandBar, closeCommandBar, isOpen } = useCommandStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandBar();
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeCommandBar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandBar, closeCommandBar, isOpen]);
}
