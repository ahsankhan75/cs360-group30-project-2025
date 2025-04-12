import { useState, useEffect } from 'react'
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import { Navigate } from 'react-router-dom'

const AdminDashboard = () => {
  const { adminUser } = useAdminAuthContext()
  const [stats, setStats] = useState({
    userCount: 0,
    hospitalCount: 0,
    reviewCount: 0,
    bloodRequestCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!adminUser) return
      
      setLoading(true)
      try {
        // In a full implementation, this would fetch data from a /api/admin/dashboard endpoint
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            userCount: 142,
            hospitalCount: 28,
            reviewCount: 456,
            bloodRequestCount: 73
          })
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError('Failed to load dashboard data')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [adminUser])

  if (!adminUser) {
    return <Navigate to="/admin/login" />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Welcome, {adminUser.fullName || 'Admin'}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-teal-100 text-teal-500">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Users</h3>
                      <div className="text-3xl font-semibold text-gray-700">{stats.userCount}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Hospitals</h3>
                      <div className="text-3xl font-semibold text-gray-700">{stats.hospitalCount}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
                      <div className="text-3xl font-semibold text-gray-700">{stats.reviewCount}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-500">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Blood Requests</h3>
                      <div className="text-3xl font-semibold text-gray-700">{stats.bloodRequestCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
