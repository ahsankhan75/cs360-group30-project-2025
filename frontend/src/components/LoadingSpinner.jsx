import React from 'react';

const LoadingSpinner = ({ fullScreen = false, message = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-20 h-20 border-8 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#14b8a6' }}></div>
          <p className="mt-4 text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 border-6 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#14b8a6' }}></div>
      <p className="mt-4 text-gray-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
