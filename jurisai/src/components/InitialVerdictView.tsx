import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import cn from '../lib/cn';


interface InitialVerdictViewProps {
  decision: {
    id: string;
    text: string;
    timestamp: Date;
    type: 'initial' | 'interim' | 'final';
    structured?: any;
  };
  index: number;
}

export const InitialVerdictView: React.FC<InitialVerdictViewProps> = ({ decision, index }) => {
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
          "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
        )}>
          <Scale className="w-5 h-5" />
        </div>
        
        <div className="grow space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-widest",
                "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
              )}>
                Initial Verdict
              </span>
              <span className="text-[10px] font-mono text-slate-600">
                {new Date(decision.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover:bg-white/[0.07] transition-colors border border-cyan-500/10">
            <div className="prose-legal prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {decision.text}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
