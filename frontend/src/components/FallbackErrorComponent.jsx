import React from 'react';
import { Link } from 'react-router-dom';

const FallbackErrorComponent = ({ error, onRetry }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg mx-auto">
      <div className="inline-block p-4 bg-red-50 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-3">Request Timed Out</h2>

      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {error || "We're having trouble loading the blood requests. This could be due to a network issue or a server problem."}
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium inline-flex items-center justify-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Page
        </button>

        <Link
          to="/"
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium border border-gray-300 inline-flex items-center justify-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Homepage
        </Link>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-left">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Troubleshooting Tips
        </h3>
        <ul className="text-sm text-blue-700 space-y-1 ml-7 list-disc">
          <li>Check your internet connection</li>
          <li>Try refreshing the page</li>
          <li>Clear your browser cache</li>
          <li>If the problem persists, try again later</li>
        </ul>
      </div>
    </div>
  );
};

export default FallbackErrorComponent;
