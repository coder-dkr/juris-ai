import React from 'react';

interface ErrorNotificationProps {
  error: string | null;
  onClear: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  error, 
  onClear 
}) => {
  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-900/90 backdrop-blur-sm border border-red-800/50 text-red-100 px-4 py-3 rounded-xl shadow-2xl z-50 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium pr-3">{error}</span>
        </div>
        <button 
          onClick={onClear}
          className="ml-auto text-red-300 hover:text-red-100 shrink-0 transition-colors duration-200"
          aria-label="Close error"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};