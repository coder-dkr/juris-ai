import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { 
  History, 
  Scale, 
  FileText,
  Info,
  Activity
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { InitialVerdictView } from './InitialVerdictView';
import { InterimAnalysisView } from './InterimAnalysisView';
import { FinalJudgmentView } from './FinalJudgmentView';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
              Surrender: {surrenderedBy}
            </span>
          </div>
        );
      case 'ai_closed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">System Closed</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Analysis Finalized</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Active Litigation</span>
          </div>
        );
    }
  };

  const totalArguments = caseArguments.plaintiff.length + caseArguments.defense.length;
  
  return (
    <div className="w-full space-y-12">
      {/* Decisions History (if any) */}
      {decisions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">Judicial Log</h3>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="space-y-4">
            {decisions.map((decision, index) => {
              const previousDecision = index > 0 ? decisions[index - 1] : null;
              
              return (
                <React.Fragment key={decision.id}>
                  {/* Connector Line */}
                  {index !== decisions.length - 1 && (
                    <div className="relative">
                      <div className="absolute left-6 top-12 h-4 w-px bg-gradient-to-b from-slate-700 to-transparent" />
                    </div>
                  )}
                  
                  {decision.type === 'initial' && (
                    <InitialVerdictView decision={decision} index={index} />
                  )}
                  {decision.type === 'interim' && (
                    <InterimAnalysisView 
                      decision={decision} 
                      previousDecision={previousDecision}
                      index={index} 
                    />
                  )}
                  {decision.type === 'final' && (
                    <FinalJudgmentView 
                      decision={decision} 
                      allDecisions={decisions}
                      index={index} 
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Active/New Verdict Analysis */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
              {currentVerdict ? 'Neural Resolution' : 'Analysis Feed'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/50 border border-white/5 rounded text-[10px] font-mono text-slate-500">
               <Info className="w-3 h-3" />
               <span>DATA: {totalArguments} SUBMISSIONS</span>
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
          <div className="relative min-h-[400px] glass-panel rounded-3xl overflow-hidden border-white/10 p-8 flex flex-col">
            {currentVerdict ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose-legal prose-invert"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentVerdict}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <div className="grow flex flex-col items-center justify-center text-center space-y-8 py-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/10 blur-3xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full border border-white/5 bg-slate-900/50 flex items-center justify-center">
                    <Scale className="w-10 h-10 text-slate-700" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white tracking-tight">System Ready for Adjudication</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {decisions.length > 0 
                      ? 'The Neural Judge has processed the latest counter-arguments. Initiate analysis to receive a revised resolution.' 
                      : 'Upload evidentiary documentation and initial arguments from both divisions to begin the judicial simulation.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em]">Neural Core: Standing By</span>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center space-y-6 z-20">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full animate-spin text-cyan-500/20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm font-bold text-white tracking-widest uppercase">Analyzing Precedents</div>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-1 h-1 bg-cyan-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
