import React from 'react';
import { UploadPanel } from './UploadPanel';
import { ArgumentPanel } from './ArgumentPanel';

interface SidePanelProps {
  side: 'plaintiff' | 'defense';
  caseId?: string | null;
  onUploaded: (caseId: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  side, 
  caseId, 
  onUploaded 
}) => {
  const sideConfig = {
    plaintiff: {
      title: 'Plaintiff Side',
      description: 'Upload documents and present your case'
    },
    defense: {
      title: 'Defense Side', 
      description: 'Upload documents and present your defense'
    }
  };

  const config = sideConfig[side];

  return (
    <div className="bg-gray-950/50 backdrop-blur-sm p-4 lg:p-6 overflow-auto border-gray-800/50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            side === 'plaintiff' 
              ? 'bg-linear-to-r from-emerald-600 to-emerald-700' 
              : 'bg-linear-to-r from-amber-600 to-amber-700'
          } shadow-lg`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {config.title}
            </h2>
          </div>
        </div>
        <p className="text-sm text-gray-400 ml-13">
          {config.description}
        </p>
      </div>
      
      <UploadPanel onUploaded={onUploaded} defaultSide={side} caseId={caseId || ''} />
      <ArgumentPanel caseId={caseId} side={side} />
    </div>
  );
};