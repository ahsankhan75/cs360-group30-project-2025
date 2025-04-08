// File: hooks/useAdminLogin.js
import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useAdminLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  const adminLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);

    // Call the admin login endpoint
    const response = await fetch("/api/user/adminLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    } else {
      // Save admin login data to local storage (using a different key if desired)
      localStorage.setItem("user", JSON.stringify(json));
      dispatch({ type: "LOGIN", payload: json });
      setIsLoading(false);
    }
  };

  return { adminLogin, isLoading, error };
};
