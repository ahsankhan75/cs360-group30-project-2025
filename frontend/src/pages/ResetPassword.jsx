import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function ResetPassword() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/user/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (res.ok) {
        toast.success(json.message)
        navigate('/login')
      } else {
        toast.error(json.error)
      }
    } catch (err) {
      // console.error(err)
      toast.error('Something went wrong.')
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-end items-center p-6 relative">
        <div className="absolute left-0 top-0 h-full w-auto z-[1]">
        </div>

        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full
                        mx-auto md:ml-[40%] mt-48 text-left z-[20]">
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-6 text-center">
            Reset Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-[#15aacf]"
                placeholder="Enter your new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2a9fa7] text-white font-semibold
                         rounded-lg hover:bg-opacity-90 transition"
            >
              Reset Password
            </button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-[#15aacf] hover:underline">
                ← Back to login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
