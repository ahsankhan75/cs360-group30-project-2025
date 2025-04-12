import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';

export const useAdminAuthContext = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw Error('useAdminAuthContext must be used inside an AdminAuthContextProvider');
  }

  return context;
};
