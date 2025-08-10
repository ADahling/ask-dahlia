"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Search,
  FileText,
  Scale,
  Brain,
  Lock,
  Zap,
  Upload,
  MessageSquare,
  FileSearch,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { copy } from "@/lib/copy";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo variant="light" size="sm" />

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="button-gradient">
                  Begin Your Journey
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 text-zinc-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              className="sm:hidden pb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href="/login" className="block mb-2">
                <Button variant="ghost" className="w-full text-zinc-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="button-gradient w-full">
                  Begin Your Journey
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-card mb-4 sm:mb-6"
            {...fadeInUp}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-zinc-300">{copy.home.badge}</span>
          </motion.div>

          {/* Main Heading - Mobile Optimized */}
          <motion.h1
            className="text-3xl sm:text-5xl lg:text-7xl font-light text-white mb-4 sm:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span dangerouslySetInnerHTML={{
              __html: copy.home.h1.replace(
                "sophisticated legal operations",
                '<span class="text-gradient-dahlia font-normal">sophisticated legal operations</span>'
              )
            }} />
          </motion.h1>

          {/* Subtitle - Mobile Optimized */}
          <motion.p
            className="text-base sm:text-xl text-zinc-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {copy.home.subtitle}
          </motion.p>

          {/* CTA Buttons - Mobile Optimized */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link href="/chat" className="w-full sm:w-auto">
              <Button size="lg" className="button-gradient group w-full sm:w-auto text-sm sm:text-base py-6">
                <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {copy.home.ctaPrimary}
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/documents" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800/50 w-full sm:w-auto text-sm sm:text-base py-6">
                <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {copy.home.ctaSecondary}
              </Button>
            </Link>
          </motion.div>

          {/* Pillars - Mobile Optimized */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {copy.home.pillars.map((pillar, index) => (
              <motion.div
                key={pillar}
                className="flex items-center gap-2 text-zinc-400"
                variants={fadeInUp}
              >
                <div className="w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <span className="text-xs sm:text-sm uppercase tracking-wider">{pillar}</span>
                <div className="w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid - Mobile Optimized */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-4xl font-light text-white mb-3 sm:mb-4">
              Capabilities That Redefine Legal Excellence
            </h2>
            <p className="text-base sm:text-xl text-zinc-400 px-4">
              Sophisticated instrumentation for the modern legal enterprise
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Search,
                title: copy.features.semanticDiscovery.title,
                description: copy.features.semanticDiscovery.description
              },
              {
                icon: Brain,
                title: copy.features.augmentedIntelligence.title,
                description: copy.features.augmentedIntelligence.description
              },
              {
                icon: Scale,
                title: copy.features.riskAnalytics.title,
                description: copy.features.riskAnalytics.description
              },
              {
                icon: FileText,
                title: copy.features.documentAssembly.title,
                description: copy.features.documentAssembly.description
              },
              {
                icon: Shield,
                title: copy.features.regulatoryIntel.title,
                description: copy.features.regulatoryIntel.description
              },
              {
                icon: Zap,
                title: copy.features.naturalLanguage.title,
                description: copy.features.naturalLanguage.description
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-5 sm:p-6 rounded-xl hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400 mb-3 sm:mb-4 group-hover:text-purple-300 transition-colors" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Actions - Mobile Optimized */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="glass-card-solid rounded-2xl p-8 sm:p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-6 sm:mb-8">
              Elevate your practice to unprecedented sophistication
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {[
                { icon: Upload, label: copy.quickActions.documentIngestion, href: "/documents" },
                { icon: MessageSquare, label: copy.quickActions.intelligenceConsole, href: "/chat" },
                { icon: FileSearch, label: copy.quickActions.secSurveillance, href: "/sec" },
                { icon: BarChart3, label: copy.quickActions.executiveDashboard, href: "/dashboard" }
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <motion.div
                    className="glass-card p-3 sm:p-4 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <action.icon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mx-auto mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm text-zinc-300">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="relative py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="text-zinc-400 text-xs sm:text-sm text-center sm:text-left">
            {copy.copyright}
          </div>
          <div className="flex gap-4 sm:gap-6">
            <Link href="/privacy" className="text-zinc-400 hover:text-white text-xs sm:text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/tos" className="text-zinc-400 hover:text-white text-xs sm:text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
