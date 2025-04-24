import { useRef, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"
import { toast } from "react-toastify"

export default function VerifyEmail() {
  const { token }      = useParams()
  const navigate       = useNavigate()
  const { dispatch }   = useAuthContext()
  const [status, setStatus] = useState("Verifying your email…")

  // This ref survives across renders and prevents the second StrictMode call
  const hasFetched = useRef(false)

  useEffect(() => {
    // Skip on the second mount in StrictMode
    if (hasFetched.current) return
    hasFetched.current = true

    const verify = async () => {
      try {
        const res  = await fetch(`/api/user/verify-email/${token}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || "Verification failed.")
        }

        // Success → store and log in
        localStorage.setItem("user", JSON.stringify(json))
        dispatch({ type: "LOGIN", payload: json })

        setStatus("Email verified! Redirecting…")
        toast.success("Email verified! Redirecting…")
        setTimeout(() => navigate("/"), 1500)

      } catch (err) {
        setStatus(err.message)
        toast.error(err.message)
      }
    }

    verify()
  }, [token, dispatch, navigate])

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-4">
            Email Verification
          </h2>
          <p>{status}</p>
        </div>
      </main>
    </div>
  )
}