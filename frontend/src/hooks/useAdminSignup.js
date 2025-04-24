import { useState } from 'react'
import { useAdminAuthContext } from './useAdminAuthContext'
import { toast } from 'react-toastify'

export const useAdminSignup = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const { dispatch } = useAdminAuthContext()

  const signup = async (fullName, email, password, confirmPassword, adminSecret) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the correct endpoint and pass the adminSecret
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          fullName, 
          email, 
          password, 
          confirmPassword, 
          adminSecret 
        })
      })
      
      const json = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        setError(json.error || 'Failed to create admin account')
        // return false
        return
      }

      // save the admin user to local storage
      // localStorage.setItem('adminUser', JSON.stringify(json))

      // // update the auth context
      // dispatch({type: 'LOGIN', payload: json})

      // // Success notification
      // toast.success('Admin account created successfully')

      // // update loading state
      // setIsLoading(false)
      // return true
      return { message: json.message }
    } catch (err) {
      console.error('Admin signup error:', err)
      setError('Network error. Please check if the server is running.')
      setIsLoading(false)
      return
    }
  }

  return { signup, isLoading, error }
}
