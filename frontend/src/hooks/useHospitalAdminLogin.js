import { useState } from 'react';
import { useHospitalAdminAuthContext } from './useHospitalAdminAuthContext';
import { toast } from 'react-toastify';

export const useHospitalAdminLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useHospitalAdminAuthContext();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/hospital-admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error);
        return false;
      }

      // Save hospital admin to local storage
      localStorage.setItem('hospitalAdmin', JSON.stringify(json));

      // Update the context
      dispatch({ type: 'LOGIN', payload: json });

      // Success notification
      toast.success('Logged in successfully');

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);

      if (err.name === 'AbortError') {
        setError('Connection timed out. Please try again.');
      } else {
        setError('Network error. Please try again later.');
      }

      // Rethrow the error so the component can show the error page
      throw err;
    }
  };

  return { login, isLoading, error };
};