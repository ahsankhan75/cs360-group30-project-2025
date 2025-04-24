import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const res = await fetch('/api/hospital-admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const json = await res.json()
      if (res.ok) {
        toast.success(json.message)
      } else {
        toast.error(json.error)
      }
    } catch (err) {
      // console.error('Forgot password error:', err)
      toast.error('Unable to send reset link. Please try again.')
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-end items-center p-6 relative">
        <div className="absolute left-0 top-0 h-full w-auto z-[1]">
        </div>

        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full mx-auto md:ml-[40%] mt-48 text-left z-[20]">
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-6 text-center">
            Forgot Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Your Email</label>
              <input
                type="email"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-[#15aacf]"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2a9fa7] text-white font-semibold rounded-lg hover:bg-opacity-90 transition"
            >
              Send Reset Link
            </button>

            <div className="text-center text-sm">
              <Link to="/hospital-admin/login" className="text-[#15aacf] hover:underline">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}