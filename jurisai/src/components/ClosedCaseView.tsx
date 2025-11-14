import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CaseData {
  _id: string;
  title: string;
  caseType?: string;
  documents: Array<{
    filename: string;
    side: string;
    content: string;
  }>;
  arguments: Array<{
    _id: string;
    side: string;
    text: string;
    createdAt: string;
  }>;
  verdicts: Array<{
    _id: string;
    text: string;
    createdAt: string;
    raw?: {
      surrenderedBy?: string;
      type?: string;
    };
  }>;
  argumentCount: number;
  verdictCount: number;
}

interface ClosedCaseViewProps {
  caseId: string;
  caseData: CaseData;
  onBackToHome: () => void;
}

export const ClosedCaseView: React.FC<ClosedCaseViewProps> = ({ 
  caseId, 
  caseData, 
  onBackToHome 
}) => {
  const finalVerdict = caseData.verdicts[caseData.verdicts.length - 1];
  const isSurrendered = finalVerdict?.raw?.type === 'surrender';
  const surrenderedBy = finalVerdict?.raw?.surrenderedBy;

  const getCaseStatus = () => {
    if (isSurrendered) {
      return {
        status: 'Surrendered',
        color: 'red',
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      };
    }
    return {
      status: 'Completed',
      color: 'green',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
  };

  const caseStatus = getCaseStatus();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <div className="h-6 w-px bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                caseStatus.color === 'red' 
                  ? 'bg-linear-to-r from-red-600 to-red-700' 
                  : 'bg-linear-to-r from-green-600 to-green-700'
              }`}>
                {caseStatus.icon}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Case {caseStatus.status}</h1>
                <p className="text-xs text-gray-400">Case ID: {caseId}</p>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 border rounded-lg ${
            caseStatus.color === 'red'
              ? 'bg-red-600/20 border-red-600/30'
              : 'bg-green-600/20 border-green-600/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              caseStatus.color === 'red' ? 'bg-red-400' : 'bg-green-400'
            }`}></div>
            <span className={`text-sm font-medium ${
              caseStatus.color === 'red' ? 'text-red-300' : 'text-green-300'
            }`}>
              {caseStatus.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Case Summary */}
        <div className="bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m-2 0H3" />
              </svg>
              Case Summary
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{caseData.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Type:</span>
                    <span className="text-gray-300 capitalize">{caseData.caseType || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Documents Filed:</span>
                    <span className="text-gray-300">{caseData.documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Arguments Presented:</span>
                    <span className="text-gray-300">{caseData.argumentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Decisions:</span>
                    <span className="text-gray-300">{caseData.verdictCount}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Case Timeline</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-400">Case Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-400">Arguments Submitted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      caseStatus.color === 'red' ? 'bg-red-400' : 'bg-green-400'
                    }`}></div>
                    <span className="text-gray-400">
                      Case {isSurrendered ? `Surrendered by ${surrenderedBy}` : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Verdict */}
        <div className="bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Final Verdict
              <div className={`ml-auto text-xs px-2 py-1 rounded-full ${
                isSurrendered
                  ? 'bg-red-600/20 text-red-300'
                  : 'bg-green-600/20 text-green-300'
              }`}>
                {isSurrendered ? 'Surrendered' : 'Completed'}
              </div>
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-black/40 border border-gray-700/30 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">AI Judge Jurix</h3>
                  <p className="text-sm text-gray-400">Final Decision</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(finalVerdict?.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {finalVerdict?.text || 'No final verdict available.'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Case History */}
        {caseData.verdicts.length > 1 && (
          <div className="bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Decision History
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {caseData.verdicts.slice(0, -1).reverse().map((verdict, index) => (
                  <div key={verdict._id} className="border-l-4 border-purple-600/50 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-purple-300">
                        Decision #{caseData.verdicts.length - index - 1}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(verdict.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {verdict.text.length > 300 
                            ? verdict.text.substring(0, 300) + '...'
                            : verdict.text
                          }
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};