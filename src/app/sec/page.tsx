"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import {
  Search,
  FileText,
  Calendar,
  Building,
  TrendingUp,
  Download,
  Plus,
  ArrowLeft,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface SecFiling {
  id: string;
  cik: string;
  ticker: string;
  company: string;
  form: string;
  filedAt: Date;
  accession: string;
  sections?: {
    item1?: string;
    item1A?: string;
    item7?: string;
  };
}

export default function SecPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFiling, setSelectedFiling] = useState<SecFiling | null>(null);
  const [filings, setFilings] = useState<SecFiling[]>([]);

  const formTypes = ['all', '10-K', '10-Q', '8-K', 'DEF 14A', 'S-1'];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a ticker or CIK");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch('/api/sec/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          formType: selectedForm === 'all' ? undefined : selectedForm
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setFilings(data.filings || []);

      if (data.filings && data.filings.length > 0) {
        toast.success(`Found ${data.filings.length} filing(s)`);
      } else {
        toast.info("No filings found for this search");
      }

    } catch (error) {
      console.error('SEC search error:', error);
      toast.error("Failed to search SEC filings");
      setFilings([]);
    } finally {
      setIsSearching(false);
    }
  };

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
              <h1 className="text-xl font-semibold text-white">SEC Filings</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Search SEC Filings</h2>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter ticker symbol or CIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full glass-input"
              />
            </div>

            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="glass-input w-32"
            >
              {formTypes.map(form => (
                <option key={form} value={form} className="bg-zinc-900">
                  {form === 'all' ? 'All Forms' : form}
                </option>
              ))}
            </select>

            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="button-gradient"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filings.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No filings found</h3>
              <p className="text-zinc-400">
                Search for a company by ticker symbol or CIK to view their SEC filings
              </p>
            </div>
          ) : (
            filings.map((filing) => (
              <motion.div
                key={filing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-900/30 text-blue-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{filing.company}</h3>
                        <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                          {filing.ticker}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {filing.filedAt.toLocaleDateString()}
                        </span>
                        <span>Form {filing.form}</span>
                        <span>CIK: {filing.cik}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => setSelectedFiling(filing)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {selectedFiling && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedFiling.company}</h2>
                    <p className="text-zinc-400">Form {selectedFiling.form} • {selectedFiling.filedAt.toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedFiling(null)}
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-96 p-6">
                <div className="text-zinc-400">
                  <p>Filing details would be displayed here.</p>
                  <p className="mt-2">Accession Number: {selectedFiling.accession}</p>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
