import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const useFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, refreshUserToken } = useAuthContext();

  const fetchData = async (url, method = 'GET', body = null, requiresAuth = true) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization token if required and user is logged in
      if (requiresAuth && user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const options = {
        method,
        headers
      };
      
      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }
      
      // First attempt with current token
      let response = await fetch(url, options);
      let data = await response.json();
      
      // Check if token is expired and refresh is needed
      if (response.status === 401 && data.code === 'TOKEN_EXPIRED' && requiresAuth) {
        // Try to refresh the token
        const newToken = await refreshUserToken();
        
        if (newToken) {
          // Update the authorization header with the new token
          options.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Retry the request with the new token
          response = await fetch(url, options);
          data = await response.json();
        }
      }
      
      setIsLoading(false);
      
      // If still not successful, throw error
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      return data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      setIsLoading(false);
      throw err;
    }
  };
  
  return { fetchData, isLoading, error };
};
