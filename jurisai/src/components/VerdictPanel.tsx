import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '../hooks/useApp';

interface VerdictPanelProps {
  currentVerdict?: string | null;
  loading?: boolean;
}

export const VerdictPanel: React.FC<VerdictPanelProps> = ({ 
  currentVerdict, 
  loading = false 
}) => {
  const { state } = useApp();
  const { decisions, caseStatus, surrenderedBy, arguments: caseArguments } = state;
  
  const getStatusBadge = () => {
    switch (caseStatus) {
      case 'surrendered':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-lg">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-300">
              Case Surrendered by {surrenderedBy}
            </span>
          </div>
        );
      case 'ai_closed':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-600/30 rounded-lg">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-sm font-medium text-purple-300">AI Closed Case</span>
          </div>
        );
      case 'completed':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-600/30 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-green-300">Case Completed</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-300">Case Active</span>
          </div>
        );
    }
  };

  const totalArguments = caseArguments.plaintiff.length + caseArguments.defense.length;
  
  return (
    <div className="w-full max-w-4xl lg:max-w-5xl">
      <div className="text-center mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          AI Legal Analysis
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mb-4">
          Dynamic case evaluation with iterative decision-making
        </p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {getStatusBadge()}
          <div className="text-sm text-gray-400">
            {decisions.length} Decision{decisions.length !== 1 ? 's' : ''} • {totalArguments} Argument{totalArguments !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Decision Timeline */}
        {decisions.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gray-800/50 border-b border-gray-700/50 px-4 sm:px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Decision Timeline
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {decisions.map((decision, index) => (
                  <div key={decision.id} className="relative">
                    {index !== decisions.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-700/50"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        decision.type === 'final' 
                          ? 'bg-green-600' 
                          : decision.type === 'interim' 
                          ? 'bg-amber-600' 
                          : 'bg-blue-600'
                      }`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            decision.type === 'final' 
                              ? 'bg-green-600/20 text-green-300' 
                              : decision.type === 'interim' 
                              ? 'bg-amber-600/20 text-amber-300' 
                              : 'bg-blue-600/20 text-blue-300'
                          }`}>
                            {decision.type === 'final' ? 'Final Decision' : decision.type === 'interim' ? 'Interim Decision' : 'Initial Decision'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {decision.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-black/40 border border-gray-700/30 rounded-lg p-4">
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {decision.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Current Verdict Display */}
        <div className="bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gray-800/50 border-b border-gray-700/50 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Live Verdict Analysis
              </h2>
              {loading && (
                <div className="flex items-center space-x-3 text-blue-400">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                  </div>
                  <span className="text-sm font-medium">Analyzing case...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="bg-black/40 border border-gray-700/30 rounded-lg min-h-[250px] sm:min-h-[300px] overflow-auto">
              {currentVerdict ? (
                <div className="p-6">
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentVerdict}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm sm:text-base font-medium text-gray-300 mb-2">
                      {decisions.length > 0 ? 'Awaiting new arguments' : 'Awaiting case documents and arguments'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {decisions.length > 0 ? 'Submit counter-arguments to continue the case' : 'Upload evidence from both parties to begin legal analysis'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};