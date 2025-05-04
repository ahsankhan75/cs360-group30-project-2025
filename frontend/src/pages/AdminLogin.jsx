import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminAuthContext } from '../hooks/useAdminAuthContext'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { dispatch } = useAdminAuthContext()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      })

      const json = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        setError(json.error)
        return
      }

      // Save user to local storage
      localStorage.setItem('adminUser', JSON.stringify(json))

      // Update auth context
      dispatch({type: 'LOGIN', payload: json})

      setIsLoading(false)
      navigate('/admin/dashboard')
    } catch (err) {
      setIsLoading(false)
      setError('An error occurred. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full space-y-4 sm:space-y-6 md:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-4 sm:mt-6 md:mt-8 space-y-4 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 text-xs sm:text-sm md:text-base"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 text-xs sm:text-sm md:text-base"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs sm:text-sm md:text-base">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 border border-transparent text-xs sm:text-sm md:text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {isLoading ? 'Loading...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
