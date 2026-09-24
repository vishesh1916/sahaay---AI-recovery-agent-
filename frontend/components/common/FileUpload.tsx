'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, X, FileText, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  label: string;
  description: string;
  docType: string;
  onFileSelect?: (file: File | null) => void;
  hint?: string;
}

export function FileUpload({
  label,
  description,
  docType,
  onFileSelect,
  hint,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isUploaded = !!selectedFile;

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragging
          ? 'border-[#246BB2] bg-sky-50/60 scale-[1.01]'
          : isUploaded
          ? 'border-emerald-400 bg-emerald-50/50 shadow-xs'
          : 'border-slate-300 bg-slate-50/70 hover:border-[#246BB2] hover:bg-sky-50/30'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${
          isUploaded
            ? 'bg-emerald-100 text-emerald-700 shadow-xs'
            : 'bg-white text-slate-500 border border-slate-200 group-hover:text-[#246BB2] group-hover:border-[#246BB2]/30 shadow-xs'
        }`}
      >
        {isUploaded ? <FileCheck className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-bold text-[#101B35]">{label}</h4>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>

      {isUploaded ? (
        <div className="mt-3.5 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
          <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[150px] font-mono text-[11px]">{selectedFile?.name}</span>
          <span className="text-[10px] text-slate-400">({formatFileSize(selectedFile?.size || 0)})</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-rose-600 ml-1 p-0.5 transition-colors rounded-full hover:bg-rose-50"
            title="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="mt-3 text-[11px] font-semibold text-slate-400 group-hover:text-[#246BB2] transition-colors">
          Click or drag file here (PDF / Image)
        </div>
      )}
    </div>
  );
}
