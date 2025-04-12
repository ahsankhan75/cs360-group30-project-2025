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
    <div className="min-h-screen bg-gray-100 pt-24">
      <AdminNavbar />
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {children}
      </div>
      <footer className="bg-[#2a9fa7] text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold">EMCON</h3>
              <p className="mt-1 text-sm">Admin Dashboard</p>
            </div>
            <div className="text-sm">
              © {new Date().getFullYear()} EMCON. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
