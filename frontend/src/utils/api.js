import { toast } from 'react-toastify';

/**
 * Wrapper for fetch that handles common errors and provides feedback
 * @param {string} url - API endpoint to call
 * @param {object} options - Fetch options
 * @param {boolean} showToast - Whether to show toast messages on error
 * @returns {Promise} Response data or error
 */
export const fetchWithErrorHandling = async (url, options = {}, showToast = true) => {
  try {
    // Check if backend is available first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, { 
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Get the data regardless of status code
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle based on status code
    if (!response.ok) {
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Handle network errors (like ECONNREFUSED)
    if (error.name === 'AbortError') {
      const errorMessage = 'Server connection timed out. Is the backend server running?';
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    // Rethrow the error for the caller to handle
    throw error;
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
  
  // Reviews
  getHospitalReviews: async (hospitalId) => {
    return fetchWithErrorHandling(`/api/reviews/hospital/${hospitalId}`);
  }
};

export default api;
