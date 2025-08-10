"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import {
  Mail,
  ArrowLeft,
  Send,
  Download,
  Save,
  Copy,
  Users,
  MessageSquare,
  X,
  Bookmark,
  Pencil
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

type ToneType = "formal" | "neutral" | "warm" | "persuasive";

interface ToneOption {
  value: ToneType;
  label: string;
  description: string;
  color: string;
}

export default function DraftEmailPage() {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneType>("neutral");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  const toneOptions: ToneOption[] = [
    {
      value: "formal",
      label: copy.email.tone.formal,
      description: "Professional and structured communication with precise language and traditional business formality.",
      color: "bg-blue-900/30 text-blue-400 border-blue-500/30"
    },
    {
      value: "neutral",
      label: copy.email.tone.neutral,
      description: "Balanced and straightforward communication that is neither overly formal nor casual.",
      color: "bg-purple-900/30 text-purple-400 border-purple-500/30"
    },
    {
      value: "warm",
      label: copy.email.tone.warm,
      description: "Friendly and approachable communication that builds rapport while maintaining professionalism.",
      color: "bg-amber-900/30 text-amber-400 border-amber-500/30"
    },
    {
      value: "persuasive",
      label: copy.email.tone.persuasive,
      description: "Compelling communication designed to influence decisions and drive specific actions.",
      color: "bg-emerald-900/30 text-emerald-400 border-emerald-500/30"
    }
  ];

  const selectedToneOption = toneOptions.find(tone => tone.value === selectedTone)!;

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setRecipients([...recipients, newRecipient.trim()]);
    setNewRecipient("");
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newRecipient.trim()) {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleGenerateEmail = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!context.trim()) {
      toast.error("Please provide context for the email");
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock generated email based on selected tone
      let emailContent = "";

      switch (selectedTone) {
        case "formal":
          emailContent = `Dear ${recipients.length > 0 ? recipients[0].split('@')[0] : "Recipient"},

I am writing to address the matter regarding ${subject}.

${context}

Please review the attached documentation at your earliest convenience. Should you have any inquiries or require further clarification, do not hesitate to contact me.

I look forward to your response.

Sincerely,
[Your Name]
[Your Title]
[Company Name]
[Contact Information]`;
          break;

        case "neutral":
          emailContent = `Hi ${recipients.length > 0 ? recipients[0].split('@')[0] : "there"},

I'm reaching out about ${subject}.

${context}

Let me know if you have any questions or need more information.

Thanks,
[Your Name]
[Your Title]
[Company Name]
[Contact Information]`;
          break;

        case "warm":
          emailContent = `Hi ${recipients.length > 0 ? recipients[0].split('@')[0] : "there"},

Hope you're doing well! I wanted to connect with you about ${subject}.

${context}

I'd be happy to discuss this further or answer any questions you might have. Feel free to reach out anytime.

All the best,
[Your Name]
[Your Title]
[Company Name]
[Contact Information]`;
          break;

        case "persuasive":
          emailContent = `Hi ${recipients.length > 0 ? recipients[0].split('@')[0] : "there"},

I'm excited to share some important information with you about ${subject}.

${context}

This opportunity presents significant benefits, and I believe it would be advantageous for us to discuss this further. When would be a good time for a quick call this week?

Looking forward to your response,
[Your Name]
[Your Title]
[Company Name]
[Contact Information]`;
          break;
      }

      setGeneratedEmail(emailContent);
      toast.success("Email draft generated");
    } catch (error) {
      toast.error("Failed to generate email draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEmail = () => {
    if (!generatedEmail) {
      toast.error("No email draft to save");
      return;
    }

    // Mock save
    toast.success("Email draft saved to My Documents");
  };

  const handleExportEmail = (format: 'docx' | 'pdf' | 'txt') => {
    if (!generatedEmail) {
      toast.error("No email draft to export");
      return;
    }

    // Mock export
    toast.success(`Email exported as ${format.toUpperCase()}`);
  };

  const handleCopyToClipboard = () => {
    if (!generatedEmail) {
      toast.error("No email draft to copy");
      return;
    }

    navigator.clipboard.writeText(generatedEmail);
    toast.success("Email draft copied to clipboard");
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass-card border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 text-zinc-400" />
                <Logo variant="light" size="sm" showText={false} />
              </Link>
              <h1 className="text-xl font-semibold text-white">
                {copy.email.title}
              </h1>
            </div>

            {generatedEmail && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={() => handleSaveEmail()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {copy.email.save}
                </Button>
                <div className="relative group">
                  <Button
                    size="sm"
                    className="button-gradient"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {copy.email.export}
                  </Button>
                  <div className="absolute right-0 mt-2 w-36 glass-card-solid rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleExportEmail('docx')}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 rounded-lg"
                      >
                        Export as DOCX
                      </button>
                      <button
                        onClick={() => handleExportEmail('pdf')}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 rounded-lg"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExportEmail('txt')}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 rounded-lg"
                      >
                        Export as TXT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Configuration */}
          <motion.div
            className="glass-card-solid rounded-xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-white mb-6">
              Email Configuration
            </h2>

            {/* Recipients */}
            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2">
                {copy.email.recipients}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="Add recipient email..."
                  className="glass-input pl-10 pr-4 py-2 w-full"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {recipients.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {recipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center glass-card px-3 py-1 rounded-full"
                    >
                      <span className="text-sm text-zinc-300">{recipient}</span>
                      <button
                        className="ml-2 text-zinc-500 hover:text-zinc-300"
                        onClick={() => handleRemoveRecipient(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2">
                {copy.email.subject}
              </label>
              <input
                type="text"
                placeholder="Enter email subject..."
                className="glass-input w-full"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2">
                Tone
              </label>
              <div className="grid grid-cols-2 gap-3">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.value}
                    className={cn(
                      "text-left p-3 rounded-lg border transition-all",
                      selectedTone === tone.value
                        ? cn("border", tone.color)
                        : "border-zinc-800 hover:border-zinc-700"
                    )}
                    onClick={() => setSelectedTone(tone.value)}
                  >
                    <h3 className={cn(
                      "font-medium text-sm mb-1",
                      selectedTone === tone.value
                        ? cn(tone.color.split(' ')[1])
                        : "text-white"
                    )}>
                      {tone.label}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {tone.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2">
                Email Context
              </label>
              <textarea
                placeholder="Describe what you want to communicate in this email..."
                className="glass-input w-full min-h-[150px] resize-none"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <Button
              className="w-full button-gradient"
              onClick={handleGenerateEmail}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>
          </motion.div>

          {/* Preview */}
          <motion.div
            className="glass-card-solid rounded-xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {copy.email.preview}
              </h2>

              {selectedToneOption && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm",
                  selectedToneOption.color
                )}>
                  {selectedToneOption.label}
                </div>
              )}
            </div>

            {generatedEmail ? (
              <div className="glass-card p-6 rounded-lg">
                <div className="mb-4 pb-4 border-b border-zinc-800">
                  <div className="mb-2">
                    <span className="text-xs text-zinc-500">From:</span>
                    <span className="ml-2 text-zinc-300">Your Name &lt;your.email@example.com&gt;</span>
                  </div>

                  {recipients.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-zinc-500">To:</span>
                      <span className="ml-2 text-zinc-300">{recipients.join(', ')}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-zinc-500">Subject:</span>
                    <span className="ml-2 text-zinc-300 font-medium">{subject}</span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap text-zinc-300 font-mono">
                  {generatedEmail}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between">
                  <button
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                    onClick={() => {
                      setGeneratedEmail("");
                      toast.success("Email draft cleared");
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit Prompt
                  </button>

                  <button
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                    onClick={() => handleSaveEmail()}
                  >
                    <Bookmark className="h-3 w-3" />
                    Save Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <Mail className="h-16 w-16 text-zinc-700 mb-4" />
                <p className="text-zinc-500 text-center max-w-md">
                  Your email draft will appear here. Configure your email settings and click "Generate Email" to create a draft.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
