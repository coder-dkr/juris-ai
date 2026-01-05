import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FinalJudgmentViewProps {
  decision: {
    id: string;
    text: string;
    timestamp: Date;
    type: 'initial' | 'interim' | 'final';
    structured?: any;
  };
  allDecisions: Array<{
    id: string;
    timestamp: Date;
    type: string;
  }>;
  index: number;
}

export const FinalJudgmentView: React.FC<FinalJudgmentViewProps> = ({ 
  decision, 
  allDecisions,
  index 
}) => {
  const caseTimeline = allDecisions.map((d, i) => ({
    step: i + 1,
    type: d.type,
    time: new Date(d.timestamp).toLocaleString()
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <div className="flex gap-6">
        <div className={cn(
          "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border transition-all duration-500",
          "bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
        )}>
          <CheckCircle2 className="w-5 h-5" />
        </div>
        
        <div className="grow space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-widest",
                "bg-green-500/10 border-green-500/20 text-green-400"
              )}>
                Final Judgment
              </span>
              <span className="text-[10px] font-mono text-slate-600">
                {new Date(decision.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">Binding Order</span>
            </div>
          </div>

          {/* Case Timeline */}
          {caseTimeline.length > 1 && (
            <div className="glass-card rounded-xl p-4 border border-green-500/10 bg-gradient-to-br from-green-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-green-400" />
                <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400">Case Evolution</h5>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {caseTimeline.map((item, i) => (
                  <React.Fragment key={i}>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-mono whitespace-nowrap",
                      item.type === 'final' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                      item.type === 'interim' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    )}>
                      <span className="font-bold">{item.step}.</span>
                      <span className="uppercase tracking-wider">{item.type}</span>
                    </div>
                    {i < caseTimeline.length - 1 && (
                      <div className="w-4 h-px bg-slate-700" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
          
          {/* Final Judgment Content */}
          <div className="glass-card rounded-2xl p-6 border border-green-500/10 hover:bg-white/[0.07] transition-colors">
            <div className="prose-legal prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {decision.text}
              </ReactMarkdown>
            </div>
          </div>

          {/* Finality Notice */}
          <div className="flex items-center gap-3 px-4 py-3 bg-green-500/5 border border-green-500/10 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Case Concluded</p>
              <p className="text-[10px] text-slate-500 font-mono">
                This constitutes the final and binding judicial determination of the mock trial proceedings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
