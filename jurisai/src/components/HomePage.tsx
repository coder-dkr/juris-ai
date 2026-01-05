import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel, 
  Plus, 
  LogIn, 
  Shield, 
  Zap, 
  Scale, 
  FileText, 
  ChevronRight,
  Activity,
  Award
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HomePageProps {
  onCreateCase: (caseTitle: string, caseType: string) => void;
  onJoinCase: (caseId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCreateCase, onJoinCase }) => {
  const [caseTitle, setCaseTitle] = useState('');
  const [caseType, setCaseType] = useState('civil');
  const [joinCaseId, setJoinCaseId] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim()) return;
    onCreateCase(caseTitle, caseType);
  };

  const handleJoinCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCaseId.trim()) return;
    onJoinCase(joinCaseId);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-6xl z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-4 mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
              <div className="hidden sm:flex w-20 h-20 glass-panel rounded-2xl items-center justify-center border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <Gavel className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-white">
                JURIS<span className="text-cyan-500">AI</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                <span className="text-xs font-mono tracking-widest text-cyan-500/80 uppercase">Systems Online // Neural Judge Jurix</span>
              </div>
            </div>
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-light text-slate-400 max-w-3xl mx-auto leading-relaxed tracking-tight">
            Next-generation <span className="text-white font-medium">autonomous legal simulation</span> for the modern practitioner.
          </h2>
        </div>

        {/* Main Interface */}
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Feature Grid */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <FeatureItem 
              icon={<Shield className="w-5 h-5" />}
              title="Sovereign Analysis"
              description="Deep-neural processing of constitutional and civil frameworks."
              delay={0.4}
            />
            <FeatureItem 
              icon={<Activity className="w-5 h-5" />}
              title="Real-time Litigation"
              description="High-fidelity simulation of court proceedings and cross-examination."
              delay={0.5}
            />
            <FeatureItem 
              icon={<Award className="w-5 h-5" />}
              title="Judicial Integrity"
              description="Unbiased, data-driven verdicts based on established precedents."
              delay={0.6}
            />
          </div>

          {/* Action Card */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl overflow-hidden border-white/5 shadow-2xl flex flex-col h-full">
              {/* Tabs */}
              <div className="flex p-2 bg-white/5 border-b border-white/5">
                <TabButton 
                  active={activeTab === 'create'} 
                  onClick={() => setActiveTab('create')}
                  icon={<Plus className="w-4 h-4" />}
                  label="Initialize Case"
                />
                <TabButton 
                  active={activeTab === 'join'} 
                  onClick={() => setActiveTab('join')}
                  icon={<LogIn className="w-4 h-4" />}
                  label="Access Registry"
                />
              </div>

              <div className="p-8 flex-grow">
                <AnimatePresence mode="wait">
                  {activeTab === 'create' ? (
                    <motion.form
                      key="create"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleCreateCase}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">Case Designation</label>
                        <div className="relative group">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                          <input
                            type="text"
                            value={caseTitle}
                            onChange={(e) => setCaseTitle(e.target.value)}
                            placeholder="CASE TITLE (e.g. ALPHA VS OMEGA)"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">Jurisdiction Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['civil', 'criminal', 'corporate', 'constitutional', 'family', 'property'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setCaseType(type)}
                              className={cn(
                                "py-3 px-4 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all",
                                caseType === type 
                                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                                  : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-all" />
                        <Zap className="w-5 h-5 text-white fill-white" />
                        <span className="tracking-widest uppercase text-sm">Initiate Proceedings</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="join"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleJoinCase}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">System Case ID</label>
                        <div className="relative group">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                          <input
                            type="text"
                            value={joinCaseId}
                            onChange={(e) => setJoinCaseId(e.target.value)}
                            placeholder="INPUT CASE ID (e.g. ID-101...)"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                            <Scale className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-cyan-100 mb-1">Authenticated Access</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Access restricted to authorized legal representatives. System will verify case credentials before granting entry to the virtual courtroom.
                            </p>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-3 group"
                      >
                        <LogIn className="w-5 h-5 text-cyan-400" />
                        <span className="tracking-widest uppercase text-sm">Secure Entry</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 text-center pt-8 border-t border-white/5"
        >
          <div className="flex items-center justify-center gap-8 mb-4">
             <div className="text-slate-600 text-[10px] font-mono tracking-widest uppercase">Encryption: AES-256</div>
             <div className="text-slate-600 text-[10px] font-mono tracking-widest uppercase">Protocol: Jurix-V4</div>
             <div className="text-slate-600 text-[10px] font-mono tracking-widest uppercase">Latency: 14ms</div>
          </div>
          <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">
            © 2026 JURISAI // DEPARTMENT OF ALGORITHMIC JUSTICE
          </p>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
  >
    <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/30 transition-all shadow-lg">
      <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
        {icon}
      </div>
    </div>
    <div>
      <h4 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{description}</p>
    </div>
  </motion.div>
);

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-widest transition-all relative overflow-hidden",
      active 
        ? "text-cyan-400 bg-cyan-500/10" 
        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
    )}
  >
    {active && (
      <motion.div 
        layoutId="tab-active"
        className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
      />
    )}
    <div className={cn("transition-transform duration-300", active && "scale-110")}>
      {icon}
    </div>
    {label}
  </button>
);
