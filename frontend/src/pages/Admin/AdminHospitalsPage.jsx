import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import { toast } from 'react-toastify';

const AdminHospitalsPage = () => {
    const { admin } = useAdminAuthContext();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newHospital, setNewHospital] = useState({
        name: '',
        city: '',
        address: '',
        contact: {
            email: '',
            phone: ''
        },
        resources: {
            icu_beds: 0,
            ventilators: 0,
            blood_bank: false,
            emergency_capacity: 0
        }
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
        }
        fetchHospitals();
    }, [admin, navigate]);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/hospitals', {
                headers: {
                    'Authorization': `Bearer ${admin.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch hospitals');
            }

            const data = await response.json();
            setHospitals(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (hospitalId) => {
        if (!window.confirm('Are you sure you want to delete this hospital?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/hospitals/${hospitalId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${admin.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete hospital');
            }

            toast.success('Hospital deleted successfully');
            fetchHospitals();
        } catch (err) {
            toast.error('Failed to delete hospital');
        }
    };

    const handleAddHospital = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/hospitals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${admin.token}`
                },
                body: JSON.stringify(newHospital)
            });

            if (!response.ok) {
                throw new Error('Failed to add hospital');
            }

            toast.success('Hospital added successfully');
            setShowAddForm(false);
            setNewHospital({
                name: '',
                city: '',
                address: '',
                contact: {
                    email: '',
                    phone: ''
                },
                resources: {
                    icu_beds: 0,
                    ventilators: 0,
                    blood_bank: false,
                    emergency_capacity: 0
                }
            });
            fetchHospitals();
        } catch (err) {
            toast.error('Failed to add hospital');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AdminHeader title="Hospitals Management" />
                    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 sm:border-t-3 md:border-t-4 border-teal-500 border-solid"></div>
                        <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-gray-600">Loading hospitals...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Filter hospitals based on search term
    const filteredHospitals = hospitals.filter(hospital => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (hospital.name && hospital.name.toLowerCase().includes(searchLower)) ||
            (hospital.city && hospital.city.toLowerCase().includes(searchLower)) ||
            (hospital.address && hospital.address.toLowerCase().includes(searchLower)) ||
            (hospital.contact.email && hospital.contact.email.toLowerCase().includes(searchLower)) ||
            (hospital.contact.phone && hospital.contact.phone.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader title="Hospitals Management" />

                <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
                    <div className="w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3 md:gap-4">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Manage Hospitals</h1>

                            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-3">
                                <div className="relative w-full sm:w-64 md:w-72">
                                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search hospitals..."
                                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>


                            </div>
                        </div>

                      

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-2 sm:p-3 md:p-4 rounded-md mb-3 sm:mb-4 md:mb-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-2 sm:ml-3">
                                        <p className="text-xs sm:text-sm text-red-700">{error}</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-red-700 hover:text-red-600"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white shadow overflow-hidden rounded-lg">
                            <div className="overflow-x-auto responsive-table-container">
                                {filteredHospitals.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          
                                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Resources</th>
                                                <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredHospitals.map((hospital) => (
                                                <tr key={hospital._id} className="hover:bg-gray-50">
                                                    <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 w-1/6 sm:w-1/5">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={hospital.name}>{hospital.name}</div>
                                                        <div className="text-xs sm:text-sm text-gray-500 truncate" title={hospital.address}>{hospital.address}</div>
                                                    </td>
                                                   
                                                    <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 w-1/6 sm:w-1/5">
                                                        <div className="text-xs sm:text-sm text-gray-900 truncate" title={hospital.contact.email}>{hospital.contact.email}</div>
                                                        <div className="text-xs sm:text-sm text-gray-500 truncate" title={hospital.contact.phone}>{hospital.contact.phone}</div>
                                                    </td>
                                                    <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 w-1/4 sm:w-1/5">
                                                        <div className="text-xs sm:text-sm text-gray-900 flex items-center">
                                                            <span className="font-medium mr-1">ICU:</span> {hospital.resources.icu_beds}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-900 flex items-center">
                                                            <span className="font-medium mr-1">Vent:</span> {hospital.resources.ventilators}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-900 flex items-center">
                                                            <span className="font-medium mr-1">Blood:</span> {hospital.resources.blood_bank ? 'Yes' : 'No'}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm font-medium w-1/12">
                                                        <button
                                                            onClick={() => handleDelete(hospital._id)}
                                                            className="text-red-600 hover:text-red-900 flex items-center"
                                                            title="Delete Hospital"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="hidden sm:inline ml-1">Delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-4 sm:py-6 md:py-8 bg-gray-50 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto text-gray-400 mb-2 sm:mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No hospitals found</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-4">
                                            {searchTerm ? 'Try adjusting your search' : 'Add a new hospital to get started'}
                                        </p>
                                        <button
                                            onClick={() => setShowAddForm(true)}
                                            className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-1.5 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Add Hospital
                                        </button>
                                    </div>
                                )}
                            </div>

                            {filteredHospitals.length > 0 && (
                                <div className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-2 sm:p-3 md:p-4">
                                    <span>Showing {filteredHospitals.length} of {hospitals.length} hospitals</span>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="text-teal-600 hover:text-teal-800 flex items-center text-xs sm:text-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add New Hospital
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminHospitalsPage;