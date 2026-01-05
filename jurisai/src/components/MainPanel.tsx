import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Terminal, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  Cpu
} from 'lucide-react';
import { VerdictPanel } from './VerdictPanel';
import { LoadingIndicator } from './LoadingIndicator';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    <div className="flex-grow flex flex-col relative overflow-hidden bg-slate-950/20 backdrop-blur-sm">
      <LoadingIndicator loading={loading} />
      
      {/* Dynamic Background Pattern for Verdict Area */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="flex-grow overflow-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Analysis Status Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center border-cyan-500/30">
                <Cpu className={cn("w-6 h-6", loading ? "text-cyan-400 animate-spin" : "text-cyan-400")} />
              </div>
              <div>
                <h2 className="text-sm font-mono uppercase tracking-widest text-slate-500">Processing Node</h2>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white tracking-tight">AI JURIX-V4.2</span>
                  <div className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 uppercase">Neural Linked</div>
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Current Confidence</div>
              <div className="text-xl font-bold text-white tracking-tighter">98.4%</div>
            </div>
          </div>

          {/* Verdict Content */}
          <div className="relative">
            <VerdictPanel currentVerdict={verdict} loading={loading} />
          </div>

          {!verdict && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-white/5">
                <Terminal className="w-10 h-10 text-slate-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-300">Awaiting Submissions</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                  System requires arguments from both Plaintiff and Defense to generate a judicial analysis.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Control Bar */}
      <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-grow w-full md:w-auto">
            <div className="group relative">
              <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onRequestVerdict} 
                disabled={!caseId || loading}
                className="w-full relative glass-panel bg-cyan-600 hover:bg-cyan-500 py-4 px-8 rounded-2xl text-white font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(8,145,178,0.2)]"
              >
                {loading ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Processing Analysis...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white" />
                    <span>Generate Judicial Verdict</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 w-full md:w-auto">
             <ShieldCheck className="w-5 h-5 text-green-500" />
             <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Registry Lock</span>
                <span className="text-xs font-mono text-slate-300 uppercase truncate max-w-[120px]">
                  {caseId?.slice(0, 12) || 'UNASSIGNED'}...
                </span>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
      `}</style>
    </div>
  );
};
