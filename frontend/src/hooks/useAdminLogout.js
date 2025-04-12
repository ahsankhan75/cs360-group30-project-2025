import { useAdminAuthContext } from './useAdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useAdminLogout = () => {
  const { dispatch } = useAdminAuthContext();
  const navigate = useNavigate();

  const logout = () => {
    // Remove admin from local storage
    localStorage.removeItem('adminUser');
    
    // Dispatch logout action
    dispatch({ type: 'LOGOUT' });
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Navigate to admin login page
    navigate('/admin/login');
  };

  return { logout };
};
