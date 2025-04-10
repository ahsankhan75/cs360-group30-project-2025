import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { Link } from "react-router-dom";

const ProfileIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuthContext();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Don't render if user is not logged in
  if (!user) return null;

  // Extract first letter of email for avatar
  const firstLetter = user.email.charAt(0).toUpperCase();

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        aria-haspopup="true"
        aria-expanded={showDropdown}
      >
        {firstLetter}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
            </div>
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setShowDropdown(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/medical-card"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setShowDropdown(false)}
            >
              Medical Card
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              role="menuitem"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;