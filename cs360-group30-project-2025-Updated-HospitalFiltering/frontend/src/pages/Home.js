import React, { useState } from "react";

const HoverMenu = ({ label, options }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "inline-block", marginRight: "10px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        style={{
          padding: "12px 30px",
          border: label === "Sign up" ? "2px solid #0694A2" : "none",
          color: label === "Sign up" ? "#0694A2" : "white",
          backgroundColor: label === "Sign up" ? "white" : "#0694A2",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600",
          cursor: "pointer"
        }}
      >
        {label}
      </button>
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 999,
            minWidth: "180px",
            textAlign: "left"
          }}
        >
          {options.map((opt, idx) => (
            <a
              key={idx}
              href={opt.href}
              style={{
                display: "block",
                padding: "10px 20px",
                color: "#0694A2",
                textDecoration: "none",
                fontWeight: "500"
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
            >
              {opt.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};



const Home = () => {
  // Adjustable position for the text and button block
  const textX = "-50px"; // left/right
  const textY = "20px";  // up/down

  const textContainerStyle = {
    width: "400px",
    textAlign: "left",
    transform: `translate(${textX}, ${textY})`,
    position: "absolute", // absolute positioning for total freedom
    right: "300px",        // anchor to the right edge
    top: "290px" ,     // base vertical offset
    zIndex: 10 
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", textAlign: "center", paddingTop: "80px", fontSize: "24px" }}>
      
      {/* ✅ SVG Background Shapes */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: -1 }}>
        <svg viewBox="0 0 998 1134" fill="none" xmlns="http://www.w3.org/2000/svg"
             style={{ position: "absolute", top: "-50px", left: "-100px", width: "700px" }}>
          <path d="M941.847 664.311C1016.12 620.619 1016.12 513.204 941.847 469.513L170.707 15.9077C95.3771 -28.4032 0.414215 25.911 0.414215 113.307V1020.52C0.414215 1107.91 95.3773 1162.23 170.707 1117.92L941.847 664.311Z" fill="#0694A2" fillOpacity="0.37"/>
        </svg>
        <svg viewBox="0 0 1019 1146" fill="none" xmlns="http://www.w3.org/2000/svg"
             style={{ position: "absolute", top: "100px", left: "-100px", width: "700px" }}>
          <path d="M968.83 640.743C1036.71 598.318 1033.97 498.546 963.857 459.805L156.378 13.5965C85.2747 -25.6945 -1.54765 27.1097 0.683496 108.288L26.3771 1043.12C28.6083 1124.3 118.204 1172.4 187.044 1129.37L968.83 640.743Z" fill="#0694A2" fillOpacity="0.37"/>
        </svg>
        <svg viewBox="0 0 593 637" fill="none" xmlns="http://www.w3.org/2000/svg"
             style={{ position: "absolute", top: "-10px", right:"-200px", width: "500px" ,zIndex: 100 }}>
          <path d="M456.724 626.835C515.471 656.989 585.443 614.914 586.356 548.886L592.691 90.7296C593.656 20.968 517.628 -22.7266 457.837 13.2263L43.8634 262.151C-15.9278 298.104 -12.9837 385.744 49.0856 417.603L456.724 626.835Z" fill="#C97602" fillOpacity="0.37"/>
        </svg>
        <svg viewBox="0 0 597 637" fill="none" xmlns="http://www.w3.org/2000/svg"
             style={{ position: "absolute", top: "200px", right: "-200px", width: "500px" }}>
          <path d="M471.739 628.952C532.062 655.814 599.603 609.938 596.867 543.961L577.882 86.1536C574.991 16.4453 496.666 -22.9825 438.952 16.2186L39.3625 287.633C-18.3513 326.834 -10.5701 414.178 53.1645 442.559L471.739 628.952Z" fill="#0694A2" fillOpacity="0.37"/>
        </svg>
      </div>

    

<div style={textContainerStyle}>
        <h1 style={{ fontWeight: "bold", fontSize: "48px", color: "#0694A2", marginBottom: "10px", letterSpacing: "2px" }}>
          EMCON
        </h1>
        <p style={{ color: "#0694A2", fontSize: "20px", marginBottom: "30px" }}>
          Smart healthcare navigation for everyone
        </p>

        <HoverMenu
          label="Sign up"
          options={[
            { label: "For Users", href: "/signup" },
            { label: "For Hospital Admin", href: "/signupasadmin" }
          ]}
        />

        <HoverMenu
          label="Login"
          options={[
            { label: "For Users", href: "/login" },
            { label: "For Hospital Admin", href: "/login" }
          ]}
        />
      </div>

      {/* ✅ Image in separate div */}
      <div style={{ position: "relative", marginTop: "30px", left: "200px" }}>
        <img 
          src="/doctors.png" 
          alt="Doctors" 
          style={{
            width: '700px',
            height: 'auto'
          }} 
        />
      </div>
    </div>
  );
};

export default Home;