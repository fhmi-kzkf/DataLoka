import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/link";
import { Tag } from "@/components/ui/tag";
import { AvatarBubble } from "@/components/ui/avatar-bubble";
import { Input } from "@/components/ui/input";
import { ComposerInput } from "@/components/composite/composer-input";
import { StatCard } from "@/components/composite/stat-card";

describe("Modul 1: Design System Primitives", () => {
  describe("Button Component", () => {
    it("renders filled button with lozenge radius", () => {
      render(<Button variant="filled">Mulai Sekarang</Button>);
      const button = screen.getByRole("button", { name: /mulai sekarang/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain("rounded-[9999px]");
      expect(button.className).toContain("bg-[var(--color-ink-black)]");
    });

    it("renders ghost button variant", () => {
      render(<Button variant="ghost">Lihat Demo</Button>);
      const button = screen.getByRole("button", { name: /lihat demo/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain("bg-transparent");
      expect(button.className).toContain("border-[var(--color-ink-black)]");
    });

    it("renders loading state and prevents click", () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Proses
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Card Component", () => {
    it("renders neutral mist card with rectangular box geometry", () => {
      const { container } = render(<Card surface="mist">Konten Mist</Card>);
      expect(container.firstChild).toHaveClass("bg-[var(--color-mist-gray)]");
      expect(container.firstChild).toHaveClass("rounded-none");
    });

    it("renders accent peach card with rectangular box geometry", () => {
      const { container } = render(<Card surface="peach">Konten Peach</Card>);
      expect(container.firstChild).toHaveClass("bg-[var(--color-blush-peach)]");
      expect(container.firstChild).toHaveClass("text-[var(--color-sienna-brown)]");
      expect(container.firstChild).toHaveClass("rounded-none");
    });

    it("renders elevated floating artifact card with rectangular box geometry", () => {
      const { container } = render(<Card surface="elevated">Floating UI</Card>);
      expect(container.firstChild).toHaveClass("bg-[var(--color-paper-white)]");
      expect(container.firstChild).toHaveClass("rounded-none");
    });
  });

  describe("TextLink Component", () => {
    it("renders inline text link with arrow glyph", () => {
      render(
        <TextLink href="/features" withArrow>
          Pelajari lebih lanjut
        </TextLink>
      );
      const link = screen.getByRole("link", { name: /pelajari lebih lanjut/i });
      expect(link).toHaveAttribute("href", "/features");
      expect(link).toHaveTextContent("→");
    });

    it("renders nav link variant", () => {
      render(
        <TextLink href="/pricing" variant="nav">
          Harga
        </TextLink>
      );
      const link = screen.getByRole("link", { name: /harga/i });
      expect(link).toHaveAttribute("href", "/pricing");
      expect(link.className).toContain("py-[2px]");
    });
  });

  describe("Tag Component", () => {
    it("renders category label with ghost typography", () => {
      render(<Tag label="Marketing" />);
      const tag = screen.getByText("Marketing");
      expect(tag).toBeInTheDocument();
      expect(tag.className).toContain("text-[var(--color-ash-gray)]");
      expect(tag.className).toContain("uppercase");
    });
  });

  describe("AvatarBubble Component", () => {
    it("renders initials and presence pointer", () => {
      const { container } = render(<AvatarBubble initials="BR" variant="green" name="Bu Rina" />);
      expect(screen.getByText("BR")).toBeInTheDocument();
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Input & ComposerInput Components", () => {
    it("renders input field with error state", () => {
      render(<Input placeholder="Masukkan email" error="Email tidak valid" />);
      const input = screen.getByPlaceholderText("Masukkan email");
      expect(input).toBeInTheDocument();
      expect(screen.getByText("Email tidak valid")).toBeInTheDocument();
    });

    it("composer input triggers onSend callback when text is entered and submitted", () => {
      const handleSend = vi.fn();
      render(<ComposerInput placeholder="Tanya..." onSend={handleSend} />);
      const input = screen.getByPlaceholderText("Tanya...");
      const sendButton = screen.getByRole("button", { name: /kirim pertanyaan/i });

      fireEvent.change(input, { target: { value: "Tampilkan grafik penjualan" } });
      fireEvent.click(sendButton);

      expect(handleSend).toHaveBeenCalledWith("Tampilkan grafik penjualan");
    });

    it("composer input does not trigger submit when empty", () => {
      const handleSend = vi.fn();
      render(<ComposerInput placeholder="Tanya..." onSend={handleSend} />);
      const sendButton = screen.getByRole("button", { name: /kirim pertanyaan/i });
      expect(sendButton).toBeDisabled();
      fireEvent.click(sendButton);
      expect(handleSend).not.toHaveBeenCalled();
    });
  });

  describe("StatCard Component", () => {
    it("renders metric label, formatted value, delta indicator, and sparkline", () => {
      const { container } = render(
        <StatCard
          label="Total Penjualan"
          value="Rp 120.000.000"
          delta={{ text: "15% vs pekan lalu", isPositive: true }}
          sparklineData={[10, 20, 15, 30]}
        />
      );

      expect(screen.getByText("Total Penjualan")).toBeInTheDocument();
      expect(screen.getByText("Rp 120.000.000")).toBeInTheDocument();
      expect(screen.getByText(/15% vs pekan lalu/i)).toBeInTheDocument();
      const polyline = container.querySelector("polyline");
      expect(polyline).toBeInTheDocument();
    });
  });
});
