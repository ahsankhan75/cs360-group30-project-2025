import { useAuthContext } from "../hooks/useAuthContext";
import ProfileIcon from "../components/profile-icon";
import { useEffect, useState } from "react";

const DigitalMedicalCardDisplay = ({ data }) => (
  <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-10 mb-10 space-y-6">
    <ProfileIcon />
    <h2 className="text-2xl font-bold text-teal-500 mb-6">
      Your Digital Medical Card
    </h2>

    {/* Left big vertical card */}
    <div className="flex space-x-6">
      <div className="w-1/2 bg-orange-200 p-6 rounded-lg shadow-lg space-y-4">
        <h3 className="text-xl font-bold text-teal-500">
          Personal Information
        </h3>
        <p className="text-teal-500">
          <strong>Date of Birth:</strong>{" "}
          {new Date(data.dateOfBirth).toLocaleDateString()}
        </p>
        <p className="text-teal-500">
          <strong>Age:</strong> {data.age}
        </p>
        <p className="text-teal-500">
          <strong>Gender:</strong> {data.gender}
        </p>
        <p className="text-teal-500">
          <strong>Contact Number:</strong> {data.userContactNumber}
        </p>
      </div>

      {/* Medical Information Card */}
      <div className="w-1/2 bg-orange-200 p-6 rounded-lg shadow-lg space-y-4">
        <h3 className="text-xl font-bold text-teal-500">Medical Information</h3>
        <p className="text-teal-500">
          <strong>Blood Type:</strong> {data.bloodType}
        </p>
        <p className="text-teal-500">
          <strong>Organ Donor:</strong> {data.organDonor ? "Yes" : "No"}
        </p>
        <p className="text-teal-500">
          <strong>Allergies:</strong> {data.allergies}
        </p>
        <p className="text-teal-500">
          <strong>Current Medications:</strong> {data.currentMedications}
        </p>
        <p className="text-teal-500">
          <strong>Medical Devices/Implants:</strong>{" "}
          {data.medicalDevicesImplants}
        </p>
        <p className="text-teal-500">
          <strong>Recent Surgery/Hospitalization:</strong>{" "}
          {data.recentSurgeryHospitalization}
        </p>
        <p className="text-teal-500">
          <strong>Dietary Restrictions:</strong> {data.dietaryRestrictions}
        </p>
      </div>
    </div>

    {/* Right side cards */}
    <div className="flex space-x-6">
      {/* Current Medications Card */}
      <div className="w-1/3 bg-orange-200 p-6 rounded-lg shadow-lg space-y-4">
        <h3 className="text-xl font-bold text-teal-500">Current Medications</h3>
        <p className="text-teal-500">
          {data.currentMedications.split(",").map((med, idx) => (
            <span key={idx} className="block">
              {med.trim()}
            </span>
          ))}
        </p>
      </div>

      {/* Emergency Contacts Card */}
      <div className="w-1/3 bg-orange-200 p-6 rounded-lg shadow-lg space-y-4">
        <h3 className="text-xl font-bold text-teal-500">Emergency Contacts</h3>
        <div className="space-y-2">
          <p className="text-teal-500">
            <strong>Primary</strong>
          </p>
          <p className="text-teal-500">
            <strong>Name:</strong> {data.primaryEmergencyContact.name}
          </p>
          <p className="text-teal-500">
            <strong>Relationship:</strong>{" "}
            {data.primaryEmergencyContact.relationship}
          </p>
          <p className="text-teal-500">
            <strong>Contact:</strong> {data.primaryEmergencyContact.number}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-teal-500">
            <strong>Secondary</strong>
          </p>
          <p className="text-teal-500">
            <strong>Name:</strong> {data.secondaryEmergencyContact.name}
          </p>
          <p className="text-teal-500">
            <strong>Relationship:</strong>{" "}
            {data.secondaryEmergencyContact.relationship}
          </p>
          <p className="text-teal-500">
            <strong>Contact:</strong> {data.secondaryEmergencyContact.number}
          </p>
        </div>
      </div>

      {/* Insurance Information Card */}
      <div className="w-1/3 bg-orange-200 p-6 rounded-lg shadow-lg space-y-4">
        <h3 className="text-xl font-bold text-teal-500">
          Insurance Information
        </h3>
        <p className="text-teal-500">
          <strong>Provider:</strong> {data.insurance.provider}
        </p>
        <p className="text-teal-500">
          <strong>Policy Number:</strong> {data.insurance.policyNumber}
        </p>
        <p className="text-teal-500">
          <strong>Group Number:</strong> {data.insurance.groupNumber}
        </p>
      </div>
    </div>

    {/* Primary Physician Card */}
    <div className="w-full bg-orange-200 p-6 rounded-lg shadow-lg space-y-4 mt-6">
      <h3 className="text-xl font-bold text-teal-500">Primary Physician</h3>
      <p className="text-teal-500">
        <strong>Name:</strong> {data.primaryPhysician.name}
      </p>
      <p className="text-teal-500">
        <strong>Specialization:</strong> {data.primaryPhysician.specialization}
      </p>
      <p className="text-teal-500">
        <strong>Contact Number:</strong> {data.primaryPhysician.contact}
      </p>
    </div>
  </div>
);

