import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  History, 
  MessageSquare, 
  ShieldAlert, 
  ChevronRight,
  Zap,
  Lock
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ArgumentPanelProps {
  caseId?: string | null;
  side: string;
}

export const ArgumentPanel: React.FC<ArgumentPanelProps> = ({ caseId, side }) => {
  const [text, setText] = useState('');
  const { state, setLoading, setError, clearError, addArgument, surrenderCase } = useApp();
  const { phase, caseStatus, arguments: caseArguments, decisions } = state;

  const isCaseActive = caseStatus === 'active' && phase === 'arguments';
  const isCaseClosed = phase === 'closed';
  const sideArguments = caseArguments[side as 'plaintiff' | 'defense'] || [];
  const hasInitialArgument = sideArguments.some(arg => arg.type === 'initial');
  const counterArguments = sideArguments.filter(arg => arg.type === 'counter');
  const counterArgumentsRemaining = Math.max(0, 5 - counterArguments.length);
  const canSubmitCounterArgument = counterArgumentsRemaining > 0;

  async function submitArg() {
    if (!caseId) {
      setError('Please select or create a case first');
      return;
    }
    
    if (!text.trim()) {
      setError('Please enter an argument');
      return;
    }

    const argumentType = hasInitialArgument ? 'counter' : 'initial';
    
    if (argumentType === 'counter' && !canSubmitCounterArgument) {
      setError('Counter-argument limit reached (5 maximum per side)');
      return;
    }

    try {
      setLoading(true);
      clearError();
      await apiService.submitArgument(caseId, side, text);
      addArgument(side as 'plaintiff' | 'defense', text, argumentType);
      setText('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit argument');
    } finally {
      setLoading(false);
    }
  }

  async function handleSurrender() {
    if (!caseId) return;
    
    const confirmSurrender = window.confirm(
      `Confirm surrender on behalf of the ${side}? This protocol is irreversible.`
    );
    
    if (confirmSurrender) {
      try {
        setLoading(true);
        clearError();
        await apiService.surrenderCase(caseId, side);
        surrenderCase(side as 'plaintiff' | 'defense');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to surrender case');
      } finally {
        setLoading(false);
      }
    }
  }

  const getButtonConfig = () => {
    if (isCaseClosed) return { text: 'Registry Locked', icon: <Lock className="w-4 h-4" />, color: 'bg-slate-800' };
    if (!hasInitialArgument) return { text: 'Initialize Argument', icon: <Zap className="w-4 h-4" />, color: 'bg-cyan-600' };
    if (!canSubmitCounterArgument) return { text: 'Buffer Full', icon: <ShieldAlert className="w-4 h-4" />, color: 'bg-red-900/40' };
    return { text: `Submit Counter (${counterArgumentsRemaining})`, icon: <Send className="w-4 h-4" />, color: 'bg-cyan-600' };
  };

  const btn = getButtonConfig();

  return (
    <div className="space-y-6">
      {/* History Feed */}
      {sideArguments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <History className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Local Archive</span>
          </div>
          <div className="space-y-3">
            {sideArguments.map((arg, idx) => (
              <motion.div 
                key={arg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 glass-card rounded-2xl space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-widest",
                    arg.type === 'initial' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  )}>
                    {arg.type}
                  </span>
                  <span className="text-[8px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
                    {new Date(arg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all">
                  "{arg.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-cyan-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            rows={5} 
            className="w-full relative p-4 bg-black/40 border border-white/5 rounded-2xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all resize-none font-sans"
            placeholder={isCaseClosed ? "Case record finalized." : "Input legal arguments for judicial processing..."}
            disabled={isCaseClosed || (hasInitialArgument && !canSubmitCounterArgument)}
          />
        </div>

        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={submitArg} 
            disabled={!caseId || !text.trim() || isCaseClosed || (hasInitialArgument && !canSubmitCounterArgument)}
            className={cn(
              "flex-grow py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg",
              btn.color,
              "disabled:opacity-40 disabled:grayscale"
            )}
          >
            {btn.icon}
            {btn.text}
          </motion.button>

          {isCaseActive && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSurrender}
              title="Irreversible Surrender"
              className="px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
            >
              <ShieldAlert className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
