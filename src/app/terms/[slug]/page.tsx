import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowLeft,
  MessageSquare,
  ExternalLink,
  Copy,
  Scale,
  AlertTriangle,
  Info,
  FileText
} from "lucide-react";
import Logo from "@/components/Logo";

interface TermDetail {
  id: string;
  slug: string;
  title: string;
  category: string;
  relatedTerms: string[];
  definition: string;
  implications: string;
  contractConsiderations: string;
  regulatoryContext: string;
}

// Generate static params for static export
export async function generateStaticParams() {
  return [
    { slug: "indemnification" },
    { slug: "force-majeure" },
    { slug: "confidentiality" }
  ];
}

// Sample data for fallback
const sampleTerms: Record<string, TermDetail> = {
  "indemnification": {
    id: "indemnification",
    slug: "indemnification",
    title: "Indemnification",
    category: "Risk Allocation",
    relatedTerms: ["Liability", "Hold Harmless", "Duty to Defend"],
    definition: "Indemnification is a contractual obligation by one party (the indemnifier) to compensate another party (the indemnitee) for specified losses, damages, or liabilities incurred by the indemnitee.",
    implications: "Indemnification shifts risk between the parties, potentially creating significant financial exposure for the indemnifying party. The scope of indemnification can vary widely, from narrow provisions covering specific third-party claims to broad provisions covering direct claims between the parties.",
    contractConsiderations: "Key considerations include: (1) what claims are covered, (2) whether a duty to defend exists, (3) caps on indemnification amounts, (4) exclusions for certain damages (e.g., consequential), (5) notice requirements, and (6) control of settlement.",
    regulatoryContext: "Some jurisdictions limit the enforceability of indemnification for a party's own negligence or willful misconduct. Anti-indemnity statutes in certain industries (construction, oil and gas) may void overly broad indemnification provisions."
  },
  "force-majeure": {
    id: "force-majeure",
    slug: "force-majeure",
    title: "Force Majeure",
    category: "Risk Allocation",
    relatedTerms: ["Act of God", "Impossibility", "Commercial Impracticability"],
    definition: "A clause that frees both parties from liability when an extraordinary event prevents one or both parties from fulfilling their obligations.",
    implications: "Force majeure provisions can excuse performance when unforeseen circumstances make performance impossible or impractical.",
    contractConsiderations: "Key considerations include what events qualify, notice requirements, mitigation obligations, and duration limits.",
    regulatoryContext: "Courts interpret force majeure clauses narrowly, requiring the specific event to be listed or fall within enumerated categories."
  },
  "confidentiality": {
    id: "confidentiality",
    slug: "confidentiality",
    title: "Confidentiality",
    category: "Information Rights",
    relatedTerms: ["Trade Secret", "Non-Disclosure", "Data Protection"],
    definition: "An agreement that prohibits the disclosure of specified information to third parties.",
    implications: "Confidentiality provisions protect sensitive business information and trade secrets from unauthorized disclosure.",
    contractConsiderations: "Key considerations include the scope of confidential information, permitted uses, return obligations, and duration.",
    regulatoryContext: "Some jurisdictions have specific laws governing trade secret protection and data privacy that may impact confidentiality provisions."
  }
};

async function getTerm(slug: string): Promise<TermDetail | null> {
  // In a real app, this would fetch from an API
  // For static generation, we'll use our sample data
  return sampleTerms[slug] || null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TermDetailPage({ params }: Props) {
  const { slug } = await params;
  const term = await getTerm(slug);

  if (!term) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Term not found</h2>
          <p className="text-zinc-400 mb-4">The requested term could not be found.</p>
          <Link href="/terms">
            <Button>Back to Terms</Button>
          </Link>
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
              <Link href="/terms" className="flex items-center gap-3">
                <ArrowLeft className="h-4 w-4 text-zinc-400" />
                <Logo variant="light" size="sm" />
              </Link>
              <h1 className="text-xl font-semibold text-white">{term.title}</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">{term.title}</h1>
                {term.category && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-900/30 text-purple-400 text-sm rounded-full">
                    <Scale className="h-4 w-4 mr-2" />
                    {term.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button size="sm" className="button-gradient">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask Dahlia
                </Button>
              </div>
            </div>

            <p className="text-lg text-zinc-300 leading-relaxed">{term.definition}</p>
          </div>

          <div className="grid gap-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Key Implications
              </h2>
              <p className="text-zinc-300 leading-relaxed">{term.implications}</p>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Contract Considerations
              </h2>
              <p className="text-zinc-300 leading-relaxed">{term.contractConsiderations}</p>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-green-400" />
                Regulatory Context
              </h2>
              <p className="text-zinc-300 leading-relaxed">{term.regulatoryContext}</p>
            </div>

            {term.relatedTerms && term.relatedTerms.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Related Terms</h2>
                <div className="flex flex-wrap gap-3">
                  {term.relatedTerms.map((relatedTerm: string, idx: number) => (
                    <Link
                      key={idx}
                      href={`/terms/${relatedTerm.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white rounded-lg transition-colors"
                    >
                      {relatedTerm}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
