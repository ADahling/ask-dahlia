"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import { ArrowLeft, Lock, Mail, User, Building, Phone, MapPin, MessageSquare } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [accessForm, setAccessForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    reason: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(copy.success.accessRequested);
        setShowAccessModal(false);

        // Reset form
        setAccessForm({
          firstName: "",
          lastName: "",
          title: "",
          company: "",
          email: "",
          phone: "",
          address: "",
          reason: ""
        });
      } else {
        toast.error("Failed to submit request. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Back to Home */}
      <Link href="/" className="fixed top-8 left-8 z-10">
        <Button variant="ghost" className="text-zinc-400 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="light" size="lg" showText={true} />
          </div>
          <h1 className="text-2xl font-light text-white mb-2">
            {copy.product}
          </h1>
          <p className="text-zinc-400 text-sm">
            {copy.tagline}
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          className="glass-card-solid rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="glass-input pl-10"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="glass-input pl-10"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full button-gradient"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Helper Text */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm text-center mb-4">
              {copy.loginHelper}
            </p>
            <Button
              variant="outline"
              className="w-full border-zinc-700 hover:bg-zinc-800/50"
              onClick={() => setShowAccessModal(true)}
            >
              {copy.secondaryCTA}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Access Request Modal */}
      {showAccessModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setShowAccessModal(false)}
        >
          <motion.div
            className="w-full max-w-2xl glass-card-solid rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-white mb-6">
              Request Access
            </h2>

            <form onSubmit={handleAccessRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-zinc-300">
                    First Name
                  </Label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="firstName"
                      required
                      className="glass-input pl-10"
                      value={accessForm.firstName}
                      onChange={(e) => setAccessForm({ ...accessForm, firstName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-zinc-300">
                    Last Name
                  </Label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="lastName"
                      required
                      className="glass-input pl-10"
                      value={accessForm.lastName}
                      onChange={(e) => setAccessForm({ ...accessForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-zinc-300">
                    Title
                  </Label>
                  <Input
                    id="title"
                    required
                    className="glass-input"
                    value={accessForm.title}
                    onChange={(e) => setAccessForm({ ...accessForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-zinc-300">
                    Company
                  </Label>
                  <div className="mt-1 relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="company"
                      required
                      className="glass-input pl-10"
                      value={accessForm.company}
                      onChange={(e) => setAccessForm({ ...accessForm, company: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accessEmail" className="text-zinc-300">
                    Email
                  </Label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="accessEmail"
                      type="email"
                      required
                      className="glass-input pl-10"
                      value={accessForm.email}
                      onChange={(e) => setAccessForm({ ...accessForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-zinc-300">
                    Phone
                  </Label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      className="glass-input pl-10"
                      value={accessForm.phone}
                      onChange={(e) => setAccessForm({ ...accessForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-zinc-300">
                  Address
                </Label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <textarea
                    id="address"
                    required
                    className="glass-input pl-10 w-full min-h-[80px] resize-none"
                    value={accessForm.address}
                    onChange={(e) => setAccessForm({ ...accessForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason" className="text-zinc-300">
                  Reason for Access
                </Label>
                <div className="mt-1 relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <textarea
                    id="reason"
                    required
                    className="glass-input pl-10 w-full min-h-[100px] resize-none"
                    placeholder="Please describe your use case..."
                    value={accessForm.reason}
                    onChange={(e) => setAccessForm({ ...accessForm, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-zinc-700 hover:bg-zinc-800/50"
                  onClick={() => setShowAccessModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 button-gradient"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
