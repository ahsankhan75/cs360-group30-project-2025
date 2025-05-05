import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const HoverMenu = ({ label, options }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        marginRight: "10px",
        marginBottom: "10px"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          padding: "12px 30px",
          border: label === "Sign up" ? "2px solid #0694A2" : "none",
          color: label === "Sign up" ? "#0694A2" : "white",
          backgroundColor: label === "Sign up" ? "white" : "#0694A2",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer"
        }}
      >
        {label}
      </motion.button>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
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
        </motion.div>
      )}
    </div>
  );
};

const Section = ({ title, description, imageSrc, reverse = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : reverse ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "60px 5vw" : "100px 10vw",
        backgroundColor: "#fefefe",
        gap: isMobile ? "40px" : "80px"
      }}
    >
      <div style={{ flex: 1 }}>
        <h2 style={{ color: "#0694A2", fontSize: isMobile ? "26px" : "36px", marginBottom: "20px" }}>{title}</h2>
        <p style={{ fontSize: isMobile ? "16px" : "20px", color: "#333", lineHeight: "1.7" }}>{description}</p>
      </div>
      <motion.img
        src={imageSrc}
        alt={title}
        style={{ width: isMobile ? "90%" : "450px", borderRadius: "20px" }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      />
    </motion.div>
  );
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 12 } },
};

const HeroSectionMobile = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    style={{ padding: "60px 20px 40px", textAlign: "center", fontFamily: "Calibri, sans-serif" }}
  >
    {/* Hero Image with smooth pop animation */}
    <motion.img
      src="/hospitals.png"
      alt="Doctors"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, type: "spring", bounce: 0.3 }}
      style={{ width: "90%", margin: "0 auto 10px auto" }}
    />

    {/* Text and buttons container with stagger */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        variants={textVariants}
        style={{ fontSize: "32px", fontWeight: 600, color: "#0694A2", marginBottom: "10px" }}
      >
        EMCON
      </motion.h1>

      <motion.p
        variants={textVariants}
        style={{ fontSize: "16px", fontWeight: 400, color: "#0694A2", marginBottom: "20px" }}
      >
        Smart healthcare navigation for everyone
      </motion.p>

      <motion.div
        variants={containerVariants}
        style={{ display: "flex", justifyContent: "center", gap: "10px" }}
      >
        <motion.div variants={buttonVariants}>
          <HoverMenu
            label="Sign up"
            options={[
              { label: "For Users", href: "/signup" },
              { label: "For Hospital Admin", href: "/hospital-admin/signup" }
            ]}
          />
        </motion.div>

        <motion.div variants={buttonVariants}>
          <HoverMenu
            label="Login"
            options={[
              { label: "For Users", href: "/login" },
              { label: "For Hospital Admin", href: "/hospital-admin/login" }
            ]}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

const HeroSectionDesktop = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className="relative min-h-screen pt-20 text-2xl text-center"
  >
    {/* SVG Backgrounds for Desktop Only */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
      <motion.svg
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewBox="0 0 998 1134"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-12 -left-24 w-[700px]"
      >
        <path d="M941.847 664.311C1016.12 620.619 1016.12 513.204 941.847 469.513L170.707 15.9077C95.3771 -28.4032 0.414215 25.911 0.414215 113.307V1020.52C0.414215 1107.91 95.3773 1162.23 170.707 1117.92L941.847 664.311Z" fill="#0694A2" fillOpacity="0.37" />
      </motion.svg>
      <motion.svg
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2 }}
        viewBox="0 0 1019 1146"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-24 -left-24 w-[700px]"
      >
        <path d="M968.83 640.743C1036.71 598.318 1033.97 498.546 963.857 459.805L156.378 13.5965C85.2747 -25.6945 -1.54765 27.1097 0.683496 108.288L26.3771 1043.12C28.6083 1124.3 118.204 1172.4 187.044 1129.37L968.83 640.743Z" fill="#0694A2" fillOpacity="0.37" />
      </motion.svg>
      <motion.svg
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.3 }}
        viewBox="0 0 593 637"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-2 -right-48 w-[500px] z-[100]"
      >
        <path d="M456.724 626.835C515.471 656.989 585.443 614.914 586.356 548.886L592.691 90.7296C593.656 20.968 517.628 -22.7266 457.837 13.2263L43.8634 262.151C-15.9278 298.104 -12.9837 385.744 49.0856 417.603L456.724 626.835Z" fill="#C97602" fillOpacity="0.37" />
      </motion.svg>
      <motion.svg
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4 }}
        viewBox="0 0 597 637"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-48 -right-48 w-[500px]"
      >
        <path d="M471.739 628.952C532.062 655.814 599.603 609.938 596.867 543.961L577.882 86.1536C574.991 16.4453 496.666 -22.9825 438.952 16.2186L39.3625 287.633C-18.3513 326.834 -10.5701 414.178 53.1645 442.559L471.739 628.952Z" fill="#0694A2" fillOpacity="0.37" />
      </motion.svg>
    </div>

    {/* Hero Content Container - Using Tailwind Flex */}
    <div className="flex items-center px-16 mt-16 h-[70vh] justify-center">
      {/* Hero Image - On the left */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="flex justify-start items-center"
      >
        <img src="/doctors.png" alt="Doctors" className="w-auto h-auto max-w-[500px]" />
      </motion.div>

      {/* Hero Text - Right next to the logo */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-[400px] text-left z-10 flex flex-col justify-center ml-4"
      >
        <h1 className="font-bold text-5xl text-[#0694A2] mb-3 tracking-wider">
          EMCON
        </h1>
        <p className="text-[#0694A2] text-xl mb-8">Smart healthcare navigation for everyone</p>

        <div className="flex flex-wrap gap-2">
          <HoverMenu
            label="Sign up"
            options={[
              { label: "For Users", href: "/signup" },
              { label: "For Hospital Admin", href: "/hospital-admin/signup" }
            ]}
          />
          <HoverMenu
            label="Login"
            options={[
              { label: "For Users", href: "/login" },
              { label: "For Hospital Admin", href: "/hospital-admin/login" }
            ]}
          />
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div style={{ overflowX: "hidden" }}>
        {isMobile ? <HeroSectionMobile /> : <HeroSectionDesktop />}

        <Section
          title="Hospital Lookup & AI-based Time Estimation"
          description="Find nearby hospitals instantly and get AI-estimated wait times to optimize your visit experience."
          imageSrc="/hospital-ai.png"
        />
        <Section
          title="Blood Donation Requests"
          description="Browse and accept real-time blood donation requests around you. Be a lifesaver in moments of urgency."
          imageSrc="/blood-donation.png"
          reverse
        />
        <Section
          title="Digital Medical Card"
          description="Securely store your essential medical history, prescriptions, and allergies in one place. Your EMCON Medical Card makes it quick and easy to share vital information during emergencies or hospital visits."
          imageSrc="/med-card.png"
        />
        <Section
          title="Hospital Reviews & Feedback"
          description="Make informed choices by reading reviews from real patients. Rate and review your hospital visits."
          imageSrc="/hospital-reviews.png"
        />
      </div>
      {/* Desktop Footer */}
      <div className="hidden md:block"><Footer /></div>
      {/* Mobile Footer */}
      <footer className="bg-[#2a9fa7] text-white py-8 px-6 mt-20 flex flex-col items-center space-y-4 md:hidden z-10">
        <h1 className="text-xl font-bold">EMCON</h1>
        <nav className="flex flex-col items-center space-y-2 mt-2">
          <a href="/hospitals" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Find Hospitals</a>
          <a href="/blood-requests" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Blood Requests</a>
          <a href="/medical-card" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Medical Card</a>
          <a href="/reviews" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Reviews</a>
        </nav>
        <p className="text-sm text-center mt-4 opacity-80">Smart healthcare navigation for everyone!</p>
      </footer>
    </>
  );
};

export default Home;
