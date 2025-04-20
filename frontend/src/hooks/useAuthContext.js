import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { toast } from "react-toastify";

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error("useAuthContext must be used inside an AuthContextProvider");
  }

  // Add a function to handle token refresh
  const refreshUserToken = async () => {
    if (!context.user || !context.user.refreshToken) {
      // No refresh token available, user must log in again
      context.dispatch({ type: 'LOGOUT' });
      toast.error('Your session has expired. Please log in again.');
      return null;
    }

    try {
      const response = await fetch('/api/user/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: context.user.refreshToken
        }),
      });

      const json = await response.json();

      if (response.ok) {
        // Update the auth context with the new tokens
        context.dispatch({
          type: 'LOGIN',
          payload: json
        });
        
        // Save to local storage
        localStorage.setItem('user', JSON.stringify(json));
        
        return json.token;
      } else {
        // Refresh token is invalid or expired, user needs to log in again
        context.dispatch({ type: 'LOGOUT' });
        toast.error('Your session has expired. Please log in again.');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      context.dispatch({ type: 'LOGOUT' });
      toast.error('An error occurred. Please log in again.');
      return null;
    }
  };

  return { ...context, refreshUserToken };
};