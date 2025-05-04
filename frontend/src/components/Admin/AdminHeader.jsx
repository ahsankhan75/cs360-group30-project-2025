import React from 'react';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { useAdminLogout } from '../../hooks/useAdminLogout';

const AdminHeader = ({ title }) => {
  const { admin } = useAdminAuthContext();
  const { logout } = useAdminLogout();

  return (
    <header className="bg-white shadow-sm z-10 w-full">
      <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 w-full">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{title || 'Admin Dashboard'}</h1>

        <div className="flex items-center">
          {admin && (
            <>
              <span className="hidden sm:inline text-xs md:text-sm lg:text-base text-gray-600 mr-2 md:mr-4" title={admin.email}>
                {admin.email.length > 15 && window.innerWidth < 768
                  ? `${admin.email.substring(0, 15)}...`
                  : admin.email}
              </span>
              <button
                onClick={logout}
                className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
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
