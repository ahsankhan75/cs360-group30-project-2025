import { useAuthContext } from "../hooks/useAuthContext";
import ProfileIcon1 from "../components/profile-icon";
import { useEffect, useState, useRef } from "react";
import Notification from "./Notification";

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
const ProfileIcon = ({
  profilePicture,
  onEditPicture = null,
  onRemovePicture = null,
  name = "",
}) => {
  // Get first letter of name for avatar fallback
  const firstLetter = name ? name.charAt(0).toUpperCase() : "";

  return (
    <div className="relative">
      {/* Square image container with rounded corners */}
      <div className="w-40 h-40 bg-blue-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
        {profilePicture && profilePicture.length > 0 ? (
          <img
            src={
              profilePicture.startsWith("http")
                ? profilePicture
                : `${
                    window.location.origin.includes("localhost")
                      ? "http://localhost:4000"
                      : ""
                  }${profilePicture}`
            }
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-teal-600 text-white flex items-center justify-center">
            {firstLetter ? (
              <span className="text-6xl font-bold">{firstLetter}</span>
            ) : (
              <div className="w-24 h-24 bg-orange-300 rounded-full relative top-8"></div>
            )}
          </div>
        )}
      </div>

      {/* Edit button positioned below the image */}
      {onEditPicture && (
        <div className="absolute -bottom-3 right-0 flex space-x-2">
          {profilePicture && onRemovePicture && (
            <button
              onClick={onRemovePicture}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-md"
              title="Remove profile picture"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onEditPicture}
            className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors shadow-md"
            title="Change profile picture"
          >
            <CameraIcon />
          </button>
        </div>
      )}
    </div>
  );
};
const DigitalMedicalCardDisplay = ({ data, onEdit }) => (
  <div className="bg-orange-50 min-h-screen p-4 flex justify-center">
    <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg overflow-hidden">
      <div className="p-6 relative">
        {/* Edit Button - Positioned in the top right corner */}
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors shadow-md"
          aria-label="Edit medical card"
        >
          Edit
        </button>
        {/* Header with logo and navigation is handled elsewhere */}
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Section */}
          <div className="bg-orange-200 p-4 rounded-lg">
            <div className="flex flex-col items-center mb-4">
              <ProfileIcon
                profilePicture={data.profilePicture}
                name={data.name}
              />
              <h2 className="text-xl font-bold text-teal-600">{data.name}</h2>
            </div>

            <div className="mt-4">
              <div className="mb-2">
                <p className="text-gray-600 text-sm">Date Of Birth:</p>
                <p className="text-gray-800 font-medium">
                  {new Date(data.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-2">
                <p className="text-gray-600 text-sm">Age:</p>
                <p className="text-gray-800 font-medium">{data.age}</p>
              </div>
              <div className="mb-2">
                <p className="text-gray-600 text-sm">Gender:</p>
                <p className="text-gray-800 font-medium">{data.gender}</p>
              </div>
              <div className="mb-2">
                <p className="text-gray-600 text-sm">Contact:</p>
                <p className="text-gray-800 font-medium">
                  {data.userContactNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-orange-200 p-4 rounded-lg">
            <h3 className="text-teal-600 font-bold text-lg mb-3">
              Medical Information
            </h3>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Blood Type:</span>
              <span className="text-gray-700 ml-2">{data.bloodType}</span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Organ Donor:</span>
              <span className="text-gray-700 ml-2">
                {data.organDonor ? "Yes" : "No"}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Allergies:</span>
              <span className="text-gray-700 ml-2">{data.allergies}</span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">
                Medical Devices & Implants:
              </span>
              <span className="text-gray-700 ml-2">
                {data.medicalDevicesImplants || "None"}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">
                Recent Surgeries:
              </span>
              <span className="text-gray-700 ml-2">
                {data.recentSurgeryHospitalization || "None"}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">
                Dietary Restrictions:
              </span>
              <span className="text-gray-700 ml-2">
                {data.dietaryRestrictions || "None"}
              </span>
            </div>
          </div>

          {/* Current Medications & Emergency Contacts */}
          <div className="space-y-6">
            {/* Current Medications */}
            <div className="bg-orange-200 p-4 rounded-lg">
              <h3 className="text-teal-600 font-bold text-lg mb-3">
                Current Medications
              </h3>

              {data.currentMedications &&
              data.currentMedications.split(",").length > 0 ? (
                data.currentMedications.split(",").map((med, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="text-gray-700">{med.trim()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-700">No medications listed</p>
              )}
            </div>

            {/* Emergency Contacts */}
            <div className="bg-orange-200 p-4 rounded-lg">
              <h3 className="text-teal-600 font-bold text-lg mb-3">
                Emergency Contacts
              </h3>

              <div className="mb-3">
                <p className="text-gray-700 font-medium">Primary:</p>
                <div className="ml-2">
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">Name:</span>
                    <span className="text-gray-700 ml-2">
                      {data.primaryEmergencyContact?.name}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">
                      Relationship:
                    </span>
                    <span className="text-gray-700 ml-2">
                      {data.primaryEmergencyContact?.relationship}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-700 font-medium">Phone:</span>
                    <span className="text-gray-700 ml-2">
                      {data.primaryEmergencyContact?.number}
                    </span>
                  </div>
                </div>
              </div>

              {data.secondaryEmergencyContact?.name && (
                <div>
                  <p className="text-gray-700 font-medium">Secondary:</p>
                  <div className="ml-2">
                    <div className="mb-1">
                      <span className="text-gray-700 font-medium">Name:</span>
                      <span className="text-gray-700 ml-2">
                        {data.secondaryEmergencyContact?.name}
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="text-gray-700 font-medium">
                        Relationship:
                      </span>
                      <span className="text-gray-700 ml-2">
                        {data.secondaryEmergencyContact?.relationship}
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="text-gray-700 font-medium">Phone:</span>
                      <span className="text-gray-700 ml-2">
                        {data.secondaryEmergencyContact?.number}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Insurance Information */}
          <div className="bg-orange-200 p-4 rounded-lg">
            <h3 className="text-teal-600 font-bold text-lg mb-3">
              Insurance Information
            </h3>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">
                Insurance Provider:
              </span>
              <span className="text-gray-700 ml-2">
                {data.insurance?.provider}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Policy Number:</span>
              <span className="text-gray-700 ml-2">
                {data.insurance?.policyNumber}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Group Number:</span>
              <span className="text-gray-700 ml-2">
                {data.insurance?.groupNumber}
              </span>
            </div>
          </div>

          {/* Primary Physician */}
          <div className="bg-orange-200 p-4 rounded-lg">
            <h3 className="text-teal-600 font-bold text-lg mb-3">
              Primary Physician
            </h3>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Name:</span>
              <span className="text-gray-700 ml-2">
                {data.primaryPhysician?.name}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Specialty:</span>
              <span className="text-gray-700 ml-2">
                {data.primaryPhysician?.specialization}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-gray-700 font-medium">Contact:</span>
              <span className="text-gray-700 ml-2">
                {data.primaryPhysician?.contact}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
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

  // State to track if we're in edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [existingCard, setExistingCard] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null);

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
      setNotification({
        message: "You must be logged in to submit the form.",
        type: "error",
      });
      return;
    }

    try {
      // Determine if we're creating a new card or updating an existing one
      const method = existingCard ? "PUT" : "POST";
      const successMessage = existingCard
        ? "Digital Medical Card updated successfully!"
        : "Digital Medical Card submitted successfully!";

      const response = await fetch("/api/medical-card", {
        method: method,
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

      // Show custom notification instead of alert
      setNotification({ message: successMessage, type: "success" });

      // If we were editing, exit edit mode and update the existing card
      if (isEditing) {
        setIsEditing(false);
        setExistingCard(json);
      }
    } catch (error) {
      console.error("Submission error: ", error.message);
      setNotification({ message: error.message, type: "error" });
    }
  };

  // Function to handle profile picture upload
  const handleProfilePictureUpload = async (e) => {
    if (!user) {
      setNotification({
        message: "You must be logged in to upload a profile picture.",
        type: "error",
      });
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setNotification({
        message: "Please upload an image file",
        type: "error",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        message: "File size should be less than 5MB",
        type: "error",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch("/api/medical-card/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to upload profile picture");
      }

      // Update the existing card with the new profile picture
      setExistingCard(json.card);
      setNotification({
        message: "Profile picture uploaded successfully!",
        type: "success",
      });

      // Dispatch a custom event to notify other components that the profile picture has changed
      const event = new CustomEvent("profilePictureChanged", {
        detail: { profilePicture: json.card.profilePicture },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Upload error:", error.message);
      setNotification({ message: error.message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle removing the profile picture
  const handleRemoveProfilePicture = async () => {
    if (!user) {
      setNotification({
        message: "You must be logged in to remove your profile picture.",
        type: "error",
      });
      return;
    }

    try {
      setIsUploading(true);

      const response = await fetch("/api/medical-card/profile-picture", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to remove profile picture");
      }

      // Update the existing card with the removed profile picture
      setExistingCard(json.card);
      setNotification({
        message: "Profile picture removed successfully!",
        type: "success",
      });

      // Dispatch a custom event to notify other components that the profile picture has changed
      const event = new CustomEvent("profilePictureChanged", {
        detail: { profilePicture: "" },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Remove picture error:", error.message);
      setNotification({ message: error.message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Function to handle edit button click
  const handleEdit = () => {
    // Pre-fill the form with existing data
    if (existingCard) {
      setFormData({
        name: existingCard.name || "",
        dateOfBirth: existingCard.dateOfBirth
          ? new Date(existingCard.dateOfBirth).toISOString().split("T")[0]
          : "",
        age: existingCard.age || "",
        gender: existingCard.gender || "",
        userContactNumber: existingCard.userContactNumber || "",

        bloodType: existingCard.bloodType || "",
        organDonor: existingCard.organDonor || false,
        allergies: existingCard.allergies || "",
        currentMedications: existingCard.currentMedications || "",
        medicalDevicesImplants: existingCard.medicalDevicesImplants || "",
        recentSurgeryHospitalization:
          existingCard.recentSurgeryHospitalization || "",
        dietaryRestrictions: existingCard.dietaryRestrictions || "",

        primaryEmergencyContact: {
          name: existingCard.primaryEmergencyContact?.name || "",
          relationship:
            existingCard.primaryEmergencyContact?.relationship || "",
          number: existingCard.primaryEmergencyContact?.number || "",
        },

        secondaryEmergencyContact: {
          name: existingCard.secondaryEmergencyContact?.name || "",
          relationship:
            existingCard.secondaryEmergencyContact?.relationship || "",
          number: existingCard.secondaryEmergencyContact?.number || "",
        },

        insurance: {
          provider: existingCard.insurance?.provider || "",
          policyNumber: existingCard.insurance?.policyNumber || "",
          groupNumber: existingCard.insurance?.groupNumber || "",
        },

        primaryPhysician: {
          name: existingCard.primaryPhysician?.name || "",
          specialization: existingCard.primaryPhysician?.specialization || "",
          contact: existingCard.primaryPhysician?.contact || "",
        },
      });
    }
    setIsEditing(true);
  };

  // Function to handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // If we have an existing card and we're not in edit mode, show the display
  if (existingCard && !isEditing) {
    return (
      <>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePictureUpload}
          className="hidden"
          accept="image/*"
        />
        <DigitalMedicalCardDisplay data={existingCard} onEdit={handleEdit} />
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-10 mb-10 relative">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex items-start mb-8">
        <div>
          <ProfileIcon
            profilePicture={existingCard?.profilePicture}
            name={existingCard?.name || ""}
            onEditPicture={isEditing ? triggerFileInput : null}
            onRemovePicture={
              isEditing && existingCard?.profilePicture
                ? handleRemoveProfilePicture
                : null
            }
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureUpload}
            className="hidden"
            accept="image/*"
          />
          {isUploading && (
            <div className="text-sm text-teal-600 mt-1 text-center">
              Uploading...
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-teal-500 ml-4">
          {isEditing
            ? "Edit Digital Medical Card"
            : "Create Digital Medical Card"}
        </h2>
      </div>

      {isEditing && (
        <button
          onClick={handleCancelEdit}
          className="absolute top-4 right-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      )}

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
          className="w-full bg-teal-600 text-white py-3 rounded-xl"
        >
          {isEditing ? "Update Card" : "Submit Card"}
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
