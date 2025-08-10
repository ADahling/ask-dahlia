"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { toast } from "sonner";
import { callWorker } from "@/lib/worker";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  FileCheck,
  AlertCircle,
  Plus
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  title: string;
  mime: string;
  bytes: number;
  status: 'processing' | 'ready' | 'error';
  chunks?: number;
  createdAt: Date;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, start with empty documents array
    // In the future, we can implement a documents list API endpoint
    setIsLoading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);

    for (const file of files) {
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        continue;
      }

      try {
        // Convert file to base64 for JSON transmission
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Call worker API for document processing
        const result = await callWorker('ingest/process', {
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: fileData
          },
          metadata: {
            uploadedAt: new Date().toISOString()
          }
        });

        const newDoc: DocumentItem = {
          id: result.id || Date.now().toString(),
          title: file.name,
          mime: file.type,
          bytes: file.size,
          status: 'processing',
          createdAt: new Date(),
        };

        setDocuments(prev => [newDoc, ...prev]);
        toast.success(`Uploaded ${file.name}`);

        const checkStatus = async () => {
          try {
            const statusData = await callWorker(`ingest/status/${newDoc.id}`);
            setDocuments(prev => prev.map(doc =>
              doc.id === newDoc.id
                ? { ...doc, status: statusData.status, chunks: statusData.chunkCount }
                : doc
            ));

            if (statusData.status === 'processing') {
              setTimeout(checkStatus, 2000);
            }
          } catch (error) {
            console.error('Status check failed:', error);
          }
        };

        checkStatus();

      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('word')) return '📝';
    if (mime.includes('text')) return '📋';
    return '📎';
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          <span className="text-zinc-400 text-sm ml-2">Loading documents...</span>
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
              <h1 className="text-xl font-semibold text-white">{copy.documents.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700 hover:border-zinc-600">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 mb-8 transition-colors",
            isDragging
              ? "border-purple-500 bg-purple-900/10"
              : "border-zinc-700 hover:border-zinc-600"
          )}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {copy.documents.upload}
            </h3>
            <p className="text-zinc-400 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,.docx"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(Array.from(e.target.files));
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button className="button-gradient" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Choose Files
                  </>
                )}
              </Button>
            </label>
            <p className="text-xs text-zinc-500 mt-2">
              Supports PDF, TXT, MD, and DOCX files
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No documents</h3>
              <p className="text-zinc-400">
                {documents.length === 0
                  ? "Upload your first document to get started"
                  : "No documents match your search"}
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getFileIcon(doc.mime)}</div>
                    <div>
                      <h3 className="text-white font-medium">{doc.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                        <span>{formatBytes(doc.bytes)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {doc.createdAt.toLocaleDateString()}
                        </span>
                        {doc.chunks && (
                          <>
                            <span>•</span>
                            <span>{doc.chunks} chunks</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      doc.status === 'ready'
                        ? "bg-green-900/50 text-green-400"
                        : doc.status === 'processing'
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-red-900/50 text-red-400"
                    )}>
                      {doc.status === 'ready' && <FileCheck className="inline h-3 w-3 mr-1" />}
                      {doc.status === 'processing' && <div className="inline w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin mr-1" />}
                      {doc.status === 'error' && <AlertCircle className="inline h-3 w-3 mr-1" />}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
