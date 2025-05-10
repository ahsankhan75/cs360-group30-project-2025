import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const AdminRequireAuth = ({ children }) => {
  const { admin } = useAdminAuthContext();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if we're on the correct route
    if (location.pathname.startsWith('/hospital-admin/') && admin) {
      // We're logged in as admin but on a hospital admin route
      toast.error('You are logged in as an Admin, redirecting to the correct dashboard');
      window.location.href = '/admin/dashboard';
      return;
    }

    // Check for conflicting auth
    const hospitalAdmin = localStorage.getItem('hospitalAdmin');
    if (hospitalAdmin && admin) {
      // Clear hospital admin to prevent conflicts
      localStorage.removeItem('hospitalAdmin');
    }

    // Simulate checking authentication status
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [admin, location.pathname]);

  // Show loading spinner while checking
  if (isChecking) {
    return <LoadingSpinner fullScreen message="Verifying admin access..." />;
  }

  if (!admin) {
    toast.error('You must be logged in as an admin to view this page');
    return <Navigate to="/admin/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRequireAuth;
