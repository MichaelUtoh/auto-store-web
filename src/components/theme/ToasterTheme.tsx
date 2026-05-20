"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";

export function ToasterTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "1rem",
          background: isDark ? "hsl(0 0% 98%)" : "hsl(0 0% 0%)",
          color: isDark ? "hsl(0 0% 7%)" : "hsl(0 0% 100%)",
          fontSize: "14px",
        },
      }}
    />
  );
}
