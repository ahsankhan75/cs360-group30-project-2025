// File: hooks/useAdminLogin.js
import { useState } from 'react';
import { useAdminAuthContext } from './useAdminAuthContext';
import { toast } from 'react-toastify';
import { fetchWithErrorHandling } from '../utils/api';

export const useAdminLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAdminAuthContext();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });

      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error);
        return false;
      }

      // Save the admin user to local storage
      localStorage.setItem('adminUser', JSON.stringify(json));

      // Update the admin context
      dispatch({ type: 'LOGIN', payload: json });

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setError('An error occurred during login. Please try again.');
      return false;
    }
  };

  return { login, isLoading, error };
};
