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
 * Check if user is an admin
 * @returns {boolean} True if user is admin
 */
export const isUserAdmin = () => {
  const admin = JSON.parse(localStorage.getItem('adminUser'));
  return !!admin?.token;
};

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
export const isUserLoggedIn = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return !!user?.token;
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
  
  // Blood Requests - Public methods (available to all users)
  getAllBloodRequests: async () => {
    try {
      const response = await fetch('/api/blood-requests');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not fetch blood requests');
      }
      return data;
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      throw error;
    }
  },
  
  getBloodRequestById: async (id) => {
    try {
      const response = await fetch(`/api/blood-requests/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not fetch blood request');
      }
      return data;
    } catch (error) {
      console.error('Error fetching blood request:', error);
      throw error;
    }
  },
  
  // User Blood Request methods (requires user authentication)
  getUserBloodRequests: async () => {
    const token = getUserToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await fetch('/api/blood-requests/mine', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not fetch your blood requests');
      }
      return data;
    } catch (error) {
      console.error('Error fetching user blood requests:', error);
      throw error;
    }
  },
  
  acceptBloodRequest: async (requestId) => {
    const token = getUserToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not accept blood request');
      }
      return data;
    } catch (error) {
      console.error('Error accepting blood request:', error);
      throw error;
    }
  },
  
  getAcceptedBloodRequests: async () => {
    const token = getUserToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await fetch('/api/blood-requests/accepted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not fetch accepted blood requests');
      }
      return data;
    } catch (error) {
      console.error('Error fetching accepted blood requests:', error);
      throw error;
    }
  },
  
  // Admin Blood Request methods (requires admin authentication)
  adminCreateBloodRequest: async (bloodRequestData) => {
    const token = getAdminToken();
    if (!token) {
      throw new Error('Admin authentication required');
    }
    
    try {
      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bloodRequestData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not create blood request');
      }
      return data;
    } catch (error) {
      console.error('Error creating blood request:', error);
      throw error;
    }
  },
  
  adminAddMultipleBloodRequests: async (bloodRequestsData) => {
    const token = getAdminToken();
    if (!token) {
      throw new Error('Admin authentication required');
    }
    
    try {
      const response = await fetch('/api/blood-requests/multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: bloodRequestsData })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not add multiple blood requests');
      }
      return data;
    } catch (error) {
      console.error('Error adding multiple blood requests:', error);
      throw error;
    }
  },
  
  adminDeleteBloodRequest: async (requestId) => {
    const token = getAdminToken();
    if (!token) {
      throw new Error('Admin authentication required');
    }
    
    try {
      const response = await fetch(`/api/blood-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete blood request');
      }
      return data;
    } catch (error) {
      console.error('Error deleting blood request:', error);
      throw error;
    }
  },
  
  // Reviews
  getHospitalReviews: async (hospitalId) => {
    return fetchWithErrorHandling(`/api/reviews/hospital/${hospitalId}`);
  }
};

export default api;
