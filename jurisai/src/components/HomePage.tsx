import React, { useState } from 'react';

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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 to-blue-900/20"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-2">
                  Juris<span className="text-blue-400">AI</span>
                </h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Powered by AI Judge Jurix</span>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-200 mb-4">
              AI-Powered Mock Trial System
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Experience realistic legal proceedings with our AI Judge trained on Indian legal system. 
              Create cases, present arguments, and receive professional judicial analysis.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Features */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Why Choose JurisAI?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">AI Judge Jurix</h4>
                    <p className="text-gray-400">Trained on Indian legal system with expertise in constitutional law, civil procedures, and criminal jurisprudence.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Real Court Simulation</h4>
                    <p className="text-gray-400">Experience authentic legal proceedings with document uploads, argument presentations, and judicial decisions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Dynamic Case Flow</h4>
                    <p className="text-gray-400">Multiple rounds of arguments, interim decisions, and strategic case management with surrender options.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Case Management */}
            <div className="bg-gray-900/95 border border-gray-700/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
              <div className="bg-linear-to-r from-gray-800/80 to-gray-800/60 border-b border-gray-700/50 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-linear-to-br from-amber-500 via-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white bg-linear-to-r from-white to-gray-300 bg-clip-text">Case Management</h3>
                    <p className="text-sm text-gray-400 font-medium">Start your legal journey</p>
                  </div>
                </div>
                
                {/* Enhanced Tab Navigation with Sliding Indicator */}
                <div className="relative bg-gray-800/60 rounded-xl p-1.5 backdrop-blur-sm">
                  <div 
                    className={`absolute top-1.5 h-10 bg-linear-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg transition-all duration-500 ease-out transform ${
                      activeTab === 'create' 
                        ? 'left-1.5 w-[calc(50%-0.375rem)] translate-x-0' 
                        : 'left-1.5 w-[calc(50%-0.375rem)] translate-x-full'
                    }`}
                  />
                  <div className="relative flex">
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
                        activeTab === 'create'
                          ? 'text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create New Case
                    </button>
                    <button
                      onClick={() => setActiveTab('join')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
                        activeTab === 'join'
                          ? 'text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Join Existing
                    </button>
                  </div>
                </div>
              </div>

              {/* Animated Content Container */}
              <div className="p-6 min-h-[400px] relative overflow-hidden">
                <div className={`transform transition-all duration-500 ease-in-out ${
                  activeTab === 'create' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute inset-6'
                }`}>
                  <form onSubmit={handleCreateCase} className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Case Title
                      </label>
                      <input
                        type="text"
                        value={caseTitle}
                        onChange={(e) => setCaseTitle(e.target.value)}
                        placeholder="Enter case title (e.g., ABC vs XYZ Property Dispute)"
                        className="w-full px-4 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/90 focus:bg-gray-800"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-3">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Case Type
                      </label>
                      <select
                        value={caseType}
                        onChange={(e) => setCaseType(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/90 focus:bg-gray-800 cursor-pointer"
                      >
                        <option value="civil">⚖️ Civil Case</option>
                        <option value="criminal">🚔 Criminal Case</option>
                        <option value="corporate">🏢 Corporate Law</option>
                        <option value="constitutional">📜 Constitutional Matter</option>
                        <option value="family">👨‍👩‍👧‍👦 Family Law</option>
                        <option value="property">🏠 Property Dispute</option>
                        <option value="contract">📋 Contract Dispute</option>
                        <option value="international">🌍 International Law</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-linear-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 text-white font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group"
                    >
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Create Case & Enter Courtroom
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </form>
                </div>

                <div className={`transform transition-all duration-500 ease-in-out ${
                  activeTab === 'join' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute inset-6'
                }`}>
                  <form onSubmit={handleJoinCase} className="space-y-6">
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-3">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Case ID
                      </label>
                      <input
                        type="text"
                        value={joinCaseId}
                        onChange={(e) => setJoinCaseId(e.target.value)}
                        placeholder="Enter existing case ID (e.g., CASE-1699123456-ABC123)"
                        className="w-full px-4 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/90 focus:bg-gray-800 font-mono text-sm"
                        required
                      />
                    </div>

                    <div className="bg-linear-to-r from-blue-900/30 to-indigo-900/20 border border-blue-700/40 rounded-xl p-5 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm text-blue-200 font-bold mb-1 flex items-center gap-2">
                            Join Active Legal Proceeding
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          </h4>
                          <p className="text-xs text-blue-300/80 leading-relaxed">
                            Enter a valid case ID to participate in ongoing litigation. You can represent either plaintiff or defense counsel in the virtual courtroom.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Join Case & Enter Courtroom
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-800/50">
            <p className="text-gray-500 text-sm">
              © 2024 JurisAI - AI-Powered Legal Education Platform
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Trained on Indian Legal System • Mock Trial Simulation • Educational Purpose
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};