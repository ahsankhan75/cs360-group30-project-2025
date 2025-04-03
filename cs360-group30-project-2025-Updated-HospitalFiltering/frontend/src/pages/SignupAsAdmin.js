// pages/SignupAsAdmin.js
import { useState } from "react";
import { useSignup } from "../hooks/useSignup"; // Or create a separate hook for admin signup if necessary
import { useNavigate } from "react-router-dom";

function SignupAsAdmin() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const { signup, error, isLoading } = useSignup(); // If using the same hook, pass adminId conditionally.
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Pass adminId along with the other values to the signup function
    await signup(fullName, email, password, confirmPassword, adminId);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full">
          <img src="/kk.png" alt="EMCON Logo" className="w-32 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-4 text-center">
            Signup as Admin
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-medium">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full p-2 border rounded-md"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-2 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full p-2 border rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Admin ID Field */}
            <div>
              <label className="block font-medium">Admin ID</label>
              <input
                type="text"
                placeholder="Enter your admin ID"
                className="w-full p-2 border rounded-md"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
            </div>

            {/* Link to Login if needed */}
            <p className="text-sm text-gray-600">
              <span
                className="text-[#15aacf] cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Already an admin? Login
              </span>
            </p>

            <button
              type="submit"
              className="w-full py-2 bg-[#2a9fa7] text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              disabled={isLoading}
            >
              Sign Up
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        </div>
      </main>
    </div>
  );
}

export default SignupAsAdmin;
