import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';
import HospitalAdminNavbar from '../../components/HospitalAdmin/HospitalAdminNavbar';
import { toast } from 'react-toastify';
import { checkBackendConnection } from '../../utils/connectionManager';

const HospitalAdminDashboard = () => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    hospital: {},
    stats: {
      activeBloodRequests: 0,
      completedBloodRequests: 0,
      totalBloodRequests: 0,
      averageRating: 0,
      reviewCount: 0
    },
    recentBloodRequests: [],
    recentReviews: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    resources: {
      icu_beds: 0,
      ventilators: 0,
      blood_bank: false,
      emergency_capacity: 0
    },
    contact: {
      email: '',
      phone: ''
    },
    services: [],
    insurance_accepted: []
  });

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
    const fetchDashboardData = async () => {
      if (!hospitalAdmin) {
        navigate('/hospital-admin/login');
        return;
      }

      try {
        // First check if backend is available
        const isBackendAvailable = await checkBackendConnection();
        if (!isBackendAvailable) {
          setError('Unable to connect to server. Please try again later.');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/hospital-admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${hospitalAdmin.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);

        // Initialize form data with hospital data
        setFormData({
          resources: {
            icu_beds: data.hospital?.resources?.icu_beds || 0,
            ventilators: data.hospital?.resources?.ventilators || 0,
            blood_bank: data.hospital?.resources?.blood_bank || false,
            emergency_capacity: data.hospital?.resources?.emergency_capacity || 0
          },
          contact: {
            email: data.hospital?.contact?.email || '',
            phone: data.hospital?.contact?.phone || ''
          },
          services: data.hospital?.services || [],
          insurance_accepted: data.hospital?.insurance_accepted || []
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        toast.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hospitalAdmin, navigate]);

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

      <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hospital Admin Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Welcome back, {hospitalAdmin?.fullName || hospitalAdmin?.email}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm font-medium">Active Blood Requests</h2>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.stats?.activeBloodRequests || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm font-medium">Completed Requests</h2>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.stats?.completedBloodRequests || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm font-medium">Average Rating</h2>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.stats?.averageRating ? dashboardData.stats.averageRating.toFixed(1) : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm font-medium">Total Reviews</h2>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.stats?.reviewCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hospital Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Hospital Information</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/hospital-admin/profile')}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm"
                >
                  Manage Specializations
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="border-t border-gray-200 pt-4">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSaving(true);

                  try {
                    // Only send the fields we're updating
                    const updateData = {
                      contact: formData.contact,
                      resources: formData.resources
                    };

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
                      throw new Error(errorData.error || 'Failed to update hospital profile');
                    }

                    const updatedHospital = await response.json();

                    // Update the dashboard data with the new hospital info
                    setDashboardData({
                      ...dashboardData,
                      hospital: updatedHospital
                    });

                    setIsEditing(false);
                    toast.success('Hospital information updated successfully');
                  } catch (err) {
                    console.error('Error updating hospital profile:', err);
                    toast.error(err.message || 'Failed to update hospital profile');
                  } finally {
                    setIsSaving(false);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Contact Information</h3>
                      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            id="email"
                            value={formData.contact.email}
                            onChange={(e) => setFormData({
                              ...formData,
                              contact: {
                                ...formData.contact,
                                email: e.target.value
                              }
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                          <input
                            type="text"
                            id="phone"
                            value={formData.contact.phone}
                            onChange={(e) => setFormData({
                              ...formData,
                              contact: {
                                ...formData.contact,
                                phone: e.target.value
                              }
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Resources</h3>
                      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
                        <div>
                          <label htmlFor="icu_beds" className="block text-sm font-medium text-gray-700">ICU Beds</label>
                          <input
                            type="number"
                            id="icu_beds"
                            min="0"
                            value={formData.resources.icu_beds}
                            onChange={(e) => setFormData({
                              ...formData,
                              resources: {
                                ...formData.resources,
                                icu_beds: parseInt(e.target.value) || 0
                              }
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="ventilators" className="block text-sm font-medium text-gray-700">Ventilators</label>
                          <input
                            type="number"
                            id="ventilators"
                            min="0"
                            value={formData.resources.ventilators}
                            onChange={(e) => setFormData({
                              ...formData,
                              resources: {
                                ...formData.resources,
                                ventilators: parseInt(e.target.value) || 0
                              }
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="emergency_capacity" className="block text-sm font-medium text-gray-700">Emergency Capacity</label>
                          <input
                            type="number"
                            id="emergency_capacity"
                            min="0"
                            value={formData.resources.emergency_capacity}
                            onChange={(e) => setFormData({
                              ...formData,
                              resources: {
                                ...formData.resources,
                                emergency_capacity: parseInt(e.target.value) || 0
                              }
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="blood_bank"
                            checked={formData.resources.blood_bank}
                            onChange={(e) => setFormData({
                              ...formData,
                              resources: {
                                ...formData.resources,
                                blood_bank: e.target.checked
                              }
                            })}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <label htmlFor="blood_bank" className="ml-2 block text-sm font-medium text-gray-700">Blood Bank Available</label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{dashboardData.hospital?.name || 'N/A'}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{dashboardData.hospital?.location?.address || 'N/A'}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Contact</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {dashboardData.hospital?.contact?.email && (
                        <div>Email: {dashboardData.hospital.contact.email}</div>
                      )}
                      {dashboardData.hospital?.contact?.phone && (
                        <div>Phone: {dashboardData.hospital.contact.phone}</div>
                      )}
                      {!dashboardData.hospital?.contact?.email && !dashboardData.hospital?.contact?.phone && 'N/A'}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Resources</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      <ul>
                        <li>ICU Beds: {dashboardData.hospital?.resources?.icu_beds || 'N/A'}</li>
                        <li>Ventilators: {dashboardData.hospital?.resources?.ventilators || 'N/A'}</li>
                        <li>Blood Bank: {dashboardData.hospital?.resources?.blood_bank ? 'Available' : 'Not Available'}</li>
                        <li>Emergency Capacity: {dashboardData.hospital?.resources?.emergency_capacity || 'N/A'}</li>
                      </ul>
                    </dd>
                  </div>

                  {dashboardData.hospital?.services && dashboardData.hospital.services.length > 0 && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Specializations</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {dashboardData.hospital.services.map((service, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              {service}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}

                  {dashboardData.hospital?.insurance_accepted && dashboardData.hospital.insurance_accepted.length > 0 && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Insurance Accepted</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {dashboardData.hospital.insurance_accepted.map((insurance, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {insurance}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Recent Blood Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Blood Requests</h2>
              <button
                onClick={() => navigate('/hospital-admin/blood-requests')}
                className="text-sm font-medium text-teal-600 hover:text-teal-800"
              >
                View All
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              {dashboardData.recentBloodRequests?.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {dashboardData.recentBloodRequests.map((request) => (
                    <li key={request._id || request.requestId} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Blood Type: {request.bloodType}
                          </p>
                          <p className="text-sm text-gray-500">
                            Posted: {new Date(request.datePosted).toLocaleDateString()} •
                            Status: {request.accepted ? 'Accepted' : 'Pending'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                            request.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {request.urgencyLevel}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 py-4 text-center">No blood requests found</p>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Reviews</h2>
              <button
                onClick={() => navigate('/hospital-admin/reviews')}
                className="text-sm font-medium text-teal-600 hover:text-teal-800"
                aria-label="View all reviews"
              >
                View All
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              {dashboardData.recentReviews?.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {dashboardData.recentReviews.map((review) => (
                    <li key={review._id} className="py-3">
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {review.userId?.fullName || review.userId?.email || 'Anonymous User'}
                          </p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 py-4 text-center">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalAdminDashboard;