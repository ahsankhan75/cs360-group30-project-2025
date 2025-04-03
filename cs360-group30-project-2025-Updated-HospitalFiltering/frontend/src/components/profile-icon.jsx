import React, { useEffect, useState, useRef } from "react";

const ProfileIcon = () => {
  const [user, setUser] = useState(null);
  const [hovered, setHovered] = useState(false);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.token) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimeoutRef.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 200); // 200ms delay before hiding
  };

  if (!user) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999]"
      style={{ backgroundColor: "white", padding: "5px", borderRadius: "50%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src="/profile-icon.png"
        alt="Profile"
        className="w-10 h-10 rounded-full cursor-pointer border border-gray-400 shadow-lg"
        title={user.email}
      />
      {/* {hovered && (
        <div
          className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-300 shadow-lg rounded-md"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )} */}
      {hovered && (
  <div
    className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded-md p-3"
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    <div className="mb-3 border-b pb-2 text-sm text-gray-800">
      <div><strong>Email:</strong> {user.email}</div>
    </div>
    <button
      onClick={handleLogout}
      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
    >
      Logout
    </button>
  </div>
)}
    </div>
  );
};

export default ProfileIcon;