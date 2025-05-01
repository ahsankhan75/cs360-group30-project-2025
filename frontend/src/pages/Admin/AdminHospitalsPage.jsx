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
                <div className="flex-1 flex flex-col">
                    <AdminHeader title="Hospitals Management" />
                    <div className="flex justify-center items-center min-h-screen bg-gray-100">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500 border-solid"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 flex flex-col">
                <AdminHeader title="Hospitals Management" />

                <main className="flex-1 bg-gray-100 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Manage Hospitals</h1>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                            >
                                {showAddForm ? 'Cancel' : 'Add New Hospital'}
                            </button>
                        </div>

                        {showAddForm && (
                            <div className="bg-white rounded-lg shadow p-6 mb-8">
                                <h2 className="text-xl font-semibold mb-4">Add New Hospital</h2>
                                <form onSubmit={handleAddHospital} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                value={newHospital.name}
                                                onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City</label>
                                            <input
                                                type="text"
                                                value={newHospital.city}
                                                onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <input
                                                type="text"
                                                value={newHospital.address}
                                                onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={newHospital.contact.email}
                                                onChange={(e) => setNewHospital({
                                                    ...newHospital,
                                                    contact: { ...newHospital.contact, email: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input
                                                type="tel"
                                                value={newHospital.contact.phone}
                                                onChange={(e) => setNewHospital({
                                                    ...newHospital,
                                                    contact: { ...newHospital.contact, phone: e.target.value }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ICU Beds</label>
                                            <input
                                                type="number"
                                                value={newHospital.resources.icu_beds}
                                                onChange={(e) => setNewHospital({
                                                    ...newHospital,
                                                    resources: { ...newHospital.resources, icu_beds: parseInt(e.target.value) }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ventilators</label>
                                            <input
                                                type="number"
                                                value={newHospital.resources.ventilators}
                                                onChange={(e) => setNewHospital({
                                                    ...newHospital,
                                                    resources: { ...newHospital.resources, ventilators: parseInt(e.target.value) }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Emergency Capacity</label>
                                            <input
                                                type="number"
                                                value={newHospital.resources.emergency_capacity}
                                                onChange={(e) => setNewHospital({
                                                    ...newHospital,
                                                    resources: { ...newHospital.resources, emergency_capacity: parseInt(e.target.value) }
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={newHospital.resources.blood_bank}
                                                onChange={(e) => setNewHospital({
                                                    ...newHospital,
                                                    resources: { ...newHospital.resources, blood_bank: e.target.checked }
                                                })}
                                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">Has Blood Bank</label>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                        >
                                            Add Hospital
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                {error}
                            </div>
                        )}

                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {hospitals.map((hospital) => (
                                        <tr key={hospital._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                                                <div className="text-sm text-gray-500">{hospital.address}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{hospital.city}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{hospital.contact.email}</div>
                                                <div className="text-sm text-gray-500">{hospital.contact.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    ICU Beds: {hospital.resources.icu_beds}
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    Ventilators: {hospital.resources.ventilators}
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    Blood Bank: {hospital.resources.blood_bank ? 'Yes' : 'No'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(hospital._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminHospitalsPage; 