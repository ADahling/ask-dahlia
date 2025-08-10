"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Sliders, Eye, EyeOff } from "lucide-react";
import { copy } from "@/lib/copy";

interface ThemeSettings {
  variant: string;
  overlayOpacity: number;
  bloomStrength: number;
  motionEnabled: boolean;
}

interface ThemeControlsProps {
  onSettingsChange?: (settings: ThemeSettings) => void;
}

export default function ThemeControls({ onSettingsChange }: ThemeControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ThemeSettings>({
    variant: "legal-luxe",
    overlayOpacity: 0.42,
    bloomStrength: 0.15,
    motionEnabled: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("themeSettings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        onSettingsChange?.(parsed);
      } catch (e) {
        console.error("Failed to parse theme settings:", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save settings to localStorage and notify parent
  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("themeSettings", JSON.stringify(updated));
    onSettingsChange?.(updated);
  };

  const variants = [
    { value: "legal-luxe", label: "Legal Luxe" },
    { value: "tech-law", label: "Tech Law" },
    { value: "data-scales", label: "Data Scales" },
    { value: "contract-macro", label: "Contract Macro" },
    { value: "boardroom", label: "Boardroom" }
  ];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 p-3 glass-card rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Theme Settings"
      >
        <Palette className="w-5 h-5 text-purple-400" />
      </motion.button>

      {/* Settings Panel */}
      <motion.div
        className="fixed bottom-20 right-4 z-50 w-80 p-6 glass-card-solid rounded-xl"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : 20,
          scale: isOpen ? 1 : 0.95,
          pointerEvents: isOpen ? "auto" : "none"
        }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          {copy.settings.appearance}
        </h3>

        {/* Variant Selector */}
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-2">
            {copy.settings.heroVariant}
          </label>
          <select
            className="w-full px-3 py-2 glass-input rounded-lg text-white"
            value={settings.variant}
            onChange={(e) => updateSettings({ variant: e.target.value })}
          >
            {variants.map(v => (
              <option key={v.value} value={v.value} className="bg-zinc-900">
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Overlay Opacity */}
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-2">
            {copy.settings.overlayIntensity}: {(settings.overlayOpacity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="30"
            max="55"
            value={settings.overlayOpacity * 100}
            onChange={(e) => updateSettings({ overlayOpacity: parseInt(e.target.value) / 100 })}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Bloom Strength */}
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-2">
            {copy.settings.bloomStrength}: {(settings.bloomStrength * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="40"
            value={settings.bloomStrength * 100}
            onChange={(e) => updateSettings({ bloomStrength: parseInt(e.target.value) / 100 })}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Motion Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">{copy.settings.motionEnabled}</span>
          <button
            onClick={() => updateSettings({ motionEnabled: !settings.motionEnabled })}
            className="p-2 glass-card rounded-lg hover:bg-zinc-800/60 transition-colors"
            aria-label={settings.motionEnabled ? "Disable motion" : "Enable motion"}
          >
            {settings.motionEnabled ? (
              <Eye className="w-5 h-5 text-purple-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-zinc-500" />
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
