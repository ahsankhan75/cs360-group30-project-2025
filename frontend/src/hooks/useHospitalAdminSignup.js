import { useState } from 'react';
import { useHospitalAdminAuthContext } from './useHospitalAdminAuthContext';
import { toast } from 'react-toastify';

export const useHospitalAdminSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useHospitalAdminAuthContext();

  const signup = async (email, password, fullName, hospitalId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hospital-admin/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password, fullName, hospitalId })
      });

      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error || 'Failed to create hospital admin account');
        return false;
      }

      // We don't login automatically since hospital admin accounts require approval
      toast.success(json.message || 'Registration successful. Your account is pending approval.');

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Hospital admin signup error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
      return false;
    }
  };

  return { signup, isLoading, error };
};