import { useState, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { toast } from 'react-toastify';

/**
 * Hook for making authenticated API requests with loading and error handling
 */
export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  /**
   * Make an authenticated request
   * @param {string} url - API endpoint
   * @param {Object} options - Fetch options
   * @param {boolean} showToast - Whether to show error toast
   * @returns {Promise<any>} Response data
   */
  const fetchData = useCallback(async (url, options = {}, showToast = true) => {
    setLoading(true);
    setError(null);

    try {
      // Add authentication header if user is logged in
      const headers = options.headers || {};
      if (user) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle non-successful responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        
        try {
          // Try to parse as JSON for structured error
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || `Error: ${response.status}`;
        } catch {
          // Use plain text if not JSON
          errorMessage = errorText || `Error: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      if (showToast) {
        toast.error(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { fetchData, loading, error };
};
