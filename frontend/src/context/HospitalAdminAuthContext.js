import { createContext, useReducer, useEffect } from 'react';

export const HospitalAdminAuthContext = createContext();

export const hospitalAdminAuthReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { hospitalAdmin: action.payload };
    case 'LOGOUT':
      return { hospitalAdmin: null };
    default:
      return state;
  }
};

export const HospitalAdminAuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(hospitalAdminAuthReducer, {
    hospitalAdmin: null
  });

  // Check if we have a hospital admin in localStorage
  useEffect(() => {
    const hospitalAdmin = JSON.parse(localStorage.getItem('hospitalAdmin'));
    if (hospitalAdmin) {
      dispatch({ type: 'LOGIN', payload: hospitalAdmin });
    }
  }, []);

  console.log('HospitalAdminAuthContext state:', state);

  return (
    <HospitalAdminAuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </HospitalAdminAuthContext.Provider>
  );
};