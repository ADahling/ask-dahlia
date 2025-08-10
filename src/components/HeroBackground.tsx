"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { getHeroImage, HeroImage } from "@/lib/hero";

interface HeroBackgroundProps {
  variant?: string;
  overlayOpacity?: number;
  bloomStrength?: number;
}

export default function HeroBackground({
  variant = "legal-luxe",
  overlayOpacity = 0.42,
  bloomStrength = 0.15
}: HeroBackgroundProps) {
  const [heroImage, setHeroImage] = useState<HeroImage>(getHeroImage(variant));
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  // Parallax transforms with clamp
  const imageY = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [0, 0] : [0, -150],
    { clamp: true }
  );

  const dustY = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [0, 0] : [0, -300],
    { clamp: true }
  );

  useEffect(() => {
    setHeroImage(getHeroImage(variant));
  }, [variant]);

  // Determine object position based on screen size
  const getObjectPosition = () => {
    if (typeof window === 'undefined') return heroImage.objectPosition.desktop;

    const width = window.innerWidth;
    if (width < 640) return heroImage.objectPosition.mobile;
    if (width < 1024) return heroImage.objectPosition.tablet;
    return heroImage.objectPosition.desktop;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* LQIP blur placeholder */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${heroImage.lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: getObjectPosition(),
          filter: 'blur(20px)',
          opacity: imageLoaded ? 0 : 1,
          transition: 'opacity 0.4s ease-out'
        }}
      />

      {/* Main image with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: imageY,
          scale: prefersReducedMotion ? 1 : 1.1
        }}
      >
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          quality={90}
          className="object-cover"
          style={{
            objectPosition: getObjectPosition()
          }}
          onLoad={() => setImageLoaded(true)}
        />
      </motion.div>

      {/* Gradient scrim */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(9, 9, 11, ${overlayOpacity * 0.9}) 0%,
            rgba(9, 9, 11, ${overlayOpacity}) 38%,
            rgba(24, 24, 27, ${overlayOpacity}) 45%,
            rgba(24, 24, 27, ${overlayOpacity * 1.1}) 100%
          )`
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            rgba(0, 0, 0, ${overlayOpacity * 0.3}) 50%,
            rgba(0, 0, 0, ${overlayOpacity * 0.6}) 100%
          )`
        }}
      />

      {/* Bloom effect */}
      {bloomStrength > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              circle at 50% 30%,
              rgba(168, 139, 250, ${bloomStrength}) 0%,
              transparent 40%
            )`,
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Sparse micro-dust particles */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ y: dustY }}
        >
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-px bg-white/30 rounded-full"
                style={{
                  left: `${(i * 8.33) + (i % 2 * 4)}%`,
                  top: `${(i * 7) + (i % 3 * 10)}%`
                }}
                animate={{
                  y: [-5, 5, -5],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Accessibility contrast check overlay */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-0"
        data-contrast-check
      />
    </div>
  );
}
