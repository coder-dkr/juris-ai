import { useEffect } from 'react';
import { useApp } from './hooks/useApp';
import { apiService } from './services/api';
import { SidePanel, MainPanel, ErrorNotification } from './components';

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
    <div className="min-h-screen bg-gray-950">
      <ErrorNotification error={error} onClear={clearError} />
      
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-[320px_1fr_320px] h-screen">
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
        <div className="sticky top-0 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-4 z-10">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">
              JurisAI
            </h1>
          </div>
        </div>
        
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
}

export default App;
