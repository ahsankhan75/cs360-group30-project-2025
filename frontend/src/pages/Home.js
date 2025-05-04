import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const HoverMenu = ({ label, options }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative inline-block mr-2 mb-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-lg font-semibold text-sm md:text-base ${
          label === "Sign up" 
            ? "border-2 border-teal-500 text-teal-500 bg-white" 
            : "bg-teal-500 text-white"
        }`}
      >
        {label}
      </motion.button>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-md z-50 min-w-[180px] text-left"
        >
          {options.map((opt, idx) => (
            <a
              key={idx}
              href={opt.href}
              className="block px-4 py-2 text-teal-500 font-medium hover:bg-gray-50 transition"
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-between py-12 md:py-24 px-5 md:px-20 bg-white gap-8 md:gap-16`}
    >
      <div className="flex-1">
        <h2 className="text-2xl md:text-3xl lg:text-4xl text-teal-500 font-bold mb-4">{title}</h2>
        <p className="text-base md:text-lg text-gray-700 leading-relaxed">{description}</p>
      </div>
      <motion.img
        src={imageSrc}
        alt={title}
        className="w-[90%] md:w-[400px] lg:w-[450px] rounded-xl"
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
    className="py-12 px-5 text-center"
  >
    {/* Hero Image with smooth pop animation */}
    <motion.img
      src="/hospitals.png"
      alt="Doctors"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, type: "spring", bounce: 0.3 }}
      className="w-[90%] mx-auto mb-3"
    />

    {/* Text and buttons container with stagger */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-4"
    >
      <motion.h1
        variants={textVariants}
        className="text-2xl md:text-3xl font-semibold text-teal-500 mb-2"
      >
        EMCON
      </motion.h1>

      <motion.p
        variants={textVariants}
        className="text-sm md:text-base text-teal-500 mb-4"
      >
        Smart healthcare navigation for everyone
      </motion.p>

      <motion.div
        variants={containerVariants}
        className="flex justify-center gap-2"
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
    className="relative min-h-screen pt-20 text-center flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 overflow-hidden"
  >
    {/* SVG Backgrounds for Desktop Only - using absolute positioning with Tailwind */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
      <motion.svg
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewBox="0 0 998 1134"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-[-50px] left-[-100px] w-[500px] md:w-[700px]"
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
        className="absolute top-[100px] left-[-100px] w-[500px] md:w-[700px]"
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
        className="absolute top-[-10px] right-[-100px] md:right-[-150px] lg:right-[-200px] w-[300px] md:w-[400px] lg:w-[500px] z-[5]"
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
        className="absolute top-[200px] right-[-100px] md:right-[-150px] lg:right-[-200px] w-[300px] md:w-[400px] lg:w-[500px]"
      >
        <path d="M471.739 628.952C532.062 655.814 599.603 609.938 596.867 543.961L577.882 86.1536C574.991 16.4453 496.666 -22.9825 438.952 16.2186L39.3625 287.633C-18.3513 326.834 -10.5701 414.178 53.1645 442.559L471.739 628.952Z" fill="#0694A2" fillOpacity="0.37" />
      </motion.svg>
    </div>

    {/* Hero Content - using flex layout with Tailwind */}
    <div className="flex flex-col md:flex-row items-center justify-between w-full">
      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full md:w-[400px] lg:w-[450px] text-left z-10 md:mr-8"
      >
        <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-teal-500 mb-2 md:mb-3 tracking-wide">
          EMCON
        </h1>
        <p className="text-teal-500 text-lg md:text-xl mb-6">Smart healthcare navigation for everyone</p>

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

      {/* Hero Image - positioned more to the right */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="mt-8 md:mt-0 md:ml-auto"
      >
        <img src="/doctors.png" alt="Doctors" className="w-[300px] md:w-[400px] lg:w-[500px] xl:w-[600px] h-auto" />
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
      <div className="overflow-x-hidden">
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
          reverse
        />
      </div>
      {/* Desktop Footer */}
      <div className="hidden md:block"><Footer /></div>
      {/* Mobile Footer */}
      <footer className="bg-teal-500 text-white py-8 px-6 mt-20 flex flex-col items-center space-y-4 md:hidden z-10">
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