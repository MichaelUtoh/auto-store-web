"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const options: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

interface ThemeToggleProps {
  className?: string;
  /** Compact icon-only cycle button */
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          compact ? "h-11 w-11" : "h-11 w-[7.5rem]",
          "rounded-full bg-muted",
          className
        )}
        aria-hidden
      />
    );
  }

  if (compact) {
    const next: ThemeOption =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    const Icon =
      resolvedTheme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setTheme(next)}
        aria-label={`Theme: ${theme}. Click to switch.`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-pill bg-muted p-1",
        className
      )}
      role="group"
      aria-label="Color theme"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-pill px-3 py-2 text-xs font-semibold transition-colors",
            theme === value
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-secondary hover:text-foreground"
          )}
          aria-pressed={theme === value}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
