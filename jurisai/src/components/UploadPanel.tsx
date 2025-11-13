import React, { useRef, useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';

interface UploadPanelProps {
  onUploaded: (caseId: string) => void;
  defaultSide?: string;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onUploaded, defaultSide = 'plaintiff' }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [caseTitle, setCaseTitle] = useState('');
  const { setLoading, setError, clearError } = useApp();

  async function handleUpload(e?: React.FormEvent) {
    e?.preventDefault();
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      const result = await apiService.uploadDocument(files[0], defaultSide, caseTitle);
      
      if (result.caseId) {
        onUploaded(result.caseId);
        // Reset form
        if (fileRef.current) fileRef.current.value = '';
        setCaseTitle('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-xl mb-4 hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Document Upload</h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 hover:border-gray-500/50 transition-colors bg-gray-800/30 group">
          <input 
            ref={fileRef} 
            type="file" 
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-colors file:cursor-pointer" 
          />
          <p className="text-xs text-gray-400 mt-3 group-hover:text-gray-300 transition-colors">
            Supports PDF, DOCX, and text files up to 10MB
          </p>
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-200">Case Title</label>
          <input 
            value={caseTitle} 
            onChange={e => setCaseTitle(e.target.value)} 
            placeholder="Enter case title (optional)" 
            className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" 
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Upload Document
        </button>
      </form>
    </div>
  );
};