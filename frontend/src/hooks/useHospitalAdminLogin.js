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
      const response = await fetch('/api/hospital-admin/login', {
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
      setError('Network error. Please try again later.');
      return false;
    }
  };

  return { login, isLoading, error };
};