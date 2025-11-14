import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useApp } from './hooks/useApp';
import { HomePage, CourtRoom, ClosedCaseView, ErrorNotification } from './components';
import { apiService } from './services/api';

interface CaseData {
  _id: string;
  title: string;
  caseType?: string;
  documents: Array<{
    filename: string;
    side: string;
    content: string;
  }>;
  arguments: Array<{
    _id: string;
    side: string;
    text: string;
    createdAt: string;
  }>;
  verdicts: Array<{
    _id: string;
    text: string;
    createdAt: string;
    raw?: {
      surrenderedBy?: string;
      type?: string;
    };
  }>;
  argumentCount: number;
  verdictCount: number;
}

function App() {
  const { state, clearError } = useApp();
  const { error } = state;

  return (
    <div className="min-h-screen w-full bg-amber-600">
      <ErrorNotification error={error} onClear={clearError} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/case/:caseId" element={<CaseRoute />} />
      </Routes>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { setError, clearError, setLoading } = useApp();

  // Create new case
  async function handleCreateCase(caseTitle: string, caseType: string) {
    try {
      setLoading(true);
      clearError();
      
      const result = await apiService.createCase(caseTitle, caseType);
      
      if (!result.caseId) {
        throw new Error('Failed to create case - no case ID returned');
      }
      
      navigate(`/case/${result.caseId}`);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create case');
    } finally {
      setLoading(false);
    }
  }

  // Join existing case
  async function handleJoinCase(caseId: string) {
    try {
      setLoading(true);
      clearError();
      
      const fetchedCaseData = await apiService.getCase(caseId);
      
      if (!fetchedCaseData) {
        throw new Error('Case not found. Please check the Case ID.');
      }
      
      navigate(`/case/${caseId}`);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join case');
    } finally {
      setLoading(false);
    }
  }

  return (
    <HomePage 
      onCreateCase={handleCreateCase}
      onJoinCase={handleJoinCase}
    />
  );
}

function CaseRoute() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { setError, clearError, setLoading } = useApp();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!caseId) return;

    
    async function fetchCase() {
      try {
        // setIsLoading(true);
        // setLoading(true);
        clearError();
        
        const fetchedCaseData = await apiService.getCase(caseId!);
        
        if (!fetchedCaseData) {
          throw new Error('Case not found. Please check the Case ID.');
        }
        
        setCaseData(fetchedCaseData);
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load case');
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    }
    
    fetchCase();
  }, []);

  const isCaseClosed = (caseData: CaseData) => {
    if (!caseData.verdicts || caseData.verdicts.length === 0) return false;
    
    const lastVerdict = caseData.verdicts[caseData.verdicts.length - 1];
    
    const isSurrendered = lastVerdict?.raw?.type === 'surrender';
    const hasFinalVerdict = lastVerdict?.text?.toLowerCase().includes('final decision') ||
                           lastVerdict?.text?.toLowerCase().includes('case closed') ||
                           lastVerdict?.text?.toLowerCase().includes('verdict') ||
                           caseData.argumentCount >= 10;
    
    return isSurrendered || hasFinalVerdict;
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading || !caseData) {
    return (
      <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading case...</p>
        </div>
      </div>
    );
  }

  if (isCaseClosed(caseData)) {
    return (
      <ClosedCaseView
        caseId={caseId!}
        caseData={caseData}
        onBackToHome={handleBackToHome}
      />
    );
  }

  return <CourtRoom caseId={caseId!} />;
}

export default App;
