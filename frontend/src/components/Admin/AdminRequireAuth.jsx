import { Navigate } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const AdminRequireAuth = ({ children }) => {
  const { admin } = useAdminAuthContext();
  
  if (!admin) {
    toast.error('You must be logged in as an admin to view this page');
    return <Navigate to="/admin/login" />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRequireAuth;
