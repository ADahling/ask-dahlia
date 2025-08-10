"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  ArrowLeft,
  Filter,
  ArrowRight,
  Hash,
  Tag,
  BookOpenCheck,
  ExternalLink
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface Term {
  id: string;
  slug: string;
  title: string;
  body: string;
  category?: string;
  relatedTerms?: string[];
}

export default function TermsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/terms');

        if (response.ok) {
          const data = await response.json();
          setTerms(data.terms || []);

          const uniqueCategories = [...new Set(
            (data.terms || [])
              .map((term: Term) => term.category)
              .filter(Boolean)
          )] as string[];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Failed to fetch terms:', error);
        toast.error('Failed to load terms');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const filteredTerms = terms.filter(term => {
    const matchesQuery = term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const groupedTerms: Record<string, Term[]> = {};

  filteredTerms.forEach(term => {
    const firstLetter = term.title.charAt(0).toUpperCase();
    if (!groupedTerms[firstLetter]) {
      groupedTerms[firstLetter] = [];
    }
    groupedTerms[firstLetter].push(term);
  });

  Object.keys(groupedTerms).forEach(letter => {
    groupedTerms[letter].sort((a, b) => a.title.localeCompare(b.title));
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          <span className="text-zinc-400 text-sm ml-2">Loading terms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 glass-card border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <ArrowLeft className="h-4 w-4 text-zinc-400" />
                <Logo variant="light" size="sm" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Terms Library</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                selectedCategory === null
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              )}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-colors",
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedTerms).length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No terms found</h3>
              <p className="text-zinc-400">
                {terms.length === 0
                  ? "No terms available in the library"
                  : "No terms match your current search and filters"}
              </p>
            </div>
          ) : (
            Object.keys(groupedTerms)
              .sort()
              .map(letter => (
                <div key={letter}>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-purple-400" />
                    {letter}
                  </h2>

                  <div className="grid gap-4">
                    {groupedTerms[letter].map((term) => (
                      <motion.div
                        key={term.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{term.title}</h3>
                              {term.category && (
                                <span className="px-2 py-1 bg-zinc-800/50 text-zinc-400 text-xs rounded-full">
                                  {term.category}
                                </span>
                              )}
                            </div>

                            <p className="text-zinc-300 mb-4 leading-relaxed">{term.body}</p>

                            {term.relatedTerms && term.relatedTerms.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-zinc-400 mb-2">Related Terms:</p>
                                <div className="flex flex-wrap gap-2">
                                  {term.relatedTerms.map((relatedTerm, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-zinc-800/30 text-zinc-400 text-xs rounded hover:bg-zinc-700/30 transition-colors cursor-pointer"
                                    >
                                      {relatedTerm}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Link href={`/terms/${term.slug}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-zinc-400 hover:text-white"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-white"
                            >
                              <BookOpenCheck className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
