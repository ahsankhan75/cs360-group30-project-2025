import React, { useState, useEffect } from 'react';
import AdminNavbar from '../AdminNavbar';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

const AdminLayout = ({ children }) => {
  const { admin } = useAdminAuthContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication status
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading admin dashboard..." />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      {children}
    </div>
  );
};

export default AdminLayout;
