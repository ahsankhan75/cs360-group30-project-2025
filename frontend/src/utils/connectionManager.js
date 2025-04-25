import { toast } from 'react-toastify';
import { getAdminToken, getUserToken } from './api';

// Connection state with a short expiration time
let connectionState = {
  isAvailable: null,
  lastChecked: 0,
  checkingInProgress: false
};

// Cache duration in milliseconds (5 seconds)
const CACHE_DURATION = 5000;

// Maximum number of automatic retries
const MAX_AUTO_RETRIES = 3;

/**
 * Check if the backend server is available
 * @param {boolean} forceCheck - Force a new check even if cached result exists
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Promise<boolean>} True if backend is available, false otherwise
 */
export const checkBackendConnection = async (forceCheck = false, maxRetries = 2) => {
  const now = Date.now();

  // Use cached result if available, not forcing a check, and cache hasn't expired
  if (!forceCheck &&
      connectionState.isAvailable !== null &&
      now - connectionState.lastChecked < CACHE_DURATION) {
    return connectionState.isAvailable;
  }

  // If already checking, wait a bit and return optimistic result
  if (connectionState.checkingInProgress) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return true; // Optimistically return true to avoid showing error screen
  }

  connectionState.checkingInProgress = true;

  try {
    // Try multiple endpoints to increase chances of success
    const endpoints = ['/health', '/api/health', '/'];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // Shorter timeout

          const response = await fetch(endpoint, {
            signal: controller.signal,
            cache: 'no-store', // Prevent caching
            headers: { 'pragma': 'no-cache' }
          });

          clearTimeout(timeoutId);

          if (response.ok || response.status === 404) { // 404 means server is up but endpoint doesn't exist
            connectionState.isAvailable = true;
            connectionState.lastChecked = now;
            return true;
          }
        } catch (err) {
          // Just continue to next endpoint or retry
          console.log(`Connection check failed for ${endpoint}, attempt ${attempt+1}`);
        }
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }

    // If we get here, all attempts failed
    connectionState.isAvailable = false;
    connectionState.lastChecked = now;
    return false;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    connectionState.isAvailable = false;
    connectionState.lastChecked = now;
    return false;
  } finally {
    connectionState.checkingInProgress = false;
  }
};

/**
 * Handles API call with backend availability check
 * @param {Function} apiCall - The API call function to execute
 * @param {boolean} showError - Whether to show error toast
 * @param {number} maxRetries - Maximum number of retries for the API call
 * @returns {Promise} - Result of the API call or null if backend is unavailable
 */
export const withBackendCheck = async (apiCall, showError = true, maxRetries = 2) => {
  // Try to check connection, but don't force it and use optimistic approach
  const isAvailable = await checkBackendConnection(false, 1);

  // Even if connection check fails, still try the actual API call
  // This is because the health endpoint might be down but the actual API still works

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);

      // If this is the last attempt and we should show errors
      if (attempt === maxRetries && showError) {
        // Only show toast on the final attempt
        if (error.name === 'AbortError' || error.name === 'TypeError') {
          toast.error('Connection to server timed out. Please try again later.');
        } else {
          toast.error('Something went wrong while connecting to the server.');
        }
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      } else {
        return null; // Return null on final failed attempt
      }
    }
  }

  return null; // Should never reach here, but just in case
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
