"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import { createWorkerStream } from "@/lib/worker";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Download,
  FileText,
  Search,
  ArrowLeft,
  MessageSquare,
  Clock,
  ChevronRight,
  ExternalLink,
  Copy,
  BookOpen
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  suggestedClauses?: SuggestedClause[];
}

interface Citation {
  type: "term" | "clause" | "doc" | "sec";
  id: string;
  title: string;
  page?: number;
  url?: string;
}

interface SuggestedClause {
  clause_id: string;
  title: string;
  posture: "Primary" | "Secondary" | "Fallback";
  reason: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: Date;
  messages: Message[];
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (sessions.length === 0) {
      handleNewSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setSessions(prev => prev.map(s =>
      s.id === currentSessionId
        ? { ...s, messages: [...s.messages, userMessage], lastMessage: new Date() }
        : s
    ));

    setInput("");
    setIsLoading(true);

    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      citations: [],
      suggestedClauses: []
    };

    setSessions(prev => prev.map(s =>
      s.id === currentSessionId
        ? { ...s, messages: [...s.messages, assistantMessage] }
        : s
    ));

    try {
      // Convert messages to OpenAI format
      const allMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Create streaming connection to worker API
      const abortStream = await createWorkerStream(
        'chat/stream',
        {
          messages: allMessages,
          sessionId: currentSessionId,
          provider: 'openai' // or make this configurable
        },
        // onMessage callback
        (data) => {
          if (data.content) {
            // Update the assistant message with new content
            setSessions(prev => prev.map(s =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantMessageId
                        ? { ...m, content: data.accumulated || data.content }
                        : m
                    )
                  }
                : s
            ));
          }

          if (data.done) {
            setIsLoading(false);
            // Could add citations and suggested clauses here if provided
            if (data.usage) {
              console.log('Usage:', data.usage);
            }
          }
        },
        // onError callback
        (error) => {
          console.error('Chat streaming error:', error);
          setIsLoading(false);

          // Update assistant message with error
          setSessions(prev => prev.map(s =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === assistantMessageId
                      ? { ...m, content: "I'm sorry, I'm having trouble connecting to the service right now. Please try again later." }
                      : m
                  )
                }
              : s
          ));
        },
        // onEnd callback
        () => {
          setIsLoading(false);
        }
      );

    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);

      // Update assistant message with error
      setSessions(prev => prev.map(s =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: "I'm sorry, I'm having trouble connecting to the service right now. Please try again later." }
                  : m
              )
            }
          : s
      ));
    }
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: new Date(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleVoiceToggle = async () => {
    try {
      if (!isRecording) {
        setIsRecording(true);
        toast.info("Recording started");
      } else {
        setIsRecording(false);
        toast.info("Recording stopped");
      }
    } catch (error) {
      console.error('Voice recording error:', error);
      toast.error('Voice recording failed');
      setIsRecording(false);
    }
  };

  const handleSpeakToggle = async () => {
    try {
      if (!isSpeaking) {
        setIsSpeaking(true);
        toast.info("Reading message");
      } else {
        setIsSpeaking(false);
        toast.info("Reading stopped");
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Text-to-speech failed');
      setIsSpeaking(false);
    }
  };

  const formatCitationType = (type: string) => {
    const types: Record<string, string> = {
      term: "T",
      clause: "C",
      doc: "D",
      sec: "SEC"
    };
    return types[type] || type.toUpperCase();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-80 glass-card-solid border-r border-zinc-800/50 flex flex-col">
        <div className="p-4 border-b border-zinc-800/50">
          <Link href="/dashboard" className="flex items-center gap-3 mb-4">
            <ArrowLeft className="h-4 w-4 text-zinc-400" />
            <Logo variant="light" size="sm" showText={false} />
            <span className="text-white font-medium">Chat with Dahlia</span>
          </Link>

          <Button
            onClick={handleNewSession}
            className="w-full button-gradient"
          >
            <Plus className="mr-2 h-4 w-4" />
            {copy.chat.newSession}
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Recent Sessions
          </h3>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-zinc-500 text-sm">No sessions yet</p>
            ) : (
              sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    currentSessionId === session.id
                      ? "glass-card bg-zinc-800/60"
                      : "hover:bg-zinc-800/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-purple-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{session.title}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(session.lastMessage).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="glass-card border-b border-zinc-800/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {currentSession?.title || "Chat"}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">{copy.caveat}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSources(!showSources)}
                className="text-zinc-400 hover:text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {copy.chat.sources}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {copy.chat.exportChat}
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h2 className="text-xl text-white mb-2">Start a conversation</h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                  {copy.chat.placeholder}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">D</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-2xl",
                        message.role === "user"
                          ? "glass-card bg-purple-900/20 border-purple-800/30"
                          : "glass-card"
                      )}
                    >
                      <div className="p-4">
                        <p className="text-white whitespace-pre-wrap">{message.content}</p>

                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-2">Sources:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.citations.map((citation, idx) => (
                                <button
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                                >
                                  <span className="text-xs font-mono text-purple-400">
                                    [{formatCitationType(citation.type)}-{citation.id}]
                                  </span>
                                  <span className="text-xs text-zinc-400">
                                    {citation.title}
                                  </span>
                                  {citation.page && (
                                    <span className="text-xs text-zinc-500">
                                      p.{citation.page}
                                    </span>
                                  )}
                                  {citation.url && (
                                    <ExternalLink className="h-3 w-3 text-zinc-500" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.suggestedClauses && message.suggestedClauses.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-2">Recommended Clauses:</p>
                            <div className="space-y-2">
                              {message.suggestedClauses.map((clause, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30"
                                >
                                  <div>
                                    <p className="text-sm text-white">{clause.title}</p>
                                    <p className="text-xs text-zinc-500">{clause.reason}</p>
                                  </div>
                                  <span className={cn(
                                    "text-xs px-2 py-1 rounded-full",
                                    clause.posture === "Primary"
                                      ? "bg-green-900/50 text-green-400"
                                      : clause.posture === "Secondary"
                                      ? "bg-yellow-900/50 text-yellow-400"
                                      : "bg-zinc-700/50 text-zinc-400"
                                  )}>
                                    {clause.posture}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {message.role === "assistant" && (
                        <div className="px-4 pb-3 flex items-center gap-2">
                          <button className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={handleSpeakToggle}
                            className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                          >
                            {isSpeaking ? (
                              <VolumeX className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">U</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-zinc-400 text-sm ml-2">{copy.chat.thinking}</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="glass-card-solid border-t border-zinc-800/50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <button
                onClick={handleVoiceToggle}
                className={cn(
                  "p-3 rounded-lg transition-colors",
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "glass-card hover:bg-zinc-800/60 text-zinc-400 hover:text-white"
                )}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={copy.chat.placeholder}
                  className="w-full glass-input resize-none pr-12"
                  rows={1}
                  style={{
                    minHeight: "48px",
                    maxHeight: "200px"
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "absolute right-2 bottom-2 p-2 rounded-lg transition-colors",
                    input.trim() && !isLoading
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSources && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="w-80 glass-card-solid border-l border-zinc-800/50 p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {copy.chat.sources}
            </h3>
            <ScrollArea className="h-full">
              <div className="space-y-3">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No sources available</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Upload documents to see sources here
                  </p>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
