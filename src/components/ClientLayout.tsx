"use client";

import { useState } from "react";
import HeroBackground from "@/components/HeroBackground";
import ThemeControls from "@/components/ThemeControls";
import { Toaster } from "sonner";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [themeSettings, setThemeSettings] = useState({
    variant: "legal-luxe",
    overlayOpacity: 0.42,
    bloomStrength: 0.15,
    motionEnabled: true
  });

  return (
    <>
      {/* Global cinematic background - rendered once for entire app */}
      <HeroBackground
        variant={themeSettings.variant}
        overlayOpacity={themeSettings.overlayOpacity}
        bloomStrength={themeSettings.bloomStrength}
      />

      {/* Theme controls for adjusting background */}
      <ThemeControls onSettingsChange={setThemeSettings} />

      {/* Main app content */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Toast notifications */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "glass-card",
          duration: 4000,
        }}
      />
    </>
  );
}
