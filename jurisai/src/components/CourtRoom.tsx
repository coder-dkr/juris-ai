import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';
import { SidePanel, MainPanel, ErrorNotification } from '.';

interface CourtRoomProps {
  caseId: string;
}

export const CourtRoom: React.FC<CourtRoomProps> = ({ caseId }) => {
  const { state, setCaseId, setVerdict, setLoading, setError, clearError } = useApp();
  const { verdict, loading, error } = state;
  const [caseTitle, setCaseTitle] = useState<string>('');
  const [caseType, setCaseType] = useState<string>('');
  const [caseLoading, setCaseLoading] = useState<boolean>(true);
  const [caseNotFound, setCaseNotFound] = useState<boolean>(false);

  const fetchCaseDetails = useCallback(async () => {
    if (!caseId) return;
    
    try {
      setCaseLoading(true);
      setCaseNotFound(false);
      clearError();
      
      const caseData = await apiService.getCase(caseId);
      if (caseData) {
        setCaseTitle(caseData.title || 'Untitled Case');
        setCaseType(caseData.caseType || '');
      } else {
        setCaseNotFound(true);
      }
    } catch (err) {
      console.error('Failed to fetch case details:', err);
      setCaseNotFound(true);
    } finally {
      setCaseLoading(false);
    }
  }, [caseId, clearError]);

  useEffect(() => {
    // Set the case ID in context
    setCaseId(caseId);
    
    // Fetch case details only once
    fetchCaseDetails();

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
  }, []);

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

  // Show loading state while fetching case details
  if (caseLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-white">Loading Case Details...</h2>
          <p className="text-gray-400">Case ID: {caseId}</p>
        </div>
      </div>
    );
  }

  // Show case not found error
  if (caseNotFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 mx-auto bg-red-600/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Case Not Found</h2>
            <p className="text-gray-400 mb-1">The case with ID <span className="font-mono text-gray-300">{caseId}</span> could not be found.</p>
            <p className="text-sm text-gray-500">Please check the case ID and try again.</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <ErrorNotification error={error} onClear={clearError} />
      
      {/* Court Header */}
      <div className="bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{caseTitle}</h1>
                <p className="text-xs text-gray-400">Case ID: {caseId} {caseType && `• ${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case`}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-600/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-300">AI Judge Jurix Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-[320px_1fr_320px] h-[calc(100vh-80px)]">
        <div className="border-r border-gray-800/50">
          <SidePanel 
            side="plaintiff" 
            caseId={caseId} 
            onUploaded={setCaseId} 
          />
        </div>
        
        <MainPanel 
          verdict={verdict}
          loading={loading}
          caseId={caseId}
          onRequestVerdict={requestVerdict}
        />
        
        <div className="border-l border-gray-800/50">
          <SidePanel 
            side="defense" 
            caseId={caseId} 
            onUploaded={setCaseId} 
          />
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          <MainPanel 
            verdict={verdict}
            loading={loading}
            caseId={caseId}
            onRequestVerdict={requestVerdict}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <SidePanel 
            side="plaintiff" 
            caseId={caseId} 
            onUploaded={setCaseId} 
          />
          <SidePanel 
            side="defense" 
            caseId={caseId} 
            onUploaded={setCaseId} 
          />
        </div>
      </div>
    </div>
  );
};