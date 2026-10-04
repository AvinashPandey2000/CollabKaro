"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { MotionConfig } from "motion/react";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster richColors position="bottom-right" />
      </MotionConfig>
    </ThemeProvider>
  );
}
