import { toast } from 'react-toastify';

/**
 * Fetch API wrapper with error handling
 */
export const fetchWithErrorHandling = async (url, options = {}, showToast = true) => {
  try {
    // Add connection timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, { 
      ...options, 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!response.ok) {
      // Get status text for the error
      const errorMessage = data.error || data.message || `HTTP error! Status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    let errorMessage = error.message;

    // Handle different types of connection errors
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. The server may be down or overloaded.';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
      
      // Check if the backend server is running
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        errorMessage += ' (Backend server may not be running at http://localhost:4000)';
        console.error('Connection error to backend server. Make sure the backend is running on http://localhost:4000');
      }
    }

    if (showToast) {
      toast.error(errorMessage);
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get user token from local storage
 * @returns {string|null} User token or null if not logged in
 */
export const getUserToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token || null;
};

/**
 * Get admin token from local storage
 * @returns {string|null} Admin token or null if not logged in as admin
 */
export const getAdminToken = () => {
  const admin = JSON.parse(localStorage.getItem('adminUser'));
  return admin?.token || null;
};

/**
 * Check if backend server is running
 * @returns {Promise<boolean>} True if server is running
 */
export const checkServerConnection = async () => {
  try {
    const response = await fetch('/health', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    console.error('Server connection check failed:', error);
    return false;
  }
};

/**
 * API methods for common endpoints
 */
export const api = {
  // Hospitals
  getHospitals: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchWithErrorHandling(`/api/hospitals/filter?${queryParams}`);
  },
  
  getHospitalNames: async () => {
    return fetchWithErrorHandling('/api/hospitals/names');
  },
  
  getHospitalById: async (id) => {
    return fetchWithErrorHandling(`/api/hospitals/${id}`);
  },
  
  // Blood requests
  getAllBloodRequests: async () => {
    return fetchWithErrorHandling('/api/blood-requests');
  },
  
  getUserBloodRequests: async () => {
    const token = getUserToken();
    if (!token) {
      throw new Error('You must be logged in to view your requests');
    }
    
    return fetchWithErrorHandling('/api/blood-requests/mine', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  getBloodRequestById: async (id) => {
    return fetchWithErrorHandling(`/api/blood-requests/${id}`);
  },
  
  acceptBloodRequest: async (requestId) => {
    const token = getUserToken();
    if (!token) {
      throw new Error('You must be logged in to accept requests');
    }
    
    return fetchWithErrorHandling(`/api/blood-requests/${requestId}/accept`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  getAcceptedBloodRequests: async () => {
    const token = getUserToken();
    if (!token) {
      throw new Error('You must be logged in to view your accepted requests');
    }
    
    return fetchWithErrorHandling('/api/blood-requests/accepted', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  // Reviews
  getHospitalReviews: async (hospitalId) => {
    return fetchWithErrorHandling(`/api/reviews/hospital/${hospitalId}`);
  }
};

export default api;
