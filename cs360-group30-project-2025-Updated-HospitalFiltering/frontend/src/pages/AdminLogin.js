// File: pages/AdminLogin.js
import { useState } from "react";
import { useAdminLogin } from "../hooks/useAdminLogin";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin, error, isLoading } = useAdminLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await adminLogin(email, password);
    // Optionally navigate to an admin dashboard after login:
    // navigate('/admindashboard');
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-center items-center p-6 relative">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full">
          <img src="/kk.png" alt="EMCON Logo" className="w-48 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-4 text-center">
            Admin Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#2a9fa7] text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              disabled={isLoading}
            >
              Log In
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminLogin;
