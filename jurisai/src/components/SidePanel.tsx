import React from 'react';
import { 
  Shield, 
  Scale, 
  Info,
  ChevronRight,
  Database
} from 'lucide-react';
import { UploadPanel } from './UploadPanel';
import { ArgumentPanel } from './ArgumentPanel';
import cn from '../lib/cn';

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
      title: 'Plaintiff Division',
      description: 'System for active prosecution and evidentiary submission.',
      accent: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    defense: {
      title: 'Defense Division', 
      description: 'System for counter-arguments and legal protection.',
      accent: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    }
  };

  const config = sideConfig[side];

  return (
    <div className="h-full flex flex-col bg-slate-900/40 backdrop-blur-sm overflow-hidden">
      {/* Side Panel Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300",
            side === 'plaintiff' ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-amber-500/10 border-amber-500/30 text-amber-500"
          )}>
            {side === 'plaintiff' ? <Scale className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-none mb-1 uppercase">
              {config.title}
            </h2>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", side === 'plaintiff' ? "bg-cyan-400" : "bg-amber-400")} />
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Status: Connected</span>
            </div>
          </div>
        </div>
        
        <div className={cn("p-3 rounded-xl border text-xs leading-relaxed", config.bg, config.border, "text-slate-400")}>
          <div className="flex gap-2">
            <Info className={cn("w-4 h-4 shrink-0 mt-0.5", config.accent)} />
            <p>{config.description}</p>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="grow overflow-y-auto custom-scrollbar p-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Database className="w-4 h-4 text-slate-500" />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Evidence Registry</h3>
          </div>
          <UploadPanel onUploaded={onUploaded} defaultSide={side} caseId={caseId || ''} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <ChevronRight className="w-4 h-4 text-slate-500" />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Argument Feed</h3>
          </div>
          <ArgumentPanel caseId={caseId} side={side} />
        </section>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
