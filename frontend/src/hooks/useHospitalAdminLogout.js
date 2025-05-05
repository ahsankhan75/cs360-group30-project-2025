import { useHospitalAdminAuthContext } from './useHospitalAdminAuthContext';

export const useHospitalAdminLogout = () => {
  const { dispatch } = useHospitalAdminAuthContext();

  const logout = () => {
    // Remove hospital admin from localStorage
    localStorage.removeItem('hospitalAdmin');

    // Update the auth context
    dispatch({ type: 'LOGOUT' });

    // No toast notification needed
  };

  return { logout };
};