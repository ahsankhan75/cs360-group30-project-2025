import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate }          from "react-router-dom";
import { useAdminAuthContext }              from "../hooks/useAdminAuthContext";
import { toast }                            from "react-toastify";

export default function VerifyAdminEmail() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { dispatch } = useAdminAuthContext();
  const [status, setStatus] = useState("Verifying your admin email…");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const res  = await fetch(`/api/admin/verify-email/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Verification failed.");

        // store admin user & update context
        localStorage.setItem("adminUser", JSON.stringify(json));
        dispatch({ type: "LOGIN", payload: json });

        setStatus("Admin email verified! Redirecting…");
        toast.success("Admin email verified!");
        setTimeout(() => navigate("/admin/dashboard"), 1500);

      } catch (err) {
        setStatus(err.message);
        toast.error(err.message);
      }
    })();
  }, [token, dispatch, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-4">
            Admin Email Verification
          </h2>
          <p>{status}</p>
        </div>
      </main>
    </div>
  );
}