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
      emergency_capacity: 0
    },
    contact: {
      phone: '',
      email: '',
      website: '',
      emergency_contact: ''
    }
  });
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
      
      // Initialize form data with hospital data
      setFormData({
        resources: {
          icu_beds: data.resources?.icu_beds || 0,
          ventilators: data.resources?.ventilators || 0,
          blood_bank: data.resources?.blood_bank || false,
          emergency_capacity: data.resources?.emergency_capacity || 0
        },
        contact: {
          phone: data.contact?.phone || '',
          email: data.contact?.email || '',
          website: data.contact?.website || '',
          emergency_contact: data.contact?.emergency_contact || ''
        }
      });
      
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
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/hospital-admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hospitalAdmin.token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update hospital profile');
      }
      
      const updatedHospital = await response.json();
      setHospital(updatedHospital);
      
      toast.success('Hospital profile updated successfully');
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
        <HospitalAdminNavbar />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500 border-solid"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <HospitalAdminNavbar />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Hospital Profile</h1>
        
        {hospital && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800">{hospital.name}</h2>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-sm text-gray-900">{hospital.location?.address || 'Not available'}</p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {hospital.contact?.phone && <div>Phone: {hospital.contact.phone}</div>}
                      {hospital.contact?.email && <div>Email: {hospital.contact.email}</div>}
                      {hospital.contact?.website && (
                        <div>
                          Website: <a href={hospital.contact.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{hospital.contact.website}</a>
                        </div>
                      )}
                      {(!hospital.contact?.phone && !hospital.contact?.email && !hospital.contact?.website) && 'Not available'}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">Services & Resources</h3>
                    <ul className="mt-1 text-sm text-gray-900">
                      <li>ICU Beds: {hospital.resources?.icu_beds || 'N/A'}</li>
                      <li>Ventilators: {hospital.resources?.ventilators || 'N/A'}</li>
                      <li>Blood Bank: {hospital.resources?.blood_bank ? 'Available' : 'Not Available'}</li>
                      <li>Emergency Capacity: {hospital.resources?.emergency_capacity || 'N/A'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Update Hospital Information</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">Resource Information</h3>
                        <p className="text-sm text-gray-500">Update resources and facilities available in your hospital.</p>
                        
                        <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                          <div>
                            <label htmlFor="icu_beds" className="block text-sm font-medium text-gray-700">
                              ICU Beds
                            </label>
                            <input
                              type="number"
                              id="icu_beds"
                              min="0"
                              value={formData.resources.icu_beds}
                              onChange={(e) => handleInputChange('resources', 'icu_beds', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="ventilators" className="block text-sm font-medium text-gray-700">
                              Ventilators
                            </label>
                            <input
                              type="number"
                              id="ventilators"
                              min="0"
                              value={formData.resources.ventilators}
                              onChange={(e) => handleInputChange('resources', 'ventilators', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="emergency_capacity" className="block text-sm font-medium text-gray-700">
                              Emergency Capacity
                            </label>
                            <input
                              type="number"
                              id="emergency_capacity"
                              min="0"
                              value={formData.resources.emergency_capacity}
                              onChange={(e) => handleInputChange('resources', 'emergency_capacity', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center h-full">
                            <div className="flex items-center">
                              <input
                                id="blood_bank"
                                type="checkbox"
                                checked={formData.resources.blood_bank}
                                onChange={(e) => handleInputChange('resources', 'blood_bank', e.target.checked)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <label htmlFor="blood_bank" className="ml-2 block text-sm font-medium text-gray-700">
                                Blood Bank Available
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-base font-medium text-gray-900">Contact Information</h3>
                        <p className="text-sm text-gray-500">Update contact details for your hospital.</p>
                        
                        <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              id="phone"
                              value={formData.contact.phone}
                              onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={formData.contact.email}
                              onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                              Website
                            </label>
                            <input
                              type="url"
                              id="website"
                              value={formData.contact.website}
                              onChange={(e) => handleInputChange('contact', 'website', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                              placeholder="https://example.com"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700">
                              Emergency Contact
                            </label>
                            <input
                              type="text"
                              id="emergency_contact"
                              value={formData.contact.emergency_contact}
                              onChange={(e) => handleInputChange('contact', 'emergency_contact', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={fetchHospitalData}
                        className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
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