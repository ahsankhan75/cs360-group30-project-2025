import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { Link } from "react-router-dom";

const ProfileIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef(null);
  const { user } = useAuthContext();
  const { logout } = useLogout();

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user's medical card data to get profile picture
  useEffect(() => {
    const fetchMedicalCard = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/medical-card`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Always set the profile picture, even if it's empty
          setProfilePicture(data?.profilePicture || null);
          if (data && data.name) {
            setUserName(data.name);
          }
        }
      } catch (error) {
        console.error("Error fetching medical card:", error);
      }
    };

    // Fetch immediately when component mounts
    fetchMedicalCard();

    // Set up an interval to refresh the data every 5 seconds
    const intervalId = setInterval(fetchMedicalCard, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [user]);

  // Listen for profile picture change events
  useEffect(() => {
    const handleProfilePictureChange = (event) => {
      setProfilePicture(event.detail.profilePicture || null);
    };

    // Add event listener for profile picture changes
    window.addEventListener('profilePictureChanged', handleProfilePictureChange);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('profilePictureChanged', handleProfilePictureChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Don't render if user is not logged in
  if (!user) return null;

  // Extract first letter of name or email for avatar fallback
  const firstLetter = userName ? userName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        aria-haspopup="true"
        aria-expanded={showDropdown}
      >
        {profilePicture && profilePicture.length > 0 ? (
          <img
            src={profilePicture.startsWith('http') ? profilePicture : `${window.location.origin.includes('localhost') ? 'http://localhost:4000' : ''}${profilePicture}`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-teal-600 text-white flex items-center justify-center">
            {firstLetter}
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <div className="px-4 py-3 border-b flex items-center">
              <div className="mr-3">
                {profilePicture && profilePicture.length > 0 ? (
                  <img
                    src={profilePicture.startsWith('http') ? profilePicture : `${window.location.origin.includes('localhost') ? 'http://localhost:4000' : ''}${profilePicture}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                    {firstLetter}
                  </div>
                )}
              </div>
              <div>
                {userName && <p className="text-sm font-medium text-gray-900">{userName}</p>}
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
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