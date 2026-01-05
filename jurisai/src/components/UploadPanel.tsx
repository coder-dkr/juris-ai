import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  Plus, 
  CheckCircle2,
  AlertCircle,
  FileUp
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DocumentUpload {
  file: File;
  name: string;
  id: string;
}

interface UploadPanelProps {
  onUploaded: (caseId: string) => void;
  defaultSide?: string;
  caseId: string;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onUploaded, defaultSide = 'plaintiff', caseId }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { setLoading, setError, clearError } = useApp();

  const addDocuments = (files: FileList | null) => {
    if (!files) return;
    
    const newDocs: DocumentUpload[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newDocs.push({
        file,
        name: file.name.replace(/\.[^/.]+$/, ''),
        id: Math.random().toString(36).substring(2, 9)
      });
    }
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const updateDocumentName = (id: string, name: string) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === id ? { ...doc, name } : doc)
    );
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  async function handleUpload(e?: React.FormEvent) {
    e?.preventDefault();
    
    if (documents.length === 0) {
      setError('System requires at least one evidentiary file.');
      return;
    }

    try {
      setLoading(true);
      setIsUploading(true);
      clearError();
      
      let resultCaseId = '';
      
      for (const doc of documents) {
        const result = await apiService.uploadDocument(doc.file, defaultSide, doc.name, caseId);
        if (result.caseId && !resultCaseId) {
          resultCaseId = result.caseId;
        }
      }
      
      if (resultCaseId) {
        onUploaded(resultCaseId);
        if (fileRef.current) fileRef.current.value = '';
        setDocuments([]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registry upload failed');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addDocuments(e.target.files);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleUpload} className="space-y-4">
        {/* Upload Trigger Area */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-cyan-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <div 
            onClick={() => fileRef.current?.click()}
            className="relative cursor-pointer border border-white/5 bg-black/40 hover:bg-white/5 rounded-2xl p-6 transition-all border-dashed hover:border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-3"
          >
            <input 
              ref={fileRef} 
              type="file" 
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FileUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-widest">Transmit Evidence</p>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">PDF // DOCX // TXT (MAX 10MB)</p>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        <AnimatePresence>
          {documents.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between px-1">
                 <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Queue: {documents.length} Units</span>
                 <button 
                  type="button" 
                  onClick={() => setDocuments([])}
                  className="text-[10px] font-mono text-red-500/60 hover:text-red-500 uppercase tracking-widest"
                 >
                   Clear All
                 </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {documents.map((doc) => (
                  <motion.div 
                    key={doc.id} 
                    layout
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 group/item"
                  >
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="flex-grow min-w-0">
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => updateDocumentName(doc.id, e.target.value)}
                        className="w-full bg-transparent text-[10px] text-white focus:outline-none focus:text-cyan-400 font-mono truncate"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="p-1 text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Upload Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={documents.length === 0 || isUploading}
          className={cn(
            "w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
            documents.length > 0 ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)]" : "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Plus className="w-4 h-4" />
              </motion.div>
              <span>Syncing Registry...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize Transmission</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};