const DigitalMedicalCardForm = () => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
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

    primaryEmergencyContact: {
      name: "",
      relationship: "",
      number: "",
    },

    secondaryEmergencyContact: {
      name: "",
      relationship: "",
      number: "",
    },

    insurance: {
      provider: "",
      policyNumber: "",
      groupNumber: "",
    },

    primaryPhysician: {
      name: "",
      specialization: "",
      contact: "",
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "dob") {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: age.toString(),
      }));
      return;
    }

    if (name.includes("primaryPhysician.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        primaryPhysician: {
          ...prev.primaryPhysician,
          [field]: value,
        },
      }));
    } else if (name.includes("primaryEmergencyContact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        primaryEmergencyContact: {
          ...prev.primaryEmergencyContact,
          [field]: value,
        },
      }));
    } else if (name.includes("secondaryEmergencyContact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        secondaryEmergencyContact: {
          ...prev.secondaryEmergencyContact,
          [field]: value,
        },
      }));
    } else if (name.includes("insurance.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const [existingCard, setExistingCard] = useState(null);

  useEffect(() => {
    const fetchMedicalCard = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/medical-card`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data) setExistingCard(data);
        }
      } catch (error) {
        console.error("Error fetching medical card:", error);
      }
    };

    fetchMedicalCard();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to submit the form.");
      return;
    }

    try {
      const response = await fetch("/api/medical-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ ...formData, email: user.email }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to submit the form");
      }

      alert("Digital Medical Card submitted successfully!");
    } catch (error) {
      console.error("Submission error: ", error.message);
      alert(error.message);
    }
  };

  if (existingCard) {
    return <DigitalMedicalCardDisplay data={existingCard} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-10 mb-10">
      <ProfileIcon />
      <h2 className="text-2xl font-bold text-teal-500 mb-6">
        Create Digital Medical Card
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Date of Birth"
            name="dob"
            value={formData.dateOfBirth}
            onChange={handleChange}
            type="date"
          />
          <InputField
            label="Age (auto-calculated)"
            name="age"
            value={formData.age}
            onChange={handleChange}
            disabled
          />
          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={["Male", "Female", "Other"]}
          />
          <InputField
            label="User Contact Number"
            name="userContactNumber"
            value={formData.userContactNumber}
            onChange={handleChange}
          />
        </div>

        {/* Medical Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Blood Type"
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
          />
          <CheckboxField
            label="Organ Donor"
            name="organDonor"
            checked={formData.organDonor}
            onChange={handleChange}
          />
          <InputField
            label="Allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
          />
          <InputField
            label="Current Medications"
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
          />
          <InputField
            label="Medical Devices & Implants"
            name="medicalDevicesImplants"
            value={formData.medicalDevicesImplants}
            onChange={handleChange}
          />
          <InputField
            label="Recent Surgery/Hospitalization"
            name="recentSurgeryHospitalization"
            value={formData.recentSurgeryHospitalization}
            onChange={handleChange}
          />
          <InputField
            label="Dietary Restrictions"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
          />
        </div>

        {/* Emergency Contacts */}
        <h3 className="text-lg font-semibold text-gray-800 mt-4">
          Primary Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Name"
            name="primaryEmergencyContact.name"
            value={formData.primaryEmergencyContact.name}
            onChange={handleChange}
          />
          <InputField
            label="Relationship"
            name="primaryEmergencyContact.relationship"
            value={formData.primaryEmergencyContact.relationship}
            onChange={handleChange}
          />
          <InputField
            label="Contact Number"
            name="primaryEmergencyContact.number"
            value={formData.primaryEmergencyContact.number}
            onChange={handleChange}
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mt-4">
          Secondary Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Name"
            name="secondaryEmergencyContact.name"
            value={formData.secondaryEmergencyContact.name}
            onChange={handleChange}
          />
          <InputField
            label="Relationship"
            name="secondaryEmergencyContact.relationship"
            value={formData.secondaryEmergencyContact.relationship}
            onChange={handleChange}
          />
          <InputField
            label="Contact Number"
            name="secondaryEmergencyContact.number"
            value={formData.secondaryEmergencyContact.number}
            onChange={handleChange}
          />
        </div>

        {/* Insurance */}
        <h3 className="text-lg font-semibold text-gray-800 mt-4">
          Insurance Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Insurance Provider"
            name="insurance.provider"
            value={formData.insurance.provider}
            onChange={handleChange}
          />
          <InputField
            label="Policy Number"
            name="insurance.policyNumber"
            value={formData.insurance.policyNumber}
            onChange={handleChange}
          />
          <InputField
            label="Group Number"
            name="insurance.groupNumber"
            value={formData.insurance.groupNumber}
            onChange={handleChange}
          />
        </div>

        {/* Physician */}
        <h3 className="text-lg font-semibold text-gray-800 mt-4">
          Primary Physician
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Physician Name"
            name="primaryPhysician.name"
            value={formData.primaryPhysician.name}
            onChange={handleChange}
          />
          <InputField
            label="Specialization"
            name="primaryPhysician.specialization"
            value={formData.primaryPhysician.specialization}
            onChange={handleChange}
          />
          <InputField
            label="Contact Number"
            name="primaryPhysician.contact"
            value={formData.primaryPhysician.contact}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-3 rounded"
        >
          Submit Card
        </button>
      </form>
    </div>
  );
};

export default DigitalMedicalCardForm;

// Reusable Components
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
}) => (
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
      className="w-full p-2 border border-gray-300 rounded-md"
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
      className="mr-2"
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
      className="w-full p-2 border border-gray-300 rounded-md"
    >
      <option value="">Select {label}</option>
      {options &&
        options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
    </select>
  </div>
);
