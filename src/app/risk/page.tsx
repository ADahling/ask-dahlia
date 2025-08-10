"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Scale,
  FileText,
  ArrowRight,
  Shield,
  MessageSquare,
  Save,
  Download,
  Info
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface RiskLevel {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
}

interface RiskFactor {
  id: string;
  name: string;
  description: string;
  probability: number;
  impact: number;
  score: number;
  risk_class: "low" | "medium" | "high" | "critical";
}

interface ClauseSuggestion {
  clause_id: string;
  title: string;
  description: string;
  posture: "primary" | "secondary" | "fallback";
}

export default function RiskPage() {
  const [selectedProbability, setSelectedProbability] = useState<number>(3);
  const [selectedImpact, setSelectedImpact] = useState<number>(3);
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentGenerated, setAssessmentGenerated] = useState(false);

  const probabilityLevels: RiskLevel[] = [
    { value: 1, label: "Rare", color: "bg-blue-900/30 text-blue-400 border-blue-500/30" },
    { value: 2, label: "Unlikely", color: "bg-green-900/30 text-green-400 border-green-500/30" },
    { value: 3, label: "Possible", color: "bg-yellow-900/30 text-yellow-400 border-yellow-500/30" },
    { value: 4, label: "Likely", color: "bg-orange-900/30 text-orange-400 border-orange-500/30" },
    { value: 5, label: "Almost Certain", color: "bg-red-900/30 text-red-400 border-red-500/30" }
  ];

  const impactLevels: RiskLevel[] = [
    { value: 1, label: "Insignificant", color: "bg-blue-900/30 text-blue-400 border-blue-500/30" },
    { value: 2, label: "Minor", color: "bg-green-900/30 text-green-400 border-green-500/30" },
    { value: 3, label: "Moderate", color: "bg-yellow-900/30 text-yellow-400 border-yellow-500/30" },
    { value: 4, label: "Major", color: "bg-orange-900/30 text-orange-400 border-orange-500/30" },
    { value: 5, label: "Severe", color: "bg-red-900/30 text-red-400 border-red-500/30" }
  ];

  // Generate risk matrix with 5x5 grid
  const riskMatrix = Array.from({ length: 5 }, (_, i) => {
    const row = Array.from({ length: 5 }, (_, j) => {
      const score = (5 - i) * (j + 1);
      let riskClass: "low" | "medium" | "high" | "critical";

      if (score <= 4) riskClass = "low";
      else if (score <= 9) riskClass = "medium";
      else if (score <= 16) riskClass = "high";
      else riskClass = "critical";

      return { score, riskClass };
    });
    return row;
  });

  const getRiskClassColor = (riskClass: string) => {
    switch (riskClass) {
      case "low": return "bg-green-900/40 text-green-400 border-green-500/40";
      case "medium": return "bg-yellow-900/40 text-yellow-400 border-yellow-500/40";
      case "high": return "bg-orange-900/40 text-orange-400 border-orange-500/40";
      case "critical": return "bg-red-900/40 text-red-400 border-red-500/40";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const calculateRiskScore = (probability: number, impact: number) => {
    return probability * impact;
  };

  const calculateRiskClass = (score: number): "low" | "medium" | "high" | "critical" => {
    if (score <= 4) return "low";
    if (score <= 9) return "medium";
    if (score <= 16) return "high";
    return "critical";
  };

  const currentScore = calculateRiskScore(selectedProbability, selectedImpact);
  const currentRiskClass = calculateRiskClass(currentScore);

  // Mock risk factors based on current selection
  const riskFactors: RiskFactor[] = [
    {
      id: "1",
      name: "Inadequate Indemnification",
      description: "Current provisions do not provide sufficient protection against third-party claims.",
      probability: selectedProbability,
      impact: selectedImpact,
      score: currentScore,
      risk_class: currentRiskClass
    }
  ];

  // Mock clause suggestions based on current risk class
  const suggestedClauses: ClauseSuggestion[] = [
    {
      clause_id: "CL-001",
      title: "Mutual Indemnification",
      description: "Balanced protection for both parties against third-party claims and damages.",
      posture: "primary"
    },
    {
      clause_id: "CL-002",
      title: "Limited Indemnification with Caps",
      description: "Capped liability with exclusions for certain types of damages.",
      posture: "secondary"
    },
    {
      clause_id: "CL-003",
      title: "Minimal Indemnification",
      description: "Basic protection limited to direct damages with multiple exclusions.",
      posture: "fallback"
    }
  ];

  const handleGenerateAssessment = () => {
    if (!assessmentName) {
      toast.error("Please enter an assessment name");
      return;
    }

    // Simulate assessment generation
    setAssessmentGenerated(true);
    toast.success("Risk assessment generated");
  };

  const handleSaveAssessment = () => {
    if (!assessmentGenerated) {
      toast.error("Please generate an assessment first");
      return;
    }

    toast.success("Risk assessment saved");
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
                {copy.risk.title}
              </h1>
            </div>

            {assessmentGenerated && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                  onClick={handleSaveAssessment}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Assessment
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Link href="/chat">
                  <Button className="button-gradient">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discuss with Dahlia
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Matrix */}
          <motion.div
            className="glass-card-solid rounded-xl p-6 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-400" />
              Risk Assessment Matrix
            </h2>

            {/* Matrix and controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 5x5 Matrix */}
              <div>
                <div className="mb-3 flex items-center">
                  <div className="w-12"></div>
                  <div className="flex-1 flex justify-between items-center gap-1 pl-2">
                    <span className="text-xs text-zinc-500">Impact →</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  {/* Header row with impact labels */}
                  <div className="flex mb-2">
                    <div className="w-12 flex items-center justify-center">
                      <span className="text-xs text-zinc-500 -rotate-90 whitespace-nowrap">← Probability</span>
                    </div>
                    {impactLevels.map(level => (
                      <div
                        key={level.value}
                        className={cn(
                          "w-12 h-8 flex items-center justify-center rounded-md text-xs cursor-pointer border",
                          selectedImpact === level.value
                            ? level.color
                            : "border-zinc-800 text-zinc-500"
                        )}
                        onClick={() => setSelectedImpact(level.value)}
                      >
                        {level.value}
                      </div>
                    ))}
                  </div>

                  {/* Matrix rows */}
                  {riskMatrix.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex mb-2">
                      <div
                        className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-md text-xs cursor-pointer border",
                          selectedProbability === 5-rowIndex
                            ? probabilityLevels[4-rowIndex].color
                            : "border-zinc-800 text-zinc-500"
                        )}
                        onClick={() => setSelectedProbability(5-rowIndex)}
                      >
                        {5-rowIndex}
                      </div>

                      {row.map((cell, colIndex) => (
                        <div
                          key={colIndex}
                          className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-md border text-xs font-medium",
                            selectedProbability === 5-rowIndex && selectedImpact === colIndex+1
                              ? "ring-2 ring-white"
                              : "",
                            getRiskClassColor(cell.riskClass)
                          )}
                          onClick={() => {
                            setSelectedProbability(5-rowIndex);
                            setSelectedImpact(colIndex+1);
                          }}
                        >
                          {cell.score}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs text-zinc-400">Low (1-4)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-xs text-zinc-400">Medium (5-9)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <span className="text-xs text-zinc-400">High (10-16)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-xs text-zinc-400">Critical (17-25)</span>
                  </div>
                </div>
              </div>

              {/* Selection details */}
              <div className="space-y-4">
                <div className="glass-card p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Current Selection</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Probability:</span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        probabilityLevels[selectedProbability-1].color
                      )}>
                        {selectedProbability} - {probabilityLevels[selectedProbability-1].label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Impact:</span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        impactLevels[selectedImpact-1].color
                      )}>
                        {selectedImpact} - {impactLevels[selectedImpact-1].label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Risk Score:</span>
                      <span className="text-white font-semibold text-lg">
                        {currentScore}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Risk Class:</span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        getRiskClassColor(currentRiskClass)
                      )}>
                        {currentRiskClass.charAt(0).toUpperCase() + currentRiskClass.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Assessment Name</h3>
                  <input
                    type="text"
                    placeholder="Enter assessment name..."
                    className="glass-input w-full mb-3"
                    value={assessmentName}
                    onChange={(e) => setAssessmentName(e.target.value)}
                  />

                  <Button
                    className="w-full button-gradient"
                    onClick={handleGenerateAssessment}
                    disabled={!assessmentName}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Generate Assessment
                  </Button>
                </div>

                {assessmentGenerated && (
                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">Summary</h3>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        getRiskClassColor(currentRiskClass)
                      )}>
                        {currentRiskClass.charAt(0).toUpperCase() + currentRiskClass.slice(1)} Risk
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400 mb-3">
                      This assessment indicates a {currentRiskClass} level of risk based on a probability of {selectedProbability} ({probabilityLevels[selectedProbability-1].label}) and an impact of {selectedImpact} ({impactLevels[selectedImpact-1].label}).
                    </p>

                    <div className="text-xs text-zinc-500">
                      Generated on {new Date().toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Risk Factors and Recommended Clauses */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Risk Factors */}
            <div className="glass-card-solid rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-purple-400" />
                Risk Factors
              </h2>

              {assessmentGenerated ? (
                <div className="space-y-3">
                  {riskFactors.map(factor => (
                    <div key={factor.id} className="glass-card p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{factor.name}</h3>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-semibold",
                          getRiskClassColor(factor.risk_class)
                        )}>
                          Score: {factor.score}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">{factor.description}</p>
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Probability: {factor.probability}</span>
                        <span>Impact: {factor.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-6 rounded-lg text-center">
                  <Info className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">
                    Generate an assessment to view risk factors
                  </p>
                </div>
              )}
            </div>

            {/* Recommended Clauses */}
            {assessmentGenerated && (
              <div className="glass-card-solid rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  {copy.risk.recommendedClauses}
                </h2>

                <div className="space-y-3">
                  {suggestedClauses.map(clause => (
                    <Link key={clause.clause_id} href={`/clauses/${clause.clause_id}`}>
                      <div className="glass-card hover:bg-zinc-800/50 transition-colors p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-medium">{clause.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              clause.posture === "primary"
                                ? "bg-green-900/40 text-green-400"
                                : clause.posture === "secondary"
                                ? "bg-yellow-900/40 text-yellow-400"
                                : "bg-orange-900/40 text-orange-400"
                            )}>
                              {clause.posture.charAt(0).toUpperCase() + clause.posture.slice(1)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-purple-400" />
                          </div>
                        </div>
                        <p className="text-sm text-zinc-400">{clause.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
