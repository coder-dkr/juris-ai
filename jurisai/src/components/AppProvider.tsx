import React, { useReducer } from 'react';
import type { ReactNode } from 'react';
import AppContext from '../context/AppContext';
import type { CaseState, AppAction, AppContextType } from '../context/AppContext';

// Initial state
const initialState: CaseState = {
  caseId: null,
  verdict: null,
  loading: false,
  error: null,
  uploadProgress: 0,
};

// Reducer
const appReducer = (state: CaseState, action: AppAction): CaseState => {
  switch (action.type) {
    case 'SET_CASE_ID':
      return { ...state, caseId: action.payload, error: null };
    case 'SET_VERDICT':
      return { ...state, verdict: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const setCaseId = (caseId: string) => dispatch({ type: 'SET_CASE_ID', payload: caseId });
  const setVerdict = (verdict: string) => dispatch({ type: 'SET_VERDICT', payload: verdict });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string) => dispatch({ type: 'SET_ERROR', payload: error });
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });
  const setUploadProgress = (progress: number) => dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
  const resetState = () => dispatch({ type: 'RESET_STATE' });

  const contextValue: AppContextType = {
    state,
    dispatch,
    setCaseId,
    setVerdict,
    setLoading,
    setError,
    clearError,
    setUploadProgress,
    resetState,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};