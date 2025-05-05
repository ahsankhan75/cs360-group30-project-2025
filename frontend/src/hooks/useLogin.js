import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { toast } from 'react-toastify'

export const useLogin = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const { dispatch } = useAuthContext()

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      })
      const json = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        setError(json.error)
        return false
      }

      // save the user to local storage
      localStorage.setItem('user', JSON.stringify(json))

      // update the auth context
      dispatch({type: 'LOGIN', payload: json})

      // update loading state
      setIsLoading(false)

      // We don't need a toast here as the redirect to dashboard is feedback enough
      return true
    } catch (err) {
      console.error('Login error:', err)
      setIsLoading(false)
      setError('An error occurred during login. Please try again.')
      return false
    }
  }

  return { login, isLoading, error }
}