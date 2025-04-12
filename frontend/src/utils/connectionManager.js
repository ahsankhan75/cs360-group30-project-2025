import { toast } from 'react-toastify';

let backendChecked = false;
let isBackendAvailable = false;
let checkingInProgress = false;

/**
 * Check if the backend server is available
 * @returns {Promise<boolean>} True if backend is available, false otherwise
 */
export const checkBackendConnection = async () => {
  if (backendChecked) return isBackendAvailable;
  if (checkingInProgress) return false;
  
  checkingInProgress = true;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('/health', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    isBackendAvailable = response.ok;
    backendChecked = true;
    return isBackendAvailable;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    isBackendAvailable = false;
    return false;
  } finally {
    checkingInProgress = false;
  }
};

/**
 * Handles API call with backend availability check
 * @param {Function} apiCall - The API call function to execute
 * @param {boolean} showError - Whether to show error toast
 * @returns {Promise} - Result of the API call or null if backend is unavailable
 */
export const withBackendCheck = async (apiCall, showError = true) => {
  const isAvailable = await checkBackendConnection();
  
  if (!isAvailable) {
    if (showError) {
      toast.error('Cannot connect to the server. Please make sure the backend is running.');
    }
    return null;
  }
  
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    if (showError) {
      toast.error('Something went wrong while connecting to the server.');
    }
    return null;
  }
};

/**
 * Admin API call wrapper with error handling
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {string} adminToken - Admin auth token
 * @returns {Promise} Response data or null on error
 */
export const adminApiCall = async (url, options = {}, adminToken) => {
  try {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${adminToken}`
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    toast.error(error.message || 'Something went wrong');
    throw error;
  }
};
