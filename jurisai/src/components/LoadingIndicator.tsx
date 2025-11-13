import React from 'react';

interface LoadingIndicatorProps {
  loading: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 text-white px-4 py-2 rounded-xl shadow-xl">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
        <span className="text-sm font-medium">Processing...</span>
      </div>
    </div>
  );
};