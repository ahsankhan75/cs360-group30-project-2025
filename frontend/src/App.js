import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

// pages & components
// import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import Hospitals from "./pages/Hospitals";
import Home from "./pages/Home";
import BloodRequestsPage from './pages/BloodRequestsPage'
// import "./Background.css";



function App() {
  const { user } = useAuthContext()
  console.log("Current User:", user);
  // if (user === null) {
  //   return <div>Loading...</div>; // This will handle the state until user info is loaded.
  // } // ----> Use this condition if there is a redirection problem
  return (
    <div className="App">
      {/* Background Shapes */}
      {/* <div className="background-container">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div> */}

      {/* Main Content */}
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
          <Route 
            path="/hospitals" 
            element={<Hospitals />} 
          />
             <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/hospitals" />} 
            />
            
            <Route 
              path="/signup" 
              element={!user ? <Signup /> : <Navigate to="/hospitals" />} 
            />
            <Route 
              path="/" 
              element={<Home />} 
            />
            <Route 
              path="/requests" 
              element={<BloodRequestsPage />} 
            />
            
            
            {/* <Route 
              path="/hospitals" 
              element={user ? <Hospitals /> : <Navigate to="/login" />} 
              // element={<Hospitals />} 
            /> */}
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
