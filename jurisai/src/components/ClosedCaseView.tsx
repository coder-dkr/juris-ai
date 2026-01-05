import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ShieldAlert, 
  FileText, 
  Activity,
  Layers,
  Award,
  Terminal,
  History
} from 'lucide-react';
import { InitialVerdictView } from './InitialVerdictView';
import { InterimAnalysisView } from './InterimAnalysisView';
import { FinalJudgmentView } from './FinalJudgmentView';
import cn from '../lib/cn';

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
    verdictType?: 'initial' | 'interim' | 'final';
    structured?: {
      summary?: string;
      plaintiffStrength?: number;
      defenseStrength?: number;
      keyPoints?: string[];
      argumentReview?: {
        newPoints?: string[];
        stanceChange?: string;
        overruledPoints?: string[];
      };
      ruling?: {
        decision?: string;
        confidence?: number;
        recommendation?: 'continue' | 'settle' | 'final';
      };
    };
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
  
  // Transform verdicts into decision format for our components
  const decisions = caseData.verdicts.map((verdict, index) => ({
    id: verdict._id,
    text: verdict.text,
    timestamp: new Date(verdict.createdAt),
    type: (verdict.verdictType || (index === 0 ? 'initial' : index === caseData.verdicts.length - 1 ? 'final' : 'interim')) as 'initial' | 'interim' | 'final',
    structured: verdict.structured
  }));

  return (
    <div className="min-h-screen bg-legal-obsidian text-slate-200">
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToHome}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Case Archive
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Registry ID: {caseId}</span>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest",
            isSurrendered ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"
          )}>
            <div className={cn("w-2 h-2 rounded-full", isSurrendered ? "bg-red-500 animate-pulse" : "bg-green-500")} />
            {isSurrendered ? 'Case Surrendered' : 'Case Resolved'}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 space-y-12 relative z-10">
        
        {/* Case Dossier */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl overflow-hidden border-white/5"
        >
          <div className="bg-white/5 px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center border-white/10">
                  <Award className="w-6 h-6 text-cyan-400" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{caseData.title}</h2>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{caseData.caseType || 'General Jurisdiction'}</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Archive Entry</span>
               <span className="text-sm font-bold text-slate-300">{new Date(caseData.verdicts[0]?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="p-8 grid md:grid-cols-3 gap-8">
            <StatsCard label="Arguments" value={caseData.argumentCount} icon={<Activity className="w-4 h-4 text-cyan-400" />} />
            <StatsCard label="Documents" value={caseData.documents.length} icon={<Layers className="w-4 h-4 text-amber-500" />} />
            <StatsCard label="Analyses" value={caseData.verdictCount} icon={<Terminal className="w-4 h-4 text-slate-400" />} />
          </div>
        </motion.div>

        {/* Resolution History */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
               <History className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
              {decisions.length > 1 ? 'Complete Judicial Log' : 'Neural Resolution'}
            </h3>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {isSurrendered && (
              <div className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <div>
                  <h4 className="text-sm font-bold text-red-200 uppercase tracking-widest">Surrender Protocol Initiated</h4>
                  <p className="text-xs text-red-400/80">Proceedings terminated by the {surrenderedBy} division.</p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {decisions.map((decision, index) => {
                const previousDecision = index > 0 ? decisions[index - 1] : null;
                
                return (
                  <React.Fragment key={decision.id}>
                    {/* Connector Line */}
                    {index !== decisions.length - 1 && (
                      <div className="relative">
                        <div className="absolute left-6 top-12 h-6 w-px bg-linear-to-b from-slate-700 to-transparent" />
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
          </motion.div>
        </div>

        {/* Return Button */}
        <div className="pt-12 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToHome}
            className="px-12 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Return to Terminal
          </motion.button>
        </div>
      </main>

      <footer className="mt-20 p-8 border-t border-white/5 text-center">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">© 2026 JURISAI // DEPARTMENT OF ALGORITHMIC JUSTICE</p>
      </footer>
    </div>
  );
};

const StatsCard = ({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) => (
  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 flex items-center gap-6">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-bold text-white tracking-tighter">{value}</div>
    </div>
  </div>
);
