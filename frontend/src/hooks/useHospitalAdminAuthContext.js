import { useContext } from 'react';
import { HospitalAdminAuthContext } from '../context/HospitalAdminAuthContext';

export const useHospitalAdminAuthContext = () => {
  const context = useContext(HospitalAdminAuthContext);

  if (!context) {
    throw Error('useHospitalAdminAuthContext must be used inside a HospitalAdminAuthContextProvider');
  }

  return context;
};