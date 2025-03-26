import logo from './logo.svg';
import './App.css';
import './signup.css'


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Home Page</h1>
            <p>Welcome to the home page.</p>
        </div>
    );
}

function About() {
    return (
        <div>
            <h1>About Page</h1>
            <p>This is the about page.</p>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

            </Routes>
        </Router>
    );
}


function Login() {
  return (
    <div className="App">
      {/* HEADER / NAVBAR */}
      <header className="header">
      <svg
        className="svg-shape svg-top-right"
        viewBox="0 0 601 663"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M548.129 465.855C608.427 438.934 619.44 358.033 568.533 315.974L211.585 21.0682C157.799 -23.3691 76.1227 8.5447 66.7118 77.6753L0.869375 561.34C-8.54154 630.47 61.6316 683.056 125.339 654.613L548.129 465.855Z"
          fill="#0694A2"
          fillOpacity="0.8"
        />
      </svg>
      <div className="logo-and-nav">
        {/* Logo */}
        <div className="logo">
          <img src="/kk.png" alt="EMCON Logo" className="logo-img" />
        </div>

        {/* Navigation Links (Moved Beside Logo) */}
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#find-hospitals">Find Hospitals</a>
          <a href="#insurance">Insurance</a>
          <a href="#donations">Donations</a>
          <a href="#medical-card">Medical Card</a>
        </nav>
      </div>
    </header>

      
      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Background Shapes */}
        <div className="shape shape-left"></div>
        <div className="shape shape-right"></div>
        <svg
          className="svg-shape svg-orange-right"
          viewBox="0 0 322 423"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.672 229.461C-6.19081 214.725 -4.62458 179.499 20.4604 166.747L339.58 4.52777C364.157 -7.96527 392.994 10.5609 391.771 38.0574L376.224 387.744C375.001 415.24 344.623 431.366 321.244 416.928L17.672 229.461Z"
            fill="#F76700"
            fillOpacity="0.37"
          />
        </svg>
        <svg
        className="svg-shape svg-large-left"
        viewBox="0 0 645 1073"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-178.959 631.137C-247.294 586.549 -247.294 486.451 -178.959 441.863L469.501 18.7549C544.664 -30.2875 644.25 23.6442 644.25 113.391L644.25 959.609C644.25 1049.36 544.664 1103.29 469.501 1054.25L-178.959 631.137Z"
          fill="#0694A2"
          fillOpacity="0.37"
        />
      </svg>

        <svg
        className="svg-shape svg-bottom-left"
        viewBox="0 0 414 667"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M373.053 400.435C428.469 364.525 426.855 282.893 370.063 249.202L-28.1505 12.9649C-88.1544 -22.6319 -163.922 21.5139 -162.542 91.2685L-152.893 579.299C-151.513 649.053 -74.0605 690.169 -15.5106 652.228L373.053 400.435Z"
          fill="#0694A2"
          fillOpacity="0.37"
        />
      </svg>

        {/* Back Arrow */}
        <div className="back-arrow">
          <span className="arrow">&larr;</span>
        </div>

        {/* Sign-In Form */}
        <div className="signin-container">
          <img src="/kk.png" alt="EMCON Logo" className="signin-logo" />
          <h2>Sign In as a User</h2>
          <form className="signin-form">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="Enter your username"
            />

            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your password"
            />

            <div className="admin-link">
              <a href="#hospital-admin">Sign in as Hospital Admin instead?</a>
            </div>

            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <h1>EMCON</h1>
          <p>Smart healthcare navigation for everyone!</p>
          <div className="social-icons">
          </div>
        </div>

        <div className="footer-bottom">
          <nav className="footer-links">
            <a href="#home">Find Hospitals</a>
            <a href="#insurance">Insurance</a>
            <a href="#donations">Donations</a>
            <a href="#medical-card">Medical Card</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}


function Signup() {
  return (
    <div className="signup-app">
      {/* HEADER / NAVBAR */}
      <header className="signup-header">
        <svg
          className="signup-svg-shape signup-svg-top-right"
          viewBox="0 0 601 663"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M548.129 465.855C608.427 438.934 619.44 358.033 568.533 315.974L211.585 21.0682C157.799 -23.3691 76.1227 8.5447 66.7118 77.6753L0.869375 561.34C-8.54154 630.47 61.6316 683.056 125.339 654.613L548.129 465.855Z"
            fill="#0694A2"
            fillOpacity="0.8"
          />
        </svg>
        <div className="signup-logo-and-nav">
          {/* Logo */}
          <div className="signup-logo">
            <img src="/kk.png" alt="EMCON Logo" className="signup-logo-img" />
          </div>

          {/* Navigation Links */}
          <nav className="signup-nav-links">
            <a href="#home">Home</a>
            <a href="#find-hospitals">Find Hospitals</a>
            <a href="#insurance">Insurance</a>
            <a href="#donations">Donations</a>
            <a href="#medical-card">Medical Card</a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="signup-main-content">
        {/* Background Shapes */}
        <div className="signup-shape signup-shape-left"></div>
        <div className="signup-shape signup-shape-right"></div>
        <svg
          className="signup-svg-shape signup-svg-orange-right"
          viewBox="0 0 322 423"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.672 229.461C-6.19081 214.725 -4.62458 179.499 20.4604 166.747L339.58 4.52777C364.157 -7.96527 392.994 10.5609 391.771 38.0574L376.224 387.744C375.001 415.24 344.623 431.366 321.244 416.928L17.672 229.461Z"
            fill="#F76700"
            fillOpacity="0.37"
          />
        </svg>
        <svg
          className="signup-svg-shape signup-svg-large-left"
          viewBox="0 0 645 1073"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-178.959 631.137C-247.294 586.549 -247.294 486.451 -178.959 441.863L469.501 18.7549C544.664 -30.2875 644.25 23.6442 644.25 113.391L644.25 959.609C644.25 1049.36 544.664 1103.29 469.501 1054.25L-178.959 631.137Z"
            fill="#0694A2"
            fillOpacity="0.37"
          />
        </svg>
        <svg
          className="signup-svg-shape signup-svg-bottom-left"
          viewBox="0 0 414 667"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M373.053 400.435C428.469 364.525 426.855 282.893 370.063 249.202L-28.1505 12.9649C-88.1544 -22.6319 -163.922 21.5139 -162.542 91.2685L-152.893 579.299C-151.513 649.053 -74.0605 690.169 -15.5106 652.228L373.053 400.435Z"
            fill="#0694A2"
            fillOpacity="0.37"
          />
        </svg>

        {/* Back Arrow (Optional) */}
        <div className="signup-back-arrow">
          <span className="signup-arrow">&larr;</span>
        </div>

        {/* Sign-Up Form */}
        <div className="signup-form-container">
          <img src="/kk.png" alt="EMCON Logo" className="signup-form-logo" />
          <h2>Sign Up as a User</h2>
          <form className="signup-form">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="Enter your full name"
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
            />
             <p className="signup-already-user">
              <a href="/login">Already a user?</a>
            </p>

            <button type="submit" className="signup-submit-btn">
              Sign Up
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="signup-footer">
        <div className="signup-footer-top">
          <h1>EMCON</h1>
          <p>Smart healthcare navigation for everyone!</p>
          <div className="signup-social-icons"></div>
        </div>

        <div className="signup-footer-bottom">
          <nav className="signup-footer-links">
            <a href="#home">Find Hospitals</a>
            <a href="#insurance">Insurance</a>
            <a href="#donations">Donations</a>
            <a href="#medical-card">Medical Card</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}


export default App;
