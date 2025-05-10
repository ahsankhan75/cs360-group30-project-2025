import { Navigate, useLocation } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';

const HospitalAdminRequireAuth = ({ children }) => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();
  const location = useLocation();

  // Simple check - if no hospital admin in context, redirect to login
  if (!hospitalAdmin) {
    return <Navigate to="/hospital-admin/login" replace state={{ from: location }} />;
  }

  // Render child components if authenticated
  return children;
};

export default HospitalAdminRequireAuth;