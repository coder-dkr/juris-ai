import React, { useEffect, useRef, useState } from 'react';
import { useApp } from './hooks/useApp';
import { apiService } from './services/api';

function UploadPanel({ onUploaded }: { onUploaded: (caseId: string) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [side, setSide] = useState('plaintiff');
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
      
      const result = await apiService.uploadDocument(files[0], side, caseTitle);
      
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">📄 Upload Documents</h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
          <input 
            ref={fileRef} 
            type="file" 
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 file:transition-colors" 
          />
          <p className="text-xs text-gray-500 mt-2">PDF, DOCX, or text files</p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Side:</label>
          <select value={side} onChange={e => setSide(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="plaintiff">Plaintiff</option>
            <option value="defense">Defense</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Case Title:</label>
          <input value={caseTitle} onChange={e => setCaseTitle(e.target.value)} placeholder="Enter case title (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
          Upload Document
        </button>
      </form>
    </div>
  );
}

function ArgumentPanel({ caseId, side }: { caseId?: string | null; side: string }) {
  const [text, setText] = useState('');
  const { setLoading, setError, clearError } = useApp();

  async function submitArg() {
    if (!caseId) {
      setError('Please select or create a case first');
      return;
    }
    
    if (!text.trim()) {
      setError('Please enter an argument');
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      await apiService.submitArgument(caseId, side, text);
      setText(''); // Clear the text area after successful submission
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit argument');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 capitalize">⚖️ {side} Arguments</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Submit your argument:</label>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            rows={6} 
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={`Present your ${side} arguments here...`}
          />
          <p className="text-xs text-gray-500 mt-2">Clear, well-reasoned arguments work best</p>
        </div>
        <button 
          onClick={submitArg} 
          className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Submit Argument
        </button>
      </div>
    </div>
  );
}

function VerdictPanel({ currentVerdict }: { currentVerdict?: string | null }) {
  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">⚖️ AI Judge</h1>
        <p className="text-gray-600">Analyzing case evidence and delivering verdict</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Verdict & Analysis</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg min-h-[300px] font-mono text-sm leading-relaxed">
            {currentVerdict || (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-2xl mb-2">⏳</div>
                  <p>Awaiting case documents and arguments...</p>
                  <p className="text-sm mt-2">Upload documents from both sides to begin analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { state, setCaseId, setVerdict, setLoading, setError, clearError } = useApp();
  const { caseId, verdict, loading, error } = state;

  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d.type === 'verdict') setVerdict(d.text);
      } catch (err) {
        console.warn('Invalid SSE data', err);
      }
    };
    
    es.onerror = (err) => {
      console.error('SSE connection error:', err);
    };
    
    return () => es.close();
  }, [setVerdict]);

  async function requestVerdict() {
    if (!caseId) {
      setError('No case selected');
      return;
    }
    
    try {
      setLoading(true);
      clearError();
      
      const result = await apiService.requestVerdict(caseId);
      setVerdict(result.text || JSON.stringify(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate verdict');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-[320px_1fr_320px] h-screen bg-gray-50">
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button 
              onClick={clearError}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Left Panel - Plaintiff */}
      <div className="bg-gray-50 p-6 overflow-auto border-r border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">👩‍💼 Plaintiff Side</h2>
          <p className="text-sm text-gray-600">Upload documents and present your case</p>
        </div>
        <UploadPanel onUploaded={(id) => setCaseId(id)} />
        <ArgumentPanel caseId={caseId} side="plaintiff" />
      </div>
      
      {/* Center Panel - AI Judge */}
      <div className="bg-white p-8 flex flex-col items-center justify-start overflow-auto relative">
        {loading && (
          <div className="absolute top-4 right-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg">
            <span className="text-sm">Processing...</span>
          </div>
        )}
        <VerdictPanel currentVerdict={verdict} />
        <div className="mt-8 flex flex-col items-center space-y-4">
          <button 
            onClick={requestVerdict} 
            disabled={!caseId || loading}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
          >
            {loading ? 'Generating...' : 'Generate Verdict'}
          </button>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <span className="text-xs font-medium text-gray-500">Case ID:</span>
            <span className="text-sm font-mono text-gray-800 ml-2">{caseId || 'No case selected'}</span>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Defense */}
      <div className="bg-gray-50 p-6 overflow-auto border-l border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">👨‍💼 Defense Side</h2>
          <p className="text-sm text-gray-600">Upload documents and present your defense</p>
        </div>
        <ArgumentPanel caseId={caseId} side="defense" />
      </div>
    </div>
  );
}

export default App;
