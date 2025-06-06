import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useSignup = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const { dispatch } = useAuthContext()

  const signup = async (fullName, email, password, confirmPassword) => {
    setIsLoading(true)
    setError(null)

    // console.log("BEFORE....")
    const response = await fetch('/api/user/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    })
    const json = await response.json()
    // console.log("AFTER....")

    if (!response.ok) {
      setIsLoading(false)
      setError(json.error || 'Failed to signup')
      return
      // return { error: json.error }
    }
    // if (response.ok) {
    //   // save the user to local storage
    //   localStorage.setItem('user', JSON.stringify(json))

    //   // update the auth context
    //   dispatch({type: 'LOGIN', payload: json})

    //   // update loading state
    //   setIsLoading(false)
    // }
    // console.log("Before Returning....")
    return { message: json.message }
  }

  return { signup, isLoading, error }
}