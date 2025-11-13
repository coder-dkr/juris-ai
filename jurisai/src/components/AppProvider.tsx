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
  phase: 'initial',
  caseStatus: 'active',
  surrenderedBy: null,
  decisions: [],
  arguments: {
    plaintiff: [],
    defense: []
  }
};

// Reducer
const appReducer = (state: CaseState, action: AppAction): CaseState => {
  switch (action.type) {
    case 'SET_CASE_ID':
      return { ...state, caseId: action.payload, error: null, phase: 'arguments' };
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
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'ADD_DECISION':
      return { 
        ...state, 
        decisions: [...state.decisions, {
          id: Date.now().toString(),
          text: action.payload.text,
          timestamp: new Date(),
          type: action.payload.type
        }],
        loading: false, 
        error: null 
      };
    case 'ADD_ARGUMENT':
      return { 
        ...state, 
        arguments: {
          ...state.arguments,
          [action.payload.side]: [...state.arguments[action.payload.side], {
            id: Date.now().toString(),
            text: action.payload.text,
            timestamp: new Date(),
            type: action.payload.type
          }]
        }
      };
    case 'SURRENDER_CASE':
      return { 
        ...state, 
        caseStatus: 'surrendered',
        surrenderedBy: action.payload,
        phase: 'closed'
      };
    case 'CLOSE_CASE':
      return { 
        ...state, 
        caseStatus: action.payload.reason,
        phase: 'closed'
      };
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
  const setPhase = (phase: 'initial' | 'arguments' | 'closed') => dispatch({ type: 'SET_PHASE', payload: phase });
  const addDecision = (text: string, type: 'initial' | 'interim' | 'final') => dispatch({ type: 'ADD_DECISION', payload: { text, type } });
  const addArgument = (side: 'plaintiff' | 'defense', text: string, type: 'initial' | 'counter') => dispatch({ type: 'ADD_ARGUMENT', payload: { side, text, type } });
  const surrenderCase = (side: 'plaintiff' | 'defense') => dispatch({ type: 'SURRENDER_CASE', payload: side });
  const closeCase = (reason: 'ai_closed' | 'completed') => dispatch({ type: 'CLOSE_CASE', payload: { reason } });

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
    setPhase,
    addDecision,
    addArgument,
    surrenderCase,
    closeCase,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};