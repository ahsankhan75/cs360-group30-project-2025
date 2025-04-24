import { createContext, useReducer, useEffect } from 'react';

export const HospitalAdminAuthContext = createContext();

export const hospitalAdminAuthReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { hospitalAdmin: action.payload };
    case 'LOGOUT':
      return { hospitalAdmin: null };
    case 'UPDATE_TOKEN':
      return {
        hospitalAdmin: {
          ...state.hospitalAdmin,
          token: action.payload
        }
      };
    default:
      return state;
  }
};

export const HospitalAdminAuthContextProvider = ({ children }) => {
  // Initialize state with data from localStorage if available
  const initialState = () => {
    try {
      const storedHospitalAdmin = localStorage.getItem('hospitalAdmin');
      if (storedHospitalAdmin) {
        const parsedAdmin = JSON.parse(storedHospitalAdmin);
        if (parsedAdmin && parsedAdmin.token) {
          return { hospitalAdmin: parsedAdmin };
        }
      }
    } catch (error) {
      console.error('Error parsing stored hospital admin data:', error);
      localStorage.removeItem('hospitalAdmin');
    }
    return { hospitalAdmin: null };
  };

  const [state, dispatch] = useReducer(hospitalAdminAuthReducer, initialState());

  // Update localStorage when state changes
  useEffect(() => {
    if (state.hospitalAdmin) {
      localStorage.setItem('hospitalAdmin', JSON.stringify(state.hospitalAdmin));
    } else {
      localStorage.removeItem('hospitalAdmin');
    }
  }, [state.hospitalAdmin]);

  console.log('HospitalAdminAuthContext state:', state);

  return (
    <HospitalAdminAuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </HospitalAdminAuthContext.Provider>
  );
};