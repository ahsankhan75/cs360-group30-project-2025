

import React, { useEffect, useState } from 'react';
import BloodRequestTable from '../components/BloodRequestTable';

const BloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [search, setSearch] = useState('');
  const [userBloodType] = useState('O+'); // Simulate user's blood type

  useEffect(() => {
    fetch('/api/blood-requests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error(err));
  }, []);

  const filteredRequests = requests
    .filter(r => (filtered ? r.bloodType === userBloodType : true))
    .filter(r =>
      search === '' ? true : r.hospitalName.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-teal-500">Blood Donation Requests</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-md font-medium">Filter by your blood type</span>
          {/* Custom Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={filtered}
              onChange={() => setFiltered(prev => !prev)}
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <input
          type="text"
          placeholder="🔍 Search hospital..."
          className="border rounded px-4 py-2 text-md w-72"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <BloodRequestTable data={filteredRequests} />
    </div>
  );
};

export default BloodRequestsPage;