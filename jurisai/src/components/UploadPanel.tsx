import React, { useRef, useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';

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
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for default name
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
      setError('Please select at least one document to upload');
      return;
    }

    try {
      setLoading(true);
      setIsUploading(true);
      clearError();
      
      let resultCaseId = '';
      
      // Upload documents sequentially
      for (const doc of documents) {
        const result = await apiService.uploadDocument(doc.file, defaultSide, doc.name, caseId);
        if (result.caseId && !resultCaseId) {
          resultCaseId = result.caseId;
        }
      }
      
      if (resultCaseId) {
        onUploaded(resultCaseId);
        // Reset form
        if (fileRef.current) fileRef.current.value = '';
        setDocuments([]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addDocuments(e.target.files);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-xl mb-4 hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Document Upload
      </h3>
      
      <form onSubmit={handleUpload} className="space-y-4">
        {/* File Drop Zone */}
        <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 hover:border-gray-500/50 transition-colors bg-gray-800/30 group">
          <input 
            ref={fileRef} 
            type="file" 
            multiple
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-colors file:cursor-pointer" 
          />
          <p className="text-xs text-gray-400 mt-3 group-hover:text-gray-300 transition-colors">
            Select multiple files • PDF, DOCX, and text files up to 10MB each
          </p>
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Selected Documents ({documents.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-gray-400 truncate">{doc.file.name}</span>
                      <span className="text-xs text-gray-500">({(doc.file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateDocumentName(doc.id, e.target.value)}
                      placeholder="Enter document name"
                      className="w-full px-3 py-2 bg-gray-900/70 border border-gray-600/50 rounded-md text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={documents.length === 0 || isUploading}
          className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Uploading {documents.length} Document{documents.length > 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload {documents.length} Document{documents.length > 1 ? 's' : ''}
            </>
          )}
        </button>
      </form>
    </div>
  );
};