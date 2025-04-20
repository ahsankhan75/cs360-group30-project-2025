import { Navigate } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';

const HospitalAdminRequireAuth = ({ children }) => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();

  if (!hospitalAdmin) {
    // Redirect to login if not authenticated
    return <Navigate to="/hospital-admin/login" replace />;
  }

  // Render child components if authenticated
  return children;
};

export default HospitalAdminRequireAuth;