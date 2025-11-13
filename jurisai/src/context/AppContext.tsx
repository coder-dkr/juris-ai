import React, { createContext } from 'react';

// Types
export interface CaseState {
  caseId: string | null;
  verdict: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  phase: 'initial' | 'arguments' | 'closed';
  caseStatus: 'active' | 'surrendered' | 'ai_closed' | 'completed';
  surrenderedBy: 'plaintiff' | 'defense' | null;
  decisions: Array<{
    id: string;
    text: string;
    timestamp: Date;
    type: 'initial' | 'interim' | 'final';
  }>;
  arguments: {
    plaintiff: Array<{
      id: string;
      text: string;
      timestamp: Date;
      type: 'initial' | 'counter';
    }>;
    defense: Array<{
      id: string;
      text: string;
      timestamp: Date;
      type: 'initial' | 'counter';
    }>;
  };
}

type SetCaseIdAction = { type: 'SET_CASE_ID'; payload: string };
type SetVerdictAction = { type: 'SET_VERDICT'; payload: string };
type SetLoadingAction = { type: 'SET_LOADING'; payload: boolean };
type SetErrorAction = { type: 'SET_ERROR'; payload: string };
type ClearErrorAction = { type: 'CLEAR_ERROR' };
type SetUploadProgressAction = { type: 'SET_UPLOAD_PROGRESS'; payload: number };
type ResetStateAction = { type: 'RESET_STATE' };
type SetPhaseAction = { type: 'SET_PHASE'; payload: 'initial' | 'arguments' | 'closed' };
type AddDecisionAction = { type: 'ADD_DECISION'; payload: { text: string; type: 'initial' | 'interim' | 'final' } };
type AddArgumentAction = { type: 'ADD_ARGUMENT'; payload: { side: 'plaintiff' | 'defense'; text: string; type: 'initial' | 'counter' } };
type SurrenderCaseAction = { type: 'SURRENDER_CASE'; payload: 'plaintiff' | 'defense' };
type CloseCaseAction = { type: 'CLOSE_CASE'; payload: { reason: 'ai_closed' | 'completed' } };

export type AppAction = 
  | SetCaseIdAction
  | SetVerdictAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | SetUploadProgressAction
  | ResetStateAction
  | SetPhaseAction
  | AddDecisionAction
  | AddArgumentAction
  | SurrenderCaseAction
  | CloseCaseAction;

export interface AppContextType {
  state: CaseState;
  dispatch: React.Dispatch<AppAction>;
  // Action creators
  setCaseId: (caseId: string) => void;
  setVerdict: (verdict: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setUploadProgress: (progress: number) => void;
  resetState: () => void;
  setPhase: (phase: 'initial' | 'arguments' | 'closed') => void;
  addDecision: (text: string, type: 'initial' | 'interim' | 'final') => void;
  addArgument: (side: 'plaintiff' | 'defense', text: string, type: 'initial' | 'counter') => void;
  surrenderCase: (side: 'plaintiff' | 'defense') => void;
  closeCase: (reason: 'ai_closed' | 'completed') => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

export default AppContext;