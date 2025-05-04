import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';
import HospitalAdminNavbar from '../../components/HospitalAdmin/HospitalAdminNavbar';
import { toast } from 'react-toastify';

const HospitalAdminProfile = () => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [formData, setFormData] = useState({
    resources: {
      icu_beds: 0,
      ventilators: 0,
      blood_bank: false,
      emergency_capacity: 0,
      medical_imaging: [],
      medical_imaging_costs: {}
    },
    contact: {
      phone: '',
      email: '',
      website: '',
      emergency_contact: ''
    },
    services: [],
    insurance_accepted: []
  });

  // Medical imaging options
  const medicalImagingOptions = ['MRI', 'CT Scan', 'X-Ray', 'Ultrasound'];

  // List of medical specializations
  const specializations = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Oncology',
    'Dermatology',
    'Ophthalmology',
    'ENT (Ear, Nose, Throat)',
    'Urology',
    'Psychiatry',
    'Gastroenterology',
    'Endocrinology',
    'Nephrology',
    'Pulmonology',
    'Rheumatology',
    'Hematology',
    'Infectious Disease',
    'General Surgery',
    'Plastic Surgery',
    'Neurosurgery',
    'Cardiac Surgery',
    'Vascular Surgery',
    'Emergency Medicine',
    'Radiology',
    'Anesthesiology',
    'Pathology',
    'Physical Therapy',
    'Dental Care'
  ];

  // List of common insurance providers
  const insuranceProviders = [
    'State Life Insurance',
    'Jubilee Life Insurance',
    'EFU Life Insurance',
    'Adamjee Insurance',
    'IGI Insurance',
    'Allianz EFU Health Insurance',
    'New Jubilee Insurance',
    'United Insurance',
    'Alpha Insurance',
    'Asia Insurance',
    'Askari Insurance',
    'Atlas Insurance',
    'Century Insurance',
    'Habib Insurance',
    'Premier Insurance',
    'Reliance Insurance',
    'Security General Insurance',
    'TPL Insurance',
    'UBL Insurers'
  ];
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!hospitalAdmin) {
      navigate('/hospital-admin/login');
      return;
    }

    fetchHospitalData();
  }, [hospitalAdmin, navigate]);

  const fetchHospitalData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/hospitals/${hospitalAdmin.hospitalId}`, {
        headers: {
          'Authorization': `Bearer ${hospitalAdmin.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hospital data');
      }

      const data = await response.json();
      setHospital(data);

      // Debug: Log the raw data
      console.log('Raw hospital data:', data);
      console.log('Raw medical imaging costs from API:', data.resources?.medical_imaging_costs);
      console.log('Medical imaging costs type:', typeof data.resources?.medical_imaging_costs);
      
      // Handle different formats that might come from MongoDB
      let medicalImagingCosts = {};
      
      // Get the medical imaging types available
      const imagingTypes = data.resources?.medical_imaging || [];
      console.log('Available imaging types:', imagingTypes);
      
      if (data.resources?.medical_imaging_costs) {
        // If it's already a plain object, use it directly
        if (typeof data.resources.medical_imaging_costs === 'object' && !Array.isArray(data.resources.medical_imaging_costs)) {
          medicalImagingCosts = { ...data.resources.medical_imaging_costs };
          console.log('Costs parsed from object:', medicalImagingCosts);
        } 
        // If it's returned as array of entries from MongoDB Map
        else if (Array.isArray(data.resources.medical_imaging_costs)) {
          data.resources.medical_imaging_costs.forEach(([key, value]) => {
            medicalImagingCosts[key] = Number(value);
            console.log(`Parsed cost from array: ${key} = ${Number(value)}`);
          });
          console.log('Costs parsed from array:', medicalImagingCosts);
        }
      }
      
      console.log('Parsed fetched costs:', medicalImagingCosts);
      
      // Initialize costs for existing imaging types with 0 if they don't have costs yet
      imagingTypes.forEach(type => {
        if (medicalImagingCosts[type] === undefined) {
          console.log(`Initializing cost for ${type} to 0 as it was missing.`);
          medicalImagingCosts[type] = 0;
        } else {
          console.log(`Found existing cost for ${type}: ${medicalImagingCosts[type]}`);
        }
      });
      
      console.log('Final initial costs for form:', medicalImagingCosts);

      // Initialize form data with hospital data
      const newFormData = {
        resources: {
          icu_beds: data.resources?.icu_beds || 0,
          ventilators: data.resources?.ventilators || 0,
          blood_bank: data.resources?.blood_bank || false,
          emergency_capacity: data.resources?.emergency_capacity || 0,
          medical_imaging: data.resources?.medical_imaging || [],
          medical_imaging_costs: medicalImagingCosts
        },
        contact: {
          phone: data.contact?.phone || '',
          email: data.contact?.email || '',
          website: data.contact?.website || '',
          emergency_contact: data.contact?.emergency_contact || ''
        },
        services: data.services || [],
        insurance_accepted: data.insurance_accepted || []
      };
      
      console.log('Form data being set:', newFormData);
      console.log('Medical imaging costs in form data:', newFormData.resources.medical_imaging_costs);
      
      setFormData(newFormData);

      setError(null);
    } catch (err) {
      console.error('Error fetching hospital data:', err);
      setError('Failed to load hospital data. Please try again later.');
      toast.error('Error loading hospital data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    console.log(`Updating ${section}.${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleImagingCostChange = (imagingType, cost) => {
    // Convert to proper format for MongoDB Map (requires removing ' Scan' suffix that might be in UI)
    const formattedType = imagingType.replace(' Scan', '');
    
    console.log(`Setting cost for ${formattedType} to:`, cost);
    
    // Create a copy of the current medical_imaging_costs
    const updatedCosts = { ...formData.resources.medical_imaging_costs };
    
    // Update the specific cost - ensure it's a number or empty string
    updatedCosts[formattedType] = cost === '' ? '' : Number(cost);
    
    console.log('Updated costs object:', updatedCosts);
    
    // Update the form data with the new costs
    setFormData(prev => {
      const newState = {
        ...prev,
        resources: {
          ...prev.resources,
          medical_imaging_costs: updatedCosts
        }
      };
      console.log('New form state after cost update:', newState.resources.medical_imaging_costs);
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      // Create a deep copy of formData to avoid mutation issues
      const updateData = {
        resources: JSON.parse(JSON.stringify(formData.resources)),
        contact: JSON.parse(JSON.stringify(formData.contact)),
        services: [...formData.services],
        insurance_accepted: [...formData.insurance_accepted]
      };

      console.log('Submit pressed. Current form imaging costs:', formData.resources.medical_imaging_costs);
      
      // Clean up medical_imaging_costs - ensure all selected imaging types have costs
      const cleanedCosts = {};
      
      // First add all existing costs
      Object.entries(updateData.resources.medical_imaging_costs).forEach(([key, value]) => {
        // If we have a value (including 0), use it; otherwise default to 0
        let numValue = 0;
        if (value !== '' && value !== null && value !== undefined) {
          numValue = typeof value === 'number' ? value : Number(value);
          // Handle NaN cases
          if (isNaN(numValue)) numValue = 0;
        }
        cleanedCosts[key] = numValue;
        console.log(`Cleaned cost for ${key}: ${numValue} (original: ${value}, type: ${typeof value})`);
      });
      
      // Then ensure all selected types have a cost value
      updateData.resources.medical_imaging.forEach(type => {
        if (cleanedCosts[type] === undefined) {
          cleanedCosts[type] = 0;
          console.log(`Added missing cost for ${type}: 0`);
        }
      });
      
      // Set the cleaned costs back to the update data
      updateData.resources.medical_imaging_costs = cleanedCosts;

      console.log('Sending update data to server:', updateData);
      console.log('Medical imaging costs being sent:', updateData.resources.medical_imaging_costs);

      // This calls the updateHospitalProfile API endpoint in hospitalAdminController.js
      // It updates specific fields of the hospital profile like resources, contact info,
      // services offered, and insurance accepted
      const response = await fetch('/api/hospital-admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hospitalAdmin.token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to update hospital profile');
      }

      const updatedHospital = await response.json();
      console.log('Updated hospital data received:', updatedHospital);
      console.log('Updated costs in response:', updatedHospital.resources?.medical_imaging_costs);
      setHospital(updatedHospital);

      toast.success('Hospital profile updated successfully');

      // Refresh the data instead of navigating away
      fetchHospitalData();
    } catch (err) {
      console.error('Error updating hospital profile:', err);
      toast.error(err.message || 'Failed to update hospital profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        {/* Navbar is included in App.js */}
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-teal-500 border-solid"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {/* Navbar is included in App.js */}
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-3">
            <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-700 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-3 py-1.5 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <HospitalAdminNavbar />

      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl xs:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Hospital Profile</h1>

        {hospital && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-3 sm:p-6">
                  <h2 className="text-lg xs:text-xl font-semibold text-gray-800">{hospital.name}</h2>

                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xs xs:text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-0.5 text-xs xs:text-sm text-gray-900">{hospital.location?.address || 'Not available'}</p>
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xs xs:text-sm font-medium text-gray-500">Contact Information</h3>
                    <div className="mt-0.5 text-xs xs:text-sm text-gray-900">
                      {hospital.contact?.phone && <div>Phone: {hospital.contact.phone}</div>}
                      {hospital.contact?.email && <div>Email: {hospital.contact.email}</div>}
                      {hospital.contact?.website && (
                        <div>
                          Website: <a href={hospital.contact.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{hospital.contact.website}</a>
                        </div>
                      )}
                      {(!hospital.contact?.phone && !hospital.contact?.email && !hospital.contact?.website) && 'Not available'}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xs xs:text-sm font-medium text-gray-500">Services & Resources</h3>
                    <ul className="mt-0.5 text-xs xs:text-sm text-gray-900">
                      <li>ICU Beds: {hospital.resources?.icu_beds || 'N/A'}</li>
                      <li>Ventilators: {hospital.resources?.ventilators || 'N/A'}</li>
                      <li>Blood Bank: {hospital.resources?.blood_bank ? 'Available' : 'Not Available'}</li>
                      <li>Emergency Capacity: {hospital.resources?.emergency_capacity || 'N/A'}</li>
                      <li>Medical Imaging: {hospital.resources?.medical_imaging?.length > 0 ?
                        hospital.resources.medical_imaging.join(', ') : 'None'}</li>
                    </ul>
                  </div>

                  {hospital.services && hospital.services.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <h3 className="text-xs xs:text-sm font-medium text-gray-500">Specializations</h3>
                      <div className="mt-0.5 text-xs xs:text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {hospital.services.map((service, index) => (
                            <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] xs:text-xs font-medium bg-teal-100 text-teal-800">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {hospital.insurance_accepted && hospital.insurance_accepted.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <h3 className="text-xs xs:text-sm font-medium text-gray-500">Insurance Accepted</h3>
                      <div className="mt-0.5 text-xs xs:text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {hospital.insurance_accepted.map((insurance, index) => (
                            <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] xs:text-xs font-medium bg-blue-100 text-blue-800">
                              {insurance}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-3 sm:p-6">
                  <h2 className="text-base xs:text-lg font-medium text-gray-800 mb-2 sm:mb-4">Hospital Resources & Information</h2>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-sm xs:text-base font-medium text-gray-900">Resource Information</h3>
                        <p className="text-xs text-gray-500">Update resources and facilities available in your hospital.</p>

                        <div className="mt-2 sm:mt-4 grid grid-cols-2 gap-x-2 gap-y-3 xs:gap-x-3 sm:gap-x-6">
                          <div>
                            <label htmlFor="icu_beds" className="block text-xs xs:text-sm font-medium text-gray-700">
                              ICU Beds
                            </label>
                            <input
                              type="number"
                              id="icu_beds"
                              min="0"
                              value={formData.resources.icu_beds}
                              onChange={(e) => handleInputChange('resources', 'icu_beds', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-xs xs:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="ventilators" className="block text-xs xs:text-sm font-medium text-gray-700">
                              Ventilators
                            </label>
                            <input
                              type="number"
                              id="ventilators"
                              min="0"
                              value={formData.resources.ventilators}
                              onChange={(e) => handleInputChange('resources', 'ventilators', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-xs xs:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="emergency_capacity" className="block text-xs xs:text-sm font-medium text-gray-700">
                              Emergency Capacity
                            </label>
                            <input
                              type="number"
                              id="emergency_capacity"
                              min="0"
                              value={formData.resources.emergency_capacity}
                              onChange={(e) => handleInputChange('resources', 'emergency_capacity', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-xs xs:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div className="flex items-center h-full">
                            <div className="flex items-center">
                              <input
                                id="blood_bank"
                                type="checkbox"
                                checked={formData.resources.blood_bank}
                                onChange={(e) => handleInputChange('resources', 'blood_bank', e.target.checked)}
                                className="h-3 w-3 xs:h-4 xs:w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <label htmlFor="blood_bank" className="ml-1.5 block text-xs xs:text-sm font-medium text-gray-700">
                                Blood Bank Available
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 sm:mt-6">
                          <h3 className="text-sm xs:text-base font-medium text-gray-900 mb-1 sm:mb-2">Medical Imaging Options</h3>
                          <p className="text-[10px] xs:text-xs text-gray-500 mb-2">Select the medical imaging services available at your hospital.</p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            {medicalImagingOptions.map((option) => {
                              const imagingType = option.replace(' Scan', ''); // Store as 'CT' instead of 'CT Scan'
                              const isSelected = formData.resources.medical_imaging.includes(imagingType);
                              // Convert to number if it exists, otherwise empty string for the input
                              let costValue = '';
                              if (formData.resources.medical_imaging_costs[imagingType] !== undefined) {
                                costValue = formData.resources.medical_imaging_costs[imagingType];
                              }
                              
                              console.log(`Imaging type: ${imagingType}, Cost value: ${costValue}, isSelected: ${isSelected}`);
                              
                              return (
                                <div key={option} className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                  <div className="flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 mb-1 sm:mb-2">
                                    {option === 'MRI' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 xs:w-7 xs:h-7 text-teal-600">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <circle cx="12" cy="12" r="4"></circle>
                                      </svg>
                                    )}
                                    {option === 'CT Scan' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 xs:w-7 xs:h-7 text-teal-600">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="2" x2="12" y2="22"></line>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                      </svg>
                                    )}
                                    {option === 'X-Ray' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 xs:w-7 xs:h-7 text-teal-600">
                                        <path d="M21 3L3 21"></path>
                                        <path d="M3 3L21 21"></path>
                                      </svg>
                                    )}
                                    {option === 'Ultrasound' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 xs:w-7 xs:h-7 text-teal-600">
                                        <path d="M8 2C8 2 12 6 12 12C12 18 8 22 8 22"></path>
                                        <path d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22"></path>
                                        <path d="M4 2C4 2 8 6 8 12C8 18 4 22 4 22"></path>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="text-center">
                                    <div className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-900">{option}</div>
                                    <div className="mt-1 flex items-center">
                                      <input
                                        id={`imaging-${option}`}
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            handleInputChange('resources', 'medical_imaging', [...formData.resources.medical_imaging, imagingType]);
                                          } else {
                                            handleInputChange('resources', 'medical_imaging',
                                              formData.resources.medical_imaging.filter(item => item !== imagingType)
                                            );
                                          }
                                        }}
                                        className="h-3 w-3 xs:h-4 xs:w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                      />
                                    </div>
                                    {isSelected && (
                                      <div className="mt-2">
                                        <label htmlFor={`cost-${imagingType}`} className="block text-[10px] xs:text-xs font-medium text-gray-700">
                                          Cost (Rs)
                                        </label>
                                        <input
                                          id={`cost-${imagingType}`}
                                          type="number"
                                          min="0"
                                          value={costValue}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleImagingCostChange(imagingType, value === '' ? '' : parseInt(value) || 0);
                                          }}
                                          onBlur={(e) => {
                                            // On blur, ensure empty values are converted to 0
                                            if (e.target.value === '') {
                                              handleImagingCostChange(imagingType, 0);
                                            }
                                          }}
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-[10px] xs:text-xs focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                          placeholder="Enter cost"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 sm:pt-6 border-t border-gray-200">
                        <h3 className="text-sm xs:text-base font-medium text-gray-900">Contact Information</h3>
                        <p className="text-xs text-gray-500">Update contact details for your hospital.</p>

                        <div className="mt-2 sm:mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
                          <div>
                            <label htmlFor="phone" className="block text-xs xs:text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              id="phone"
                              value={formData.contact.phone}
                              onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-xs xs:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-xs xs:text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={formData.contact.email}
                              onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-xs xs:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="website" className="block text-xs xs:text-sm font-medium text-gray-700">
                              Website
                            </label>
                            <input
                              type="url"
                              id="website"
                              value={formData.contact.website}
                              onChange={(e) => handleInputChange('contact', 'website', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-xs xs:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                              placeholder="https://example.com"
                            />
                          </div>

                          <div>
                            <label htmlFor="emergency_contact" className="block text-xs xs:text-sm font-medium text-gray-700">
                              Emergency Contact
                            </label>
                            <input
                              type="text"
                              id="emergency_contact"
                              value={formData.contact.emergency_contact}
                              onChange={(e) => handleInputChange('contact', 'emergency_contact', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-xs xs:text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 sm:pt-6 border-t border-gray-200">
                        <h3 className="text-sm xs:text-base font-medium text-gray-900">Specializations</h3>
                        <p className="text-xs text-gray-500">Select the medical specializations available at your hospital.</p>

                        <div className="mt-2 sm:mt-4 grid grid-cols-1 xs:grid-cols-2 gap-y-2 xs:gap-y-3 sm:grid-cols-3 sm:gap-x-6">
                          {specializations.map((specialization) => (
                            <div key={specialization} className="flex items-center">
                              <input
                                id={`specialization-${specialization}`}
                                type="checkbox"
                                checked={formData.services.includes(specialization)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      services: [...formData.services, specialization]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      services: formData.services.filter(s => s !== specialization)
                                    });
                                  }
                                }}
                                className="h-3 w-3 xs:h-4 xs:w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`specialization-${specialization}`} className="ml-1.5 block text-[10px] xs:text-xs sm:text-sm font-medium text-gray-700">
                                {specialization}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 sm:pt-6 border-t border-gray-200">
                        <h3 className="text-sm xs:text-base font-medium text-gray-900">Insurance Accepted</h3>
                        <p className="text-xs text-gray-500">Select the insurance providers accepted at your hospital.</p>

                        <div className="mt-2 sm:mt-4 grid grid-cols-1 xs:grid-cols-2 gap-y-2 xs:gap-y-3 sm:grid-cols-3 sm:gap-x-6">
                          {insuranceProviders.map((provider) => (
                            <div key={provider} className="flex items-center">
                              <input
                                id={`insurance-${provider}`}
                                type="checkbox"
                                checked={formData.insurance_accepted.includes(provider)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      insurance_accepted: [...formData.insurance_accepted, provider]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      insurance_accepted: formData.insurance_accepted.filter(p => p !== provider)
                                    });
                                  }
                                }}
                                className="h-3 w-3 xs:h-4 xs:w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`insurance-${provider}`} className="ml-1.5 block text-[10px] xs:text-xs sm:text-sm font-medium text-gray-700">
                                {provider}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-3 py-1.5 text-xs xs:text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Changes...
                          </span>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalAdminProfile;