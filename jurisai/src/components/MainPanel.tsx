import React from 'react';
import { VerdictPanel } from './VerdictPanel';
import { LoadingIndicator } from './LoadingIndicator';

interface MainPanelProps {
  verdict: string | null;
  loading: boolean;
  caseId: string | null;
  onRequestVerdict: () => void;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  verdict,
  loading,
  caseId,
  onRequestVerdict
}) => {
  return (
    <div className="bg-gray-950/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start overflow-auto relative min-h-screen border-gray-800/50">
      <LoadingIndicator loading={loading} />
      
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Court Verdict
        </h1>
        <p className="text-sm text-gray-400">
          AI-generated judicial decision
        </p>
      </div>
      
      <VerdictPanel currentVerdict={verdict} loading={loading} />
      
      <div className="mt-6 lg:mt-8 flex flex-col items-center space-y-4 w-full max-w-md">
        <button 
          onClick={onRequestVerdict} 
          disabled={!caseId || loading}
          className="w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-6 lg:px-8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-600/20"
        >
          {loading ? 'Generating...' : 'Generate Verdict'}
        </button>
        
        <div className="w-full bg-gray-900/40 border border-gray-800/50 rounded-xl px-4 py-3 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-medium text-gray-400 mb-1 sm:mb-0">
              Case ID:
            </span>
            <span className="text-sm font-mono text-gray-300 break-all">
              {caseId || 'No case selected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};