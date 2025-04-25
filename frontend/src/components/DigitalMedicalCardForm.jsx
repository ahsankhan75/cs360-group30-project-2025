
import { useAuthContext } from "../hooks/useAuthContext";
import ProfileIcon1 from "../components/profile-icon";
import { useEffect, useState, useRef } from "react";
import Notification from "./Notification";
import { motion, AnimatePresence } from "framer-motion";
import {useMotionValue } from "framer-motion";


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

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rotateY.set(((x - rect.width / 2) / rect.width) * 20);
    rotateX.set(((rect.height / 2 - y) / rect.height) * 20);
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="min-h-screen bg-gradient-to-br from-teal-100 to-orange-50 flex items-center justify-center p-6 relative overflow-hidden"
    >
      {/* 🎨 Triangle Background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-xl opacity-30 blur-xl"
          style={{
            width: `${60 + Math.random() * 40}px`,
            height: `${60 + Math.random() * 40}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            background: i % 2 === 0 ? "rgba(0, 79, 72, 0.4)" : "rgba(201, 101, 19, 0.4)",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            zIndex: 0,
          }}
          animate={{
            rotate: [0, 360],
            y: ["0%", "5%", "0%"],
          }}
          transition={{
            duration: 10 + i,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Card */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", zIndex: 10 }}
        onMouseMove={handleMouse}
        onMouseLeave={() => {
          rotateX.set(0);
          rotateY.set(0);
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
      >
        {/* Header gradient */}
        <div className="relative p-6 bg-gradient-to-r from-teal-300 to-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile column */}
            <div className="bg-white p-4 rounded-xl flex flex-col items-center">
              <ProfileIcon1 profilePicture={data.profilePicture} name={data.name} />
              <h2 className="mt-2 text-2xl font-bold text-teal-600">{data.name}</h2>
              <p className="text-gray-600 text-sm">{new Date(data.dateOfBirth).toLocaleDateString()}</p>
              <p className="text-gray-600 text-sm">Age: {data.age}</p>
              <p className="text-gray-600 text-sm">Gender: {data.gender}</p>
            </div>

            {/* Medical info */}
            <div className="bg-white p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Medical Information</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Blood Type:</span> {data.bloodType}</div>
                <div><span className="font-medium">Organ Donor:</span> {data.organDonor ? "Yes" : "No"}</div>
                <div><span className="font-medium">Allergies:</span> {data.allergies || "None"}</div>
                <div><span className="font-medium">Devices/Implants:</span> {data.medicalDevicesImplants || "None"}</div>
                <div><span className="font-medium">Recent Surgery:</span> {data.recentSurgeryHospitalization || "None"}</div>
                <div><span className="font-medium">Dietary Restrictions:</span> {data.dietaryRestrictions || "None"}</div>
              </div>
            </div>

            {/* Meds and contacts */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">Current Medications</h3>
                {data.currentMedications
                  ? data.currentMedications.split(",").map((m, i) => <div key={i}>{m.trim()}</div>)
                  : "None"}
              </div>
              <div className="bg-white p-4 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">Emergency Contacts</h3>
                <div>
                  <span className="font-medium">Primary:</span><br />
                  {data.primaryEmergencyContact.name} ({data.primaryEmergencyContact.relationship}) –{" "}
                  {data.primaryEmergencyContact.number}
                </div>
                {data.secondaryEmergencyContact.name && (
                  <div className="mt-2">
                    <span className="font-medium">Secondary:</span><br />
                    {data.secondaryEmergencyContact.name} ({data.secondaryEmergencyContact.relationship}) –{" "}
                    {data.secondaryEmergencyContact.number}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insurance & physician */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Insurance Information</h3>
              <div><span className="font-medium">Provider:</span> {data.insurance.provider}</div>
              <div><span className="font-medium">Policy #:</span> {data.insurance.policyNumber}</div>
              <div><span className="font-medium">Group #:</span> {data.insurance.groupNumber}</div>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Primary Physician</h3>
              <div><span className="font-medium">Name:</span> {data.primaryPhysician.name}</div>
              <div><span className="font-medium">Specialty:</span> {data.primaryPhysician.specialization}</div>
              <div><span className="font-medium">Contact:</span> {data.primaryPhysician.contact}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating action button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEdit}
        className="fixed top-6 right-6 z-50 bg-teal-600 text-white p-4 rounded-full shadow-xl hover:bg-teal-700 focus:outline-none"
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
        const res = await fetch(`/api/medical-card`, { headers: { Authorization: `Bearer ${user.token}` }});
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
    if (!user) { setNotification({ message: "Log in to upload.", type: "error" }); return; }
    const file = e.target.files[0]; if (!file || !file.type.startsWith("image/")) { setNotification({ message: "Invalid image.", type: "error" }); return; }
    if (file.size > 5 * 1024 * 1024) { setNotification({ message: "Max 5MB.", type: "error" }); return; }
    try { setIsUploading(true);
      const fd = new FormData(); fd.append("profilePicture", file);
      const res = await fetch("/api/medical-card/profile-picture", { method: "POST", headers: { Authorization: `Bearer ${user.token}` }, body: fd });
      const json = await res.json(); if (!res.ok) throw new Error(json.error || "Upload failed");
      setExistingCard(json.card);
      setNotification({ message: "Uploaded!", type: "success" });
      window.dispatchEvent(new CustomEvent("profilePictureChanged", { detail: { profilePicture: json.card.profilePicture } }));
    } catch (err) { console.error(err); setNotification({ message: err.message, type: "error" }); }
    finally { setIsUploading(false); }
  };

  const handleRemoveProfile = async () => {
    if (!user) { setNotification({ message: "Log in to remove.", type: "error" }); return; }
    try { setIsUploading(true);
      const res = await fetch("/api/medical-card/profile-picture", { method: "DELETE", headers: { Authorization: `Bearer ${user.token}` } });
      const json = await res.json(); if (!res.ok) throw new Error(json.error || "Remove failed");
      setExistingCard(json.card);
      setNotification({ message: "Removed!", type: "success" });
      window.dispatchEvent(new CustomEvent("profilePictureChanged", { detail: { profilePicture: "" } }));
    } catch (err) { console.error(err); setNotification({ message: err.message, type: "error" }); }
    finally { setIsUploading(false); }
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
          <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male","Female","Other"]} />
          <InputField label="Contact Number" name="userContactNumber" value={formData.userContactNumber} onChange={handleChange} />
        </div>
        {/* Medical Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <SelectField label="Blood Type" name="bloodType" value={formData.bloodType} onChange={handleChange} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} />
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
    </motion.div>
  );
};

export default DigitalMedicalCardForm;
