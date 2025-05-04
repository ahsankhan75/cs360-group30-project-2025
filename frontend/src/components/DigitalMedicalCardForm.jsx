import { useAuthContext } from "../hooks/useAuthContext";
import ProfileIcon1 from "../components/profile-icon";
import { useEffect, useState, useRef } from "react";
import Notification from "./Notification";
import { motion, AnimatePresence } from "framer-motion";
import { useMotionValue } from "framer-motion";
import Footer from "../components/Footer";


// Simple icon components to replace react-icons



const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z" />
    <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
  </svg>
);



// Reusable Components
const InputField = ({ label, name, value, onChange, type = "text", disabled = false }) => (
  <div>
    <label htmlFor={name} className="block text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
    />
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <div className="flex items-center mt-2">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      className="mr-2 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
    />
    <label htmlFor={name} className="text-gray-700">
      {label}
    </label>
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-gray-700 mb-1">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      <option value="">Select {label}</option>
      {options && options.map((option, idx) => <option key={idx} value={option}>{option}</option>)}
    </select>
  </div>
);

const ProfileIcon = ({ profilePicture, onEditPicture = null, onRemovePicture = null, name = "" }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : "";
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="relative">
      <div className="w-40 h-40 bg-blue-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
        {profilePicture ? (
          <img
            src={profilePicture.startsWith("http") ? profilePicture : `${window.location.origin.includes("localhost") ? "http://localhost:4000" : ""}${profilePicture}`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-teal-600 text-white flex items-center justify-center">
            {firstLetter ? (
              <span className="text-6xl font-bold">{firstLetter}</span>
            ) : (
              <div className="w-24 h-24 bg-orange-300 rounded-full"></div>
            )}
          </div>
        )}
      </div>
      {onEditPicture && (
        <div className="absolute -bottom-3 right-0 flex space-x-2">
          {profilePicture && onRemovePicture && (
            <button onClick={onRemovePicture} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-md" title="Remove profile picture">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
              </svg>
            </button>
          )}
          <button onClick={onEditPicture} className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 shadow-md" title="Change profile picture">
            <CameraIcon />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export const DigitalMedicalCardDisplay = ({ data, onEdit }) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [shinePosition, setShinePosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    // Only apply rotation effect on non-mobile devices
    if (window.innerWidth > 768) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rotateY.set(((x - rect.width / 2) / rect.width) * 20);
    rotateX.set(((rect.height / 2 - y) / rect.height) * 20);
      setShinePosition({ x, y });
    }
  };

  return (
    <div
      style={{ perspective: window.innerWidth > 768 ? 1200 : 'none' }}
      className="min-h-screen bg-gradient-to-br from-teal-100 to-orange-50 flex items-center justify-center p-4 md:p-6 relative overflow-hidden"
    >
      {/* Enhanced Animated Background Elements - Mobile Optimized */}
      {[...Array(window.innerWidth > 768 ? 12 : 6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute opacity-10 md:opacity-20"
          style={{
            width: `${window.innerWidth > 768 ? 40 + Math.random() * 40 : 20 + Math.random() * 20}px`,
            height: `${window.innerWidth > 768 ? 40 + Math.random() * 40 : 20 + Math.random() * 20}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            background: i % 2 === 0 ? "rgba(0, 79, 72, 0.2)" : "rgba(201, 101, 19, 0.2)",
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            zIndex: 0,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Medical Cross Elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`cross-${i}`}
          className="absolute opacity-10"
          style={{
            width: `${20 + Math.random() * 20}px`,
            height: `${20 + Math.random() * 20}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            background: "rgba(0, 79, 72, 0.1)",
            zIndex: 0,
          }}
          animate={{
            rotate: [0, 180],
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full relative">
            <div className="absolute w-full h-1 bg-teal-600 top-1/2 transform -translate-y-1/2"></div>
            <div className="absolute h-full w-1 bg-teal-600 left-1/2 transform -translate-x-1/2"></div>
          </div>
        </motion.div>
      ))}

      {/* Pulse Circles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${100 + Math.random() * 100}px`,
            height: `${100 + Math.random() * 100}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            border: "2px solid rgba(0, 79, 72, 0.1)",
            zIndex: 0,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main Card */}
      <motion.div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          transform: window.innerWidth > 768 ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : 'none',
          transition: 'transform 0.1s ease-out'
        }}
        onMouseMove={handleMouse}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (window.innerWidth > 768) {
          rotateX.set(0);
          rotateY.set(0);
          }
        }}
      >
        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${shinePosition.x}px ${shinePosition.y}px, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%)`,
            opacity: isHovered ? 0.5 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 1
          }}
        />

        {/* Card Header with Medical ID - Mobile Optimized */}
        <motion.div
          className="relative p-4 md:p-6 bg-gradient-to-r from-teal-300 to-orange-200"
          animate={{
            background: isHovered && window.innerWidth > 768
              ? "linear-gradient(45deg, #4FD1C5, #F6AD55)"
              : "linear-gradient(45deg, #38B2AC, #ED8936)"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: window.innerWidth > 768 ? 360 : 0 }}
                transition={{ duration: 1 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="w-full h-full">
                  {data.profilePicture ? (
                    <img
                      src={data.profilePicture.startsWith("http") ? data.profilePicture : `${window.location.origin.includes("localhost") ? "http://localhost:4000" : ""}${data.profilePicture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-teal-600 text-white flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-bold">{data.name ? data.name.charAt(0).toUpperCase() : '?'}</span>
                    </div>
                  )}
                </div>
              </motion.div>
              <div>
                <motion.h2
                  className="text-xl md:text-2xl font-bold text-teal-600"
                  whileHover={{ scale: window.innerWidth > 768 ? 1.05 : 1 }}
                >
                  {data.name}
                </motion.h2>
                <div className="flex flex-col md:flex-row md:space-x-4 text-sm text-gray-600">
                  <span>ID: {data._id?.slice(-8) || 'N/A'}</span>
                  <span>DOB: {new Date(data.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white px-3 py-2 rounded-lg shadow-md inline-block">
                <span className="text-xs md:text-sm font-medium text-gray-600">Blood Type</span>
                <div className="text-lg md:text-xl font-bold text-red-600">{data.bloodType || 'N/A'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Vital Information */}
            <motion.div
              className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm"
              whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-teal-600 mb-2 md:mb-3 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vital Information
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Age</span>
                  <div className="text-sm md:text-base font-medium">{data.age || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Gender</span>
                  <div className="text-sm md:text-base font-medium">{data.gender || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Contact</span>
                  <div className="text-sm md:text-base font-medium">{data.userContactNumber || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Organ Donor</span>
                  <div className={`text-sm md:text-base font-medium ${data.organDonor ? 'text-green-600' : 'text-red-600'}`}>
                    {data.organDonor ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Medical History */}
            <motion.div
              className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm"
              whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-teal-600 mb-2 md:mb-3 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Medical History
              </h3>
              <div className="space-y-2">
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Allergies</span>
                  <div className="text-sm md:text-base font-medium">{data.allergies || 'None reported'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Medical Devices/Implants</span>
                  <div className="text-sm md:text-base font-medium">{data.medicalDevicesImplants || 'None reported'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Recent Surgery</span>
                  <div className="text-sm md:text-base font-medium">{data.recentSurgeryHospitalization || 'None reported'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Dietary Restrictions</span>
                  <div className="text-sm md:text-base font-medium">{data.dietaryRestrictions || 'None reported'}</div>
                </div>
              </div>
            </motion.div>

            {/* Current Medications */}
            <motion.div
              className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm"
              whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-teal-600 mb-2 md:mb-3 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Current Medications
              </h3>
              <div className="space-y-2">
                {data.currentMedications
                  ? data.currentMedications.split(",").map((m, i) => (
                    <motion.div
                      key={i}
                      className="bg-white p-2 md:p-3 rounded-lg"
                      whileHover={{ x: 5 }}
                    >
                      <div className="text-sm md:text-base font-medium">{m.trim()}</div>
                    </motion.div>
                  ))
                  : <div className="bg-white p-2 md:p-3 rounded-lg text-gray-500">No current medications</div>}
              </div>
            </motion.div>
                </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Emergency Contacts */}
            <motion.div
              className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm"
              whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-teal-600 mb-2 md:mb-3 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Emergency Contacts
              </h3>
              <div className="space-y-2">
                <motion.div
                  className="bg-white p-2 md:p-3 rounded-lg"
                  whileHover={{ x: 5 }}
                >
                  <div className="text-xs md:text-sm text-gray-500">Primary Contact</div>
                  <div className="text-sm md:text-base font-medium">{data.primaryEmergencyContact.name}</div>
                  <div className="text-xs md:text-sm text-gray-600">{data.primaryEmergencyContact.relationship}</div>
                  <div className="text-xs md:text-sm text-teal-600">{data.primaryEmergencyContact.number}</div>
                </motion.div>
                {data.secondaryEmergencyContact.name && (
                  <motion.div
                    className="bg-white p-2 md:p-3 rounded-lg"
                    whileHover={{ x: 5 }}
                  >
                    <div className="text-xs md:text-sm text-gray-500">Secondary Contact</div>
                    <div className="text-sm md:text-base font-medium">{data.secondaryEmergencyContact.name}</div>
                    <div className="text-xs md:text-sm text-gray-600">{data.secondaryEmergencyContact.relationship}</div>
                    <div className="text-xs md:text-sm text-teal-600">{data.secondaryEmergencyContact.number}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Insurance Information */}
            <motion.div
              className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm"
              whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-teal-600 mb-2 md:mb-3 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Insurance Information
              </h3>
              <div className="space-y-2">
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Provider</span>
                  <div className="text-sm md:text-base font-medium">{data.insurance.provider || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Policy Number</span>
                  <div className="text-sm md:text-base font-medium">{data.insurance.policyNumber || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Group Number</span>
                  <div className="text-sm md:text-base font-medium">{data.insurance.groupNumber || 'N/A'}</div>
            </div>
          </div>
            </motion.div>

            {/* Primary Physician */}
            <motion.div
              className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm"
              whileHover={{ scale: window.innerWidth > 768 ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-teal-600 mb-2 md:mb-3 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Primary Physician
              </h3>
              <div className="space-y-2">
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Name</span>
                  <div className="text-sm md:text-base font-medium">{data.primaryPhysician.name || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Specialization</span>
                  <div className="text-sm md:text-base font-medium">{data.primaryPhysician.specialization || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 md:p-3 rounded-lg">
                  <span className="text-xs md:text-sm text-gray-500">Contact</span>
                  <div className="text-sm md:text-base font-medium">{data.primaryPhysician.contact || 'N/A'}</div>
            </div>
            </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Edit Button - Enhanced */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEdit}
        className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white p-4 rounded-full shadow-xl hover:bg-teal-700 focus:outline-none md:hidden"
        style={{
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}
        title="Edit Medical Card"
      >
        <EditIcon />
      </motion.button>

      {/* Desktop Edit Button - Unchanged */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEdit}
        className="fixed top-6 right-6 z-50 bg-teal-600 text-white p-4 rounded-full shadow-xl hover:bg-teal-700 focus:outline-none hidden md:block"
        style={{
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}
        title="Edit Medical Card"
      >
        <EditIcon />
      </motion.button>
    </div>
  );
};


const DigitalMedicalCardForm = () => {
  const { user } = useAuthContext();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    userContactNumber: "",
    bloodType: "",
    organDonor: false,
    allergies: "",
    currentMedications: "",
    medicalDevicesImplants: "",
    recentSurgeryHospitalization: "",
    dietaryRestrictions: "",
    primaryEmergencyContact: { name: "", relationship: "", number: "" },
    secondaryEmergencyContact: { name: "", relationship: "", number: "" },
    insurance: { provider: "", policyNumber: "", groupNumber: "" },
    primaryPhysician: { name: "", specialization: "", contact: "" },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "dob") {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setFormData(prev => ({ ...prev, dateOfBirth: value, age: age.toString() }));
      return;
    }
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [existingCard, setExistingCard] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/medical-card`, { headers: { Authorization: `Bearer ${user.token}` } });
        if (res.ok) {
          const data = await res.json();
          if (data) setExistingCard(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchCard();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setNotification({ message: "You must be logged in.", type: "error" }); return; }
    try {
      const method = existingCard ? "PUT" : "POST";
      const res = await fetch("/api/medical-card", {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ ...formData, email: user.email })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");
      setNotification({ message: existingCard ? "Updated successfully!" : "Submitted successfully!", type: "success" });
      if (isEditing) { setIsEditing(false); setExistingCard(json); }
    } catch (err) {
      console.error(err);
      setNotification({ message: err.message, type: "error" });
    }
  };

  const handleProfileUpload = async (e) => {
    if (!user) {
      setNotification({ message: "Log in to upload.", type: "error" });
      return;
    }

    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      setNotification({ message: "Invalid image.", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({ message: "Max 5MB.", type: "error" });
      return;
    }

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append("profilePicture", file);

      // First, upload the photo to the profile-photos collection
      const uploadRes = await fetch("/api/profile-photos", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: fd
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const uploadData = await uploadRes.json();

      // Then, update the medical card with the new photo path
      const updateRes = await fetch("/api/medical-card", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          profilePicture: uploadData.profilePhoto.path
        })
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.message || "Failed to update medical card");
      }

      const updateData = await updateRes.json();
      setExistingCard(updateData);
      setNotification({ message: "Profile picture uploaded successfully!", type: "success" });
      window.dispatchEvent(new CustomEvent("profilePictureChanged", {
        detail: { profilePicture: updateData.profilePicture }
      }));
    } catch (err) {
      console.error(err);
      setNotification({ message: err.message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProfile = async () => {
    if (!user) {
      setNotification({ message: "Log in to remove.", type: "error" });
      return;
    }

    try {
      setIsUploading(true);

      // First, update the medical card to remove the profile picture
      const updateRes = await fetch("/api/medical-card", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ profilePicture: "" })
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.message || "Failed to update medical card");
      }

      const updateData = await updateRes.json();
      setExistingCard(updateData);
      setNotification({ message: "Profile picture removed successfully!", type: "success" });
      window.dispatchEvent(new CustomEvent("profilePictureChanged", {
        detail: { profilePicture: "" }
      }));
    } catch (err) {
      console.error(err);
      setNotification({ message: err.message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFile = () => fileInputRef.current.click();
  const handleEdit = () => {
    if (existingCard) {
      setFormData({
        name: existingCard.name || "",
        dateOfBirth: existingCard.dateOfBirth ? new Date(existingCard.dateOfBirth).toISOString().split("T")[0] : "",
        age: existingCard.age || "",
        gender: existingCard.gender || "",
        userContactNumber: existingCard.userContactNumber || "",
        bloodType: existingCard.bloodType || "",
        organDonor: existingCard.organDonor || false,
        allergies: existingCard.allergies || "",
        currentMedications: existingCard.currentMedications || "",
        medicalDevicesImplants: existingCard.medicalDevicesImplants || "",
        recentSurgeryHospitalization: existingCard.recentSurgeryHospitalization || "",
        dietaryRestrictions: existingCard.dietaryRestrictions || "",
        primaryEmergencyContact: { ...existingCard.primaryEmergencyContact },
        secondaryEmergencyContact: { ...existingCard.secondaryEmergencyContact },
        insurance: { ...existingCard.insurance },
        primaryPhysician: { ...existingCard.primaryPhysician },
      });
    }
    setIsEditing(true);
  };
  const handleCancel = () => setIsEditing(false);

  if (existingCard && !isEditing) {
    return (
      <>
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        <input type="file" ref={fileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
        <DigitalMedicalCardDisplay data={existingCard} onEdit={handleEdit} />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-16 mb-16 relative"
    >
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <div className="flex items-start mb-8">
        <div>
          <ProfileIcon
            profilePicture={existingCard?.profilePicture}
            name={existingCard?.name || ""}
            onEditPicture={isEditing ? triggerFile : null}
            onRemovePicture={isEditing && existingCard?.profilePicture ? handleRemoveProfile : null}
          />
          <input type="file" ref={fileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
          {isUploading && <div className="text-sm text-teal-600 mt-2 text-center">Uploading...</div>}
        </div>
        <h2 className="text-3xl font-bold text-teal-500 ml-6 mt-4">
          {isEditing ? "Edit Medical Card" : "Create Medical Card"}
        </h2>
      </div>
      {isEditing && (
        <button onClick={handleCancel} className="absolute top-6 right-6 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
          Cancel
        </button>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Name" name="name" value={formData.name} onChange={handleChange} />
          <InputField label="Date of Birth" name="dob" type="date" value={formData.dateOfBirth} onChange={handleChange} />
          <InputField label="Age" name="age" value={formData.age} onChange={handleChange} disabled />
          <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
          <InputField label="Contact Number" name="userContactNumber" value={formData.userContactNumber} onChange={handleChange} />
        </div>
        {/* Medical Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <SelectField label="Blood Type" name="bloodType" value={formData.bloodType} onChange={handleChange} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
          <CheckboxField label="Organ Donor" name="organDonor" checked={formData.organDonor} onChange={handleChange} />
          <InputField label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
          <InputField label="Current Medications" name="currentMedications" value={formData.currentMedications} onChange={handleChange} />
          <InputField label="Devices & Implants" name="medicalDevicesImplants" value={formData.medicalDevicesImplants} onChange={handleChange} />
          <InputField label="Recent Surgery" name="recentSurgeryHospitalization" value={formData.recentSurgeryHospitalization} onChange={handleChange} />
          <InputField label="Dietary Restrictions" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} />
        </div>
        {/* Emergency Contacts */}
        <h3 className="text-xl font-bold text-gray-800">Primary Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Name" name="primaryEmergencyContact.name" value={formData.primaryEmergencyContact.name} onChange={handleChange} />
          <InputField label="Relationship" name="primaryEmergencyContact.relationship" value={formData.primaryEmergencyContact.relationship} onChange={handleChange} />
          <InputField label="Contact #" name="primaryEmergencyContact.number" value={formData.primaryEmergencyContact.number} onChange={handleChange} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Secondary Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Name" name="secondaryEmergencyContact.name" value={formData.secondaryEmergencyContact.name} onChange={handleChange} />
          <InputField label="Relationship" name="secondaryEmergencyContact.relationship" value={formData.secondaryEmergencyContact.relationship} onChange={handleChange} />
          <InputField label="Contact #" name="secondaryEmergencyContact.number" value={formData.secondaryEmergencyContact.number} onChange={handleChange} />
        </div>
        {/* Insurance */}
        <h3 className="text-xl font-bold text-gray-800">Insurance Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Provider" name="insurance.provider" value={formData.insurance.provider} onChange={handleChange} />
          <InputField label="Policy #" name="insurance.policyNumber" value={formData.insurance.policyNumber} onChange={handleChange} />
          <InputField label="Group #" name="insurance.groupNumber" value={formData.insurance.groupNumber} onChange={handleChange} />
        </div>
        {/* Physician */}
        <h3 className="text-xl font-bold text-gray-800">Primary Physician</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Name" name="primaryPhysician.name" value={formData.primaryPhysician.name} onChange={handleChange} />
          <InputField label="Specialization" name="primaryPhysician.specialization" value={formData.primaryPhysician.specialization} onChange={handleChange} />
          <InputField label="Contact #" name="primaryPhysician.contact" value={formData.primaryPhysician.contact} onChange={handleChange} />
        </div>
        <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl text-lg font-semibold hover:bg-teal-700 transition-shadow">
          {isEditing ? "Update Card" : "Submit Card"}
        </button>
      </form>
      <Footer />
    </motion.div>
  );
};

export default DigitalMedicalCardForm;
