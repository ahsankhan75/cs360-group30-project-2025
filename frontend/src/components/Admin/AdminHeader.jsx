import React from 'react';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { useAdminLogout } from '../../hooks/useAdminLogout';

const AdminHeader = ({ title }) => {
  const { admin } = useAdminAuthContext();
  const { logout } = useAdminLogout();
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-800">{title || 'Admin Dashboard'}</h1>
        
        <div className="flex items-center">
          {admin && (
            <>
              <span className="text-gray-600 mr-4">
                {admin.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
