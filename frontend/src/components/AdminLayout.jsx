import React from 'react';
import AdminNavbar from './AdminNavbar';
import { useAdminAuthContext } from '../hooks/useAdminAuthContext';
import { Navigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { admin } = useAdminAuthContext();
  
  if (!admin) {
    return <Navigate to="/admin/login" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
