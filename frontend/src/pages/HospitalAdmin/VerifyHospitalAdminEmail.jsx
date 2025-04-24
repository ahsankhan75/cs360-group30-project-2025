import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate }        from "react-router-dom";
import { useHospitalAdminAuthContext }   from "../../hooks/useHospitalAdminAuthContext";
import { toast }                         from "react-toastify";

export default function VerifyHospitalAdminEmail() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { dispatch } = useHospitalAdminAuthContext();
  const [status, setStatus] = useState("Verifying your hospital-admin email…");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const res  = await fetch(`/api/hospital-admin/verify-email/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Verification failed.");

        // store hospital-admin user & update context
        // localStorage.setItem("hospitalAdminUser", JSON.stringify(json));
        // dispatch({ type: "LOGIN", payload: json });

        setStatus("Email verified!");
        toast.success("Hospital-admin email verified!");
        setTimeout(() => navigate("/hospital-admin/login"), 1500);

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
            Hospital Admin Email Verification
          </h2>
          <p>{status}</p>
        </div>
      </main>
    </div>
  );
}
