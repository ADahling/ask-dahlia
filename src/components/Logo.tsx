"use client";

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  fontStyle?: "dancing" | "cinzel";
}

export default function Logo({
  className = "",
  variant = "light",
  size = "md",
  showText = true,
  fontStyle = "dancing"
}: LogoProps) {
  const sizes = {
    sm: { d: "text-3xl", text: "text-xl" },
    md: { d: "text-5xl", text: "text-2xl" },
    lg: { d: "text-6xl", text: "text-3xl" }
  };

  const currentSize = sizes[size];
  const textColor = variant === "light" ? "#ffffff" : "#18181b";
  const fontClass = fontStyle === "cinzel"
    ? "font-[family-name:var(--font-cinzel)]"
    : "font-[family-name:var(--font-dancing)]";

  return (
    <motion.div
      className={`flex items-center ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Elegant Text-based D using Dancing Script */}
      <motion.div
        className={`${currentSize.d} ${fontClass} font-bold leading-none`}
        style={{
          background: "linear-gradient(135deg, #e879f9 0%, #c084fc 50%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 20px rgba(232, 121, 249, 0.3)",
          letterSpacing: fontStyle === "cinzel" ? "-0.05em" : "0"
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        D
      </motion.div>

      {showText && (
        <motion.div
          className={`ml-3 ${currentSize.text} ${fontClass} font-semibold tracking-wide`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            background: "linear-gradient(135deg, #e879f9 0%, #c084fc 25%, #a78bfa 50%, #c084fc 75%, #e879f9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 15px rgba(232, 121, 249, 0.2)"
          }}
        >
          Ask Dahlia
        </motion.div>
      )}
    </motion.div>
  );
}
