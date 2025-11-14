import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiService } from '../services/api';

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
  const latestDecision = decisions[decisions.length - 1];

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
      
      // Call API to submit argument
      await apiService.submitArgument(caseId, side, text);
      
      // Add to local state
      addArgument(side as 'plaintiff' | 'defense', text, argumentType);
      
      setText(''); // Clear the text area after successful submission
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit argument');
    } finally {
      setLoading(false);
    }
  }

  async function handleSurrender() {
    if (!caseId) return;
    
    const confirmSurrender = window.confirm(
      `Are you sure you want to surrender this case on behalf of the ${side}? This action cannot be undone.`
    );
    
    if (confirmSurrender) {
      try {
        setLoading(true);
        clearError();
        
        // Call API to surrender case
        await apiService.surrenderCase(caseId, side);
        
        // Update local state
        surrenderCase(side as 'plaintiff' | 'defense');
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to surrender case');
      } finally {
        setLoading(false);
      }
    }
  }

  const getTitle = () => {
    if (isCaseClosed) {
      if (caseStatus === 'surrendered') {
        return `${side} Arguments (Surrendered)`;
      }
      return `${side} Arguments (Case Closed)`;
    }
    return `${side} Arguments`;
  };

  const getPlaceholder = () => {
    if (!hasInitialArgument) {
      return `Present your initial ${side} arguments here...`;
    }
    if (!canSubmitCounterArgument) {
      return 'Counter-argument limit reached (5 maximum)';
    }
    return `Present counter-arguments or additional evidence... (${counterArgumentsRemaining} remaining)`;
  };

  const getButtonText = () => {
    if (isCaseClosed) return 'Case Closed';
    if (!hasInitialArgument) return 'Submit Initial Argument';
    if (!canSubmitCounterArgument) return 'Argument Limit Reached';
    return `Submit Counter-Argument (${counterArgumentsRemaining} left)`;
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-xl mb-4 hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isCaseClosed
              ? 'bg-linear-to-r from-gray-600 to-gray-700'
              : hasInitialArgument
              ? 'bg-linear-to-r from-orange-600 to-orange-700' 
              : 'bg-linear-to-r from-blue-600 to-blue-700'
          }`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCaseClosed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : hasInitialArgument ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              )}
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-100 capitalize">
            {getTitle()}
          </h3>
        </div>
        
        {isCaseActive && (
          <button
            onClick={handleSurrender}
            className="text-xs px-3 py-1 bg-red-600/20 text-red-300 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Surrender
          </button>
        )}
      </div>

      {/* Show latest AI decision if available */}
      {latestDecision && (
        <div className="mb-4 p-4 bg-gray-800/40 border border-gray-700/30 rounded-lg">
          <h4 className="text-sm font-medium text-amber-300 mb-2">
            Latest AI {latestDecision.type === 'final' ? 'Final' : 'Interim'} Decision:
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">{latestDecision.text}</p>
          <div className="text-xs text-gray-500 mt-2">
            {latestDecision.timestamp.toLocaleString()}
          </div>
        </div>
      )}

      {/* Show counter-argument limit status */}
      {hasInitialArgument && (
        <div className="mb-4 p-3 bg-gray-800/30 border border-gray-700/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Counter-Arguments</span>
            <div className="flex items-center gap-2">
              <div className={`text-xs px-2 py-1 rounded-full ${
                counterArgumentsRemaining > 2 
                  ? 'bg-green-600/20 text-green-300' 
                  : counterArgumentsRemaining > 0 
                  ? 'bg-amber-600/20 text-amber-300'
                  : 'bg-red-600/20 text-red-300'
              }`}>
                {counterArguments.length}/5 Used
              </div>
              <span className="text-xs text-gray-500">
                {counterArgumentsRemaining} remaining
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Show argument history */}
      {sideArguments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Argument History:</h4>
          <div className="space-y-2">
            {sideArguments.map((arg) => (
              <div key={arg.id} className="p-3 bg-gray-800/30 border border-gray-700/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    arg.type === 'initial' 
                      ? 'bg-blue-600/20 text-blue-300' 
                      : 'bg-orange-600/20 text-orange-300'
                  }`}>
                    {arg.type === 'initial' ? 'Initial' : 'Counter'}
                  </span>
                  <span className="text-xs text-gray-500">{arg.timestamp.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{arg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            {hasInitialArgument ? 'Submit counter-arguments' : 'Present your initial argument'}
          </label>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            rows={6} 
            className="w-full px-4 py-4 bg-gray-800/70 border border-gray-600/50 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
            placeholder={getPlaceholder()}
            disabled={isCaseClosed || (hasInitialArgument && !canSubmitCounterArgument)}
          />
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {hasInitialArgument ? 'Challenge previous decisions or provide new evidence' : 'Clear, well-reasoned arguments work best'}
          </p>
        </div>
        
        <button 
          onClick={submitArg} 
          disabled={!caseId || !text.trim() || isCaseClosed || (hasInitialArgument && !canSubmitCounterArgument)}
          className={`w-full py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl ${
            isCaseClosed
              ? 'bg-linear-to-r from-gray-600 to-gray-700 text-gray-300'
              : hasInitialArgument 
              ? 'bg-linear-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:ring-orange-500/50'
              : 'bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500/50'
          } text-white`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};