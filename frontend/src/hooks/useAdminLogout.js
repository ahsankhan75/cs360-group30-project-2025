import { useAdminAuthContext } from './useAdminAuthContext';
import { useNavigate } from 'react-router-dom';

export const useAdminLogout = () => {
  const { dispatch } = useAdminAuthContext();
  const navigate = useNavigate();

  const logout = () => {
    // Remove admin from local storage
    localStorage.removeItem('adminUser');

    // Dispatch logout action
    dispatch({ type: 'LOGOUT' });

    // Navigate to admin login page
    navigate('/admin/login');
  };

  return { logout };
};
