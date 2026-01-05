import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Gavel,
  Shield,
  Activity,
  ChevronLeft,
  Terminal,
  Scale,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { useApp } from "../hooks/useApp";
import { apiService } from "../services/api";
import { SidePanel, MainPanel, ErrorNotification } from ".";



interface CourtRoomProps {
  caseId: string;
}

export const CourtRoom: React.FC<CourtRoomProps> = ({ caseId }) => {
  const { state, setCaseId, setVerdict, setLoading, setError, clearError, addDecision } =
    useApp();
  const { verdict, loading, error } = state;
  const [caseTitle, setCaseTitle] = useState<string>("");
  const [caseType, setCaseType] = useState<string>("");
  const [caseLoading, setCaseLoading] = useState<boolean>(true);
  const [caseNotFound, setCaseNotFound] = useState<boolean>(false);

  const fetchCaseDetails = useCallback(async () => {
    if (!caseId) return;

    try {
      setCaseLoading(true);
      setCaseNotFound(false);
      clearError();

      const caseData = await apiService.getCase(caseId);
      if (caseData) {
        setCaseTitle(caseData.title || "Untitled Case");
        setCaseType(caseData.caseType || "");
      } else {
        setCaseNotFound(true);
      }
    } catch (err) {
      console.error("Failed to fetch case details:", err);
      setCaseNotFound(true);
    } finally {
      setCaseLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    setCaseId(caseId);
    fetchCaseDetails();

    // Load case history with verdicts
    const loadCaseHistory = async () => {
      if (!caseId) return;
      
      try {
        const caseData = await apiService.getCase(caseId);
        
        // Hydrate decisions from verdicts
        if (caseData.verdicts && caseData.verdicts.length > 0) {
          caseData.verdicts.forEach((verdict: any) => {
            const type = verdict.verdictType || 'initial';
            addDecision(verdict.text, type as 'initial' | 'interim' | 'final', verdict.structured);
          });
        }
      } catch (err) {
        console.error('Failed to load case history:', err);
      }
    };
    
    loadCaseHistory();

    const serverUrl =
      import.meta.env.VITE_SERVER_URL || "http://localhost:5100/api";
    const eventUrl = `${serverUrl.replace("/api", "")}/api/events`;
    console.log(eventUrl);

    const es = new EventSource(eventUrl);
    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d.type === 'verdict') {
          setVerdict(d.text);
          // Add to decisions history
          const verdictType = d.verdictType || 'initial';
          addDecision(d.text, verdictType, d.structured);
        } else if (d.type === 'surrender') {
          // Handle surrender as final verdict
          const verdictType = d.verdictType || 'final';
          if (d.text) {
            setVerdict(d.text);
            addDecision(d.text, verdictType, d.structured);
          }
        }
      } catch (err) {
        console.warn('Invalid SSE data', err);
      }
    };

    es.onerror = (err) => {
      console.error('SSE connection error:', err);
    };

    return () => es.close();
  }, [caseId]);

  async function requestVerdict() {
    if (!caseId) {
      setError("No case selected");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const result = await apiService.requestVerdict(caseId);
      setVerdict(result.text || JSON.stringify(result));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate verdict"
      );
    } finally {
      setLoading(false);
    }
  }

  if (caseLoading) {
    return (
      <div className="min-h-screen bg-legal-obsidian flex items-center justify-center">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 mx-auto glass-panel rounded-2xl flex items-center justify-center border-cyan-500/30">
              <Activity className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
                Initializing Registry
              </h2>
              <p className="text-cyan-500/60 font-mono text-xs">
                Awaiting case link: {caseId}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (caseNotFound) {
    return (
      <div className="min-h-screen bg-legal-obsidian flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel max-w-md w-full p-10 rounded-3xl text-center border-red-500/20"
        >
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center mb-8 border border-red-500/20">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Access Denied
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Case record{" "}
            <span className="font-mono text-red-400 bg-red-500/5 px-2 py-1 rounded">
              {caseId}
            </span>{" "}
            not found in the central registry.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center justify-center gap-3"
          >
            <ChevronLeft className="w-5 h-5" />
            Return to Terminal
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-legal-obsidian text-slate-200">
      <ErrorNotification error={error} onClear={clearError} />

      {/* Courtroom Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <Gavel className="w-5 h-5 text-cyan-400" />
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                  {caseTitle}
                </h1>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-500/80 uppercase">
                  Registry: {caseId.slice(0, 12)}...
                </span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase">
                  Type: {caseType || "GENERAL"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  System Status
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest">
                    Jurix Core Active
                  </span>
                </div>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center border-cyan-500/30">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-[1800px] mx-auto p-6">
        <div className="grid lg:grid-cols-[380px_1fr_380px] gap-6 items-stretch min-h-[calc(100vh-140px)]">
          {/* Plaintiff Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4 ml-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                Plaintiff Division
              </span>
            </div>
            <div className="grow glass-panel rounded-3xl overflow-hidden border-white/5">
              <SidePanel
                side="plaintiff"
                caseId={caseId}
                onUploaded={setCaseId}
              />
            </div>
          </motion.div>

          {/* Central Verdict Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                  Judicial Analysis Terminal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-mono text-slate-500">
                  REAL-TIME FEED
                </span>
              </div>
            </div>
            <div className="grow glass-panel rounded-3xl overflow-hidden border-white/5 flex flex-col">
              <MainPanel
                verdict={verdict}
                loading={loading}
                caseId={caseId}
                onRequestVerdict={requestVerdict}
              />
            </div>
          </motion.div>

          {/* Defense Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4 ml-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                Defense Division
              </span>
            </div>
            <div className="grow glass-panel rounded-3xl overflow-hidden border-white/5">
              <SidePanel
                side="defense"
                caseId={caseId}
                onUploaded={setCaseId}
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Interface */}
      <footer className="px-6 py-4 border-t border-white/5 bg-black/20">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-[10px] font-mono text-slate-600 tracking-[0.2em] uppercase">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Network: Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              <span>Protocol: JURIX_v4.2.1</span>
            </div>
          </div>
          <div>© 2026 DEPARTMENT OF ALGORITHMIC JUSTICE</div>
        </div>
      </footer>
    </div>
  );
};
