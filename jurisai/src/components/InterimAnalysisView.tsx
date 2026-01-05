import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Scale,
  Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InterimAnalysisViewProps {
  decision: {
    id: string;
    text: string;
    timestamp: Date;
    type: 'initial' | 'interim' | 'final';
    structured?: {
      plaintiffStrength?: number;
      defenseStrength?: number;
      argumentReview?: {
        stanceChange?: string;
      };
      ruling?: {
        recommendation?: string;
        confidence?: number;
      };
    };
  };
  previousDecision?: {
    structured?: {
      plaintiffStrength?: number;
      defenseStrength?: number;
    };
  } | null;
  index: number;
}

const StrengthMeter: React.FC<{
  label: string;
  value: number;
  previousValue?: number;
  color: string;
}> = ({ label, value, previousValue, color }) => {
  const delta = previousValue ? value - previousValue : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold", color)}>{value}%</span>
          {previousValue && delta !== 0 && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded",
              delta > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            )}>
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(delta)}%
            </div>
          )}
        </div>
      </div>
      <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", color.replace('text-', 'bg-'))}
        />
      </div>
    </div>
  );
};

export const InterimAnalysisView: React.FC<InterimAnalysisViewProps> = ({ 
  decision, 
  previousDecision,
  index 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const plaintiffStrength = decision.structured?.plaintiffStrength || 50;
  const defenseStrength = decision.structured?.defenseStrength || 50;
  const prevPlaintiff = previousDecision?.structured?.plaintiffStrength;
  const prevDefense = previousDecision?.structured?.defenseStrength;
  const recommendation = decision.structured?.ruling?.recommendation || 'continue';
  const confidence = decision.structured?.ruling?.confidence || 75;

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
          "bg-amber-500/10 border-amber-500/30 text-amber-400"
        )}>
          <Activity className="w-5 h-5" />
        </div>
        
        <div className="grow space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-widest",
                "bg-amber-500/10 border-amber-500/20 text-amber-400"
              )}>
                Interim Analysis
              </span>
              <span className="text-[10px] font-mono text-slate-600">
                {new Date(decision.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider",
              recommendation === 'continue' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
              recommendation === 'settle' ? "bg-green-500/10 border-green-500/20 text-green-400" :
              "bg-purple-500/10 border-purple-500/20 text-purple-400"
            )}>
              {recommendation}
            </div>
          </div>
          
          {/* Compact Analysis Card */}
          <div className="glass-card rounded-2xl p-6 border border-amber-500/10 space-y-6">
            
            {/* Strength Comparison */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Position Strength</h4>
              </div>
              
              <div className="grid gap-4">
                <StrengthMeter 
                  label="Plaintiff" 
                  value={plaintiffStrength}
                  previousValue={prevPlaintiff}
                  color="text-cyan-400"
                />
                <StrengthMeter 
                  label="Defense" 
                  value={defenseStrength}
                  previousValue={prevDefense}
                  color="text-amber-400"
                />
              </div>
            </div>

            {/* Stance Change Summary */}
            {decision.structured?.argumentReview?.stanceChange && (
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400">Key Shift</h5>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {decision.structured.argumentReview.stanceChange}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Confidence Meter */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Analysis Confidence</span>
                <span className="text-sm font-bold text-white">{confidence}%</span>
              </div>
              <div className="h-1.5 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-green-400 rounded-full"
                />
              </div>
            </div>

            {/* Expandable Full Text */}
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-300 transition-colors uppercase tracking-wider"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {isExpanded ? 'Hide' : 'Show'} Full Legal Analysis
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 prose-legal prose-invert prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {decision.text}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
