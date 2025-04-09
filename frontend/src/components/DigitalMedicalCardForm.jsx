import { useAuthContext } from "../hooks/useAuthContext";
import ProfileIcon1 from "../components/profile-icon";
import { useEffect, useState } from "react";
const ProfileIcon = () => (
  <div className="w-32 h-32 bg-blue-100 rounded-full overflow-hidden mb-3 flex items-center justify-center">
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-blue-200 rounded-full"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-orange-300 rounded-full relative top-8"></div>
      </div>
    </div>
  </div>
);
const DigitalMedicalCardDisplay = ({ data }) => (
  <div className="bg-teal-500 min-h-screen p-8 flex justify-center">
    <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Header with logo and navigation is handled elsewhere */}
        <ProfileIcon1 />
        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Profile Section */}
          <div className="col-span-3">
            <div className="flex flex-col items-center mb-4">
              <ProfileIcon />
              <h2 className="text-teal-400 text-xl font-medium">{data.name}</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-3">
                <p className="text-gray-500 text-sm">Date Of Birth:</p>
                <p className="text-gray-700">
                  {new Date(data.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-gray-500 text-sm">Age:</p>
                <p className="text-gray-700">{data.age}</p>
              </div>
              <div className="mb-3">
                <p className="text-gray-500 text-sm">Gender:</p>
                <p className="text-gray-700">{data.gender}</p>
              </div>
              <div className="mb-3">
                <p className="text-gray-500 text-sm">Contact:</p>
                <p className="text-gray-700">{data.userContactNumber}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="col-span-4">
            <div className="bg-orange-100 p-4 rounded-md h-full">
              <h3 className="text-teal-500 font-medium text-lg mb-3">
                Medical Information
              </h3>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">Blood Type:</span>
                <span className="text-gray-700"> {data.bloodType}</span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">Organ Donor:</span>
                <span className="text-gray-700">
                  {" "}
                  {data.organDonor ? "Yes" : "No"}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">Allergies:</span>
                <span className="text-gray-700"> {data.allergies}</span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">
                  Current Medications:
                </span>
                <span className="text-gray-700">
                  {" "}
                  {data.currentMedications}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">
                  Medical Devices & Implants:
                </span>
                <span className="text-gray-700">
                  {" "}
                  {data.medicalDevicesImplants}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">
                  Recent Surgeries/Hospitalizations:
                </span>
                <span className="text-gray-700">
                  {" "}
                  {data.recentSurgeryHospitalization}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">
                  Dietary Restrictions:
                </span>
                <span className="text-gray-700">
                  {" "}
                  {data.dietaryRestrictions}
                </span>
              </div>
            </div>
          </div>

          {/* Current Medications */}
          <div className="col-span-5">
            <div className="bg-orange-100 p-4 rounded-md mb-4">
              <h3 className="text-teal-500 font-medium text-lg mb-3">
                Current Medications
              </h3>

              {data.currentMedications &&
                data.currentMedications.split(",").map((med, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="text-gray-700">{med.trim()}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="col-span-4">
            <div className="bg-orange-100 p-4 rounded-md h-full">
              <h3 className="text-teal-500 font-medium text-lg mb-3">
                Emergency Contacts
              </h3>

              <div className="mb-3">
                <p className="text-gray-700 font-medium">Primary:</p>
                <div className="ml-2">
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">Name:</span>
                    <span className="text-gray-700">
                      {" "}
                      {data.primaryEmergencyContact?.name}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">
                      Relationship:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      {data.primaryEmergencyContact?.relationship}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">Phone:</span>
                    <span className="text-gray-700">
                      {" "}
                      {data.primaryEmergencyContact?.number}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-gray-700 font-medium">Secondary:</p>
                <div className="ml-2">
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">Name:</span>
                    <span className="text-gray-700">
                      {" "}
                      {data.secondaryEmergencyContact?.name}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">
                      Relationship:
                    </span>
                    <span className="text-gray-700">
                      {" "}
                      {data.secondaryEmergencyContact?.relationship}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">Phone:</span>
                    <span className="text-gray-700">
                      {" "}
                      {data.secondaryEmergencyContact?.number}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="col-span-4">
            <div className="bg-orange-100 p-4 rounded-md h-full">
              <h3 className="text-teal-500 font-medium text-lg mb-3">
                Insurance Information
              </h3>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">
                  Insurance Provider:
                </span>
                <span className="text-gray-700">
                  {" "}
                  {data.insurance?.provider}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">
                  Policy Number:
                </span>
                <span className="text-gray-700">
                  {" "}
                  {data.insurance?.policyNumber}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">Group Number:</span>
                <span className="text-gray-700">
                  {" "}
                  {data.insurance?.groupNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Physician */}
          <div className="col-span-4">
            <div className="bg-orange-100 p-4 rounded-md h-full">
              <h3 className="text-teal-500 font-medium text-lg mb-3">
                Primary Physician
              </h3>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">Name:</span>
                <span className="text-gray-700">
                  {" "}
                  {data.primaryPhysician?.name}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">Specialty:</span>
                <span className="text-gray-700">
                  {" "}
                  {data.primaryPhysician?.specialization}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">Contact:</span>
                <span className="text-gray-700">
                  {" "}
                  {data.primaryPhysician?.contact}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
const DigitalMedicalCardForm = () => {
  const { user } = useAuthContext();
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
      <ProfileIcon1 />
      <ProfileIcon />
      <h2 className="text-2xl font-bold text-teal-500 mb-6">
        Create Digital Medical Card
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
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
