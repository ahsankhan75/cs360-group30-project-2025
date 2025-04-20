import { useHospitalAdminAuthContext } from './useHospitalAdminAuthContext';
import { toast } from 'react-toastify';

export const useHospitalAdminLogout = () => {
  const { dispatch } = useHospitalAdminAuthContext();

  const logout = () => {
    // Remove hospital admin from localStorage
    localStorage.removeItem('hospitalAdmin');
    
    // Update the auth context
    dispatch({ type: 'LOGOUT' });
    
    // Notify user
    toast.success('Logged out successfully');
  };

  return { logout };
};