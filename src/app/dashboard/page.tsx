"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import {
  FileText,
  Shield,
  Scale,
  AlertTriangle,
  Plus,
  Search,
  MessageSquare,
  Upload,
  BarChart3,
  Clock,
  TrendingUp,
  ArrowRight,
  Menu,
  Bell,
  Settings
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface KPICard {
  title: string;
  value: string;
  change?: number;
  icon: any;
  color: string;
  href?: string;
}

interface RecentActivity {
  id: string;
  type: 'document' | 'chat' | 'analysis';
  title: string;
  timestamp: Date;
  status?: 'completed' | 'processing' | 'error';
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Replace with actual API calls
        const [kpiResponse, activityResponse] = await Promise.all([
          // fetch('/api/dashboard/kpis'),
          // fetch('/api/dashboard/activity')
          // For now, return empty arrays to show clean state
          Promise.resolve({ kpis: [] }),
          Promise.resolve({ activity: [] })
        ]);

        // Set empty states - no mock data
        setKpis([
          {
            title: "Documents",
            value: "—",
            change: undefined,
            icon: FileText,
            color: "text-blue-400",
            href: "/documents"
          },
          {
            title: "Terms",
            value: "—",
            change: undefined,
            icon: Shield,
            color: "text-green-400",
            href: "/terms"
          },
          {
            title: "Clauses",
            value: "—",
            change: undefined,
            icon: Scale,
            color: "text-purple-400"
          },
          {
            title: "Open Risks",
            value: "—",
            change: undefined,
            icon: AlertTriangle,
            color: "text-yellow-400",
            href: "/risk"
          }
        ]);

        setRecentActivity([]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          <span className="text-zinc-400 text-sm ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass-card border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Logo variant="light" size="sm" />
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to {copy.product}
          </h2>
          <p className="text-zinc-400">{copy.caveat}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={kpi.href || '#'}
                className={cn(
                  "block glass-card p-6 hover:bg-zinc-800/30 transition-colors",
                  !kpi.href && "pointer-events-none"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold text-white">{kpi.value}</p>
                    {kpi.change !== undefined && (
                      <p className={cn(
                        "text-xs flex items-center gap-1 mt-1",
                        kpi.change > 0 ? "text-green-400" : "text-red-400"
                      )}>
                        <TrendingUp className="h-3 w-3" />
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </p>
                    )}
                  </div>
                  <kpi.icon className={cn("h-8 w-8", kpi.color)} />
                </div>
                {kpi.href && (
                  <div className="flex items-center justify-end mt-4">
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/chat">
              <Button className="w-full button-gradient h-12 justify-start">
                <MessageSquare className="mr-3 h-5 w-5" />
                Start Chat
              </Button>
            </Link>

            <Link href="/documents">
              <Button variant="outline" className="w-full h-12 justify-start border-zinc-700 hover:border-zinc-600">
                <Upload className="mr-3 h-5 w-5" />
                Upload Documents
              </Button>
            </Link>

            <Link href="/sec">
              <Button variant="outline" className="w-full h-12 justify-start border-zinc-700 hover:border-zinc-600">
                <Search className="mr-3 h-5 w-5" />
                SEC Search
              </Button>
            </Link>

            <Link href="/risk">
              <Button variant="outline" className="w-full h-12 justify-start border-zinc-700 hover:border-zinc-600">
                <BarChart3 className="mr-3 h-5 w-5" />
                Risk Analysis
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              View All
            </Button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No recent activity</p>
              <p className="text-sm text-zinc-500 mt-1">
                Start by uploading documents or beginning a chat session
              </p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.status === 'completed' ? "bg-green-400" :
                      activity.status === 'processing' ? "bg-yellow-400" :
                      activity.status === 'error' ? "bg-red-400" : "bg-zinc-400"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.title}</p>
                      <p className="text-xs text-zinc-500">
                        {activity.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </motion.div>
      </div>
    </div>
  );
}
