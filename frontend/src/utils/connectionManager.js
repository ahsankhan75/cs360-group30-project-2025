import { toast } from 'react-toastify';
import { getAdminToken, getUserToken } from './api';

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

/**
 * User API call wrapper with error handling
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {string} userToken - User auth token (optional - will use from local storage if not provided)
 * @returns {Promise} Response data or null on error
 */
export const userApiCall = async (url, options = {}, userToken = null) => {
  try {
    // Get token from params or from local storage
    const token = userToken || getUserToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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

/**
 * Public API call without authentication
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data or null on error
 */
export const publicApiCall = async (url, options = {}) => {
  try {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json'
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
