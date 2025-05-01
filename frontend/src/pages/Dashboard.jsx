import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import UserDashboard from '../components/UserDashboard';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);

  // Auto-rotate health tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % 5);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch user's name from medical card
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/medical-card', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.name) {
            setUserName(data.name);
          } else if (user.fullName) {
            setUserName(user.fullName);
          } else {
            setUserName(user.email.split('@')[0]);
          }
        } else if (user.fullName) {
          setUserName(user.fullName);
        } else {
          setUserName(user.email.split('@')[0]);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        if (user.fullName) {
          setUserName(user.fullName);
        } else {
          setUserName(user.email.split('@')[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold text-teal-600">
                {loading ? 'Welcome!' : `Welcome, ${userName}!`}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your medical information and find donation opportunities.</p>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-50 p-3 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <span className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Find Hospitals Card */}
          <motion.div variants={itemVariants} className="h-full">
            <Link
              to="/hospitals"
              className="block bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-400 bg-opacity-20 p-3 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Find Hospitals</h2>
                  <p className="text-blue-100">Locate nearby hospitals</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Medical Card */}
          <motion.div variants={itemVariants} className="h-full">
            <Link
              to="/medical-card"
              className="block bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
            >
              <div className="flex items-center gap-4">
                <div className="bg-teal-400 bg-opacity-20 p-3 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Medical Card</h2>
                  <p className="text-teal-100">View and manage your digital medical card</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Blood Donations */}
          <motion.div variants={itemVariants} className="h-full">
            <Link
              to="/blood-requests"
              className="block bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-400 bg-opacity-20 p-3 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Blood Donations</h2>
                  <p className="text-red-100">Find and accept blood donation requests</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-teal-600 hover:text-teal-700 font-medium">View All</button>
          </div>
          <UserDashboard />
        </motion.div>

        {/* Quick Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-teal-50 p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-600">Stay hydrated before donating</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-teal-50 p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-600">Get a good night's sleep</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-teal-50 p-1 rounded-full mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-600">Eat iron-rich foods</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Tips</h3>
            <div className="relative overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTip * 100}%)` }}>
                <div className="w-full flex-shrink-0">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Stay Hydrated</h4>
                      <p className="text-sm text-blue-600">Drink at least 8 glasses of water daily to maintain optimal health and energy levels.</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex-shrink-0">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800">Regular Exercise</h4>
                      <p className="text-sm text-green-600">Aim for 30 minutes of moderate exercise daily to boost your immune system.</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex-shrink-0">
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800">Quality Sleep</h4>
                      <p className="text-sm text-purple-600">Get 7-8 hours of sleep each night to support your body's natural healing process.</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex-shrink-0">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800">Balanced Diet</h4>
                      <p className="text-sm text-yellow-600">Include fruits, vegetables, and whole grains in your daily meals for better health.</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex-shrink-0">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="bg-red-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-800">Stress Management</h4>
                      <p className="text-sm text-red-600">Practice mindfulness and take regular breaks to manage stress effectively.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-4 space-x-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTip(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${currentTip === index ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;