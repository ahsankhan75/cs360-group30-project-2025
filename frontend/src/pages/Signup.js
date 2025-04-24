import { useState } from "react";
import { useSignup } from "../hooks/useSignup";
import { useNavigate } from "react-router-dom";
import { toast }          from "react-toastify"

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signup, error, isLoading } = useSignup();
  const [done, setDone] = useState(false)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(fullName, email, password, confirmPassword);
    if (result?.message) {
      toast.success(result.message)
      setDone(true)
    }
  };

  if (done) {
    return (
      <div className="…card layout…">
        <h2 className="text-xl font-bold mb-4">Almost there!</h2>
        <p>Check your email (<strong>{email}</strong>) for a verification link.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 py-2 px-4 bg-[#2a9fa7] text-white rounded"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-center items-center p-6 relative">
        <div className="absolute left-0 top-0 h-full w-auto z-[1]">
          <svg
            viewBox="0 0 275 667"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-64 md:w-20 lg:w-[250px] opacity-50"
          >
            <path
              d="M234.053 400.435C289.469 364.525 287.855 282.893 231.063 249.201L-167.15 12.9649C-227.154 -22.632 -302.922 21.5139 -301.542 91.2684L-291.893 579.298C-290.513 649.053 -213.06 690.169 -154.51 652.228L234.053 400.435Z"
              fill="#0694A2"
              fillOpacity="0.70"
            />
          </svg>

          {/* SVG Background Shape - Bottom Left Diagonal */}
          <div className="absolute left-[-50px] bottom-[-500px] rotate-[-125deg] h-auto w-auto z-[-1]">
            <svg
              viewBox="0 0 506 1073"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 md:w-80 lg:w-[350px] opacity-50"
            >
              <path
                d="M-317.959 631.137C-386.294 586.549 -386.294 486.451 -317.959 441.863L330.501 18.7549C405.664 -30.2875 505.25 23.6442 505.25 113.391L505.25 959.609C505.25 1049.36 405.664 1103.29 330.501 1054.25L-317.959 631.137Z"
                fill="#0694A2"
                fillOpacity="0.7"
              />
            </svg>
          </div>

          <div className="absolute left-[-30px] bottom-[-500px] rotate-[-125deg] h-auto w-auto z-[-2]">
            <svg
              viewBox="0 0 506 1073"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 md:w-80 lg:w-[300px] opacity-50"
            >
              <path
                d="M-317.959 631.137C-386.294 586.549 -386.294 486.451 -317.959 441.863L330.501 18.7549C405.664 -30.2875 505.25 23.6442 505.25 113.391L505.25 959.609C505.25 1049.36 405.664 1103.29 330.501 1054.25L-317.959 631.137Z"
                fill="#0694A2"
                fillOpacity="0.7"
              />
            </svg>
          </div>
          {/* SVG Background Shape - Top Right */}
          <div className="absolute top-0 right-[-1550px] h-auto w-auto z-[-10]">
            <svg
              viewBox="0 0 302 423"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[250px] md:w-[300px] lg:w-[350px] opacity-50"
            >
              <path
                d="M17.5748 229.468C-6.28798 214.732 -4.72174 179.505 20.3632 166.754L339.483 4.53436C364.059 -7.95868 392.897 10.5675 391.674 38.064L376.127 387.75C374.904 415.247 344.526 431.372 321.147 416.935L17.5748 229.468Z"
                fill="#F76700"
                fillOpacity="0.7"
              />
            </svg>
          </div>
          {/* SVG Background Shape - Top Right Above Navbar */}
          <div className="absolute top-[-200px] right-[-1470px] h-auto w-auto z-[10]">
            <svg
              viewBox="0 0 436 382"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[300px] md:w-[350px] lg:w-[400px] opacity-50"
            >
              <path
                d="M544.998 169.438C604.329 140.449 612.538 59.215 560.207 18.9415L193.275 -263.445C137.984 -305.996 57.4605 -271.277 50.4457 -201.862L1.36737 283.79C-5.64743 353.204 66.3021 403.332 128.988 372.703L544.998 169.438Z"
                fill="#0694A2"
                fillOpacity="2"
              />
            </svg>
          </div>
        </div>

        {/* 
          NOTE: Changed max-w from `max-w-md` to `max-w-lg`
          and increased padding to p-8 md:p-10 for a bigger form. 
        */}
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full text-left">
          <img src="/kk.png" alt="EMCON Logo" className="w-32 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-4 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Full Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium">Confirm Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600">
              <span
                className="text-[#15aacf] cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Already a user?
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

      {/* FOOTER */}
      <footer className="bg-[#2a9fa7] text-white h-64 md:h-80 lg:h-96 py-8 md:py-12 px-8 md:px-12 lg:px-16 mt-40 relative z-[10]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">EMCON</h1>
            <p className="mt-2">Smart healthcare navigation for everyone!</p>
          </div>

          <div className="flex space-x-6">
            <a href="#home" className="hover:underline">Find Hospitals</a>
            <a href="#insurance" className="hover:underline">Insurance</a>
            <a href="#donations" className="hover:underline">Donations</a>
            <a href="#medical-card" className="hover:underline">Medical Card</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Signup;