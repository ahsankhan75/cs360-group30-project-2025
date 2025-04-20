import React from 'react';
import AdminNavbar from '../AdminNavbar';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { Navigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { admin } = useAdminAuthContext();

  if (!admin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {children}
    </div>
  );
};

export default AdminLayout;
