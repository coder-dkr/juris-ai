import React, { createContext } from 'react';

// Types
export interface CaseState {
  caseId: string | null;
  verdict: string | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

type SetCaseIdAction = { type: 'SET_CASE_ID'; payload: string };
type SetVerdictAction = { type: 'SET_VERDICT'; payload: string };
type SetLoadingAction = { type: 'SET_LOADING'; payload: boolean };
type SetErrorAction = { type: 'SET_ERROR'; payload: string };
type ClearErrorAction = { type: 'CLEAR_ERROR' };
type SetUploadProgressAction = { type: 'SET_UPLOAD_PROGRESS'; payload: number };
type ResetStateAction = { type: 'RESET_STATE' };

export type AppAction = 
  | SetCaseIdAction
  | SetVerdictAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | SetUploadProgressAction
  | ResetStateAction;

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
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

export default AppContext;