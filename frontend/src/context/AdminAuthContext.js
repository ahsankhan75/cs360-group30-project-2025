import { createContext, useReducer, useEffect } from 'react';

export const AdminAuthContext = createContext();

export const adminReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { admin: action.payload }
    case 'LOGOUT':
      return { admin: null }
    default:
      return state
  }
}

export const AdminAuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, {
    admin: null
  });

  // Check if admin is logged in when app loads
  useEffect(() => {
    const admin = localStorage.getItem('adminUser');
    
    if (admin) {
      try {
        const parsedAdmin = JSON.parse(admin);
        dispatch({ type: 'LOGIN', payload: parsedAdmin });
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
