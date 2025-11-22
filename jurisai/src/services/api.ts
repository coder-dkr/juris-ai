import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'https://juris-ai-teho.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Create new case
  createCase: async (title: string, caseType: string) => {
    const response = await apiClient.post('/create-case', {
      title,
      type: caseType,
      createdAt: new Date().toISOString()
    });
    return response.data;
  },

  // Upload document
  uploadDocument: async (file: File, side: string, documentName: string, caseId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('side', side);
    formData.append('documentName', documentName);
    formData.append('caseId', caseId);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Submit argument
  submitArgument: async (caseId: string, side: string, text: string) => {
    const response = await apiClient.post('/argument', {
      caseId,
      side,
      text,
    });
    return response.data;
  },

  // Surrender case
  surrenderCase: async (caseId: string, side: string) => {
    const response = await apiClient.post('/surrender', {
      caseId,
      side,
    });
    return response.data;
  },

  // Request verdict
  requestVerdict: async (caseId: string, contextNote?: string) => {
    const response = await apiClient.post('/verdict', {
      caseId,
      contextNote,
    });
    return response.data;
  },

  // Get case details
  getCase: async (caseId: string) => {
    const response = await apiClient.get(`/case/${caseId}`);
    return response.data;
  },

  // Get case arguments
  getCaseArguments: async (caseId: string) => {
    const response = await apiClient.get(`/case/${caseId}/arguments`);
    return response.data;
  },

  // Get case verdicts
  getCaseVerdicts: async (caseId: string) => {
    const response = await apiClient.get(`/case/${caseId}/verdicts`);
    return response.data;
  },
};

export default apiClient;