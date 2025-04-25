import React, { useState, useEffect } from 'react';

const ErrorPage = ({ message = "Unable to connect to server. Please try again later.", onRetry }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup loading state when component unmounts
      setIsLoading(false);
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    
    if (onRetry) {
      // Call the retry function provided by the parent
      onRetry().finally(() => {
        setIsLoading(false);
      });
    } else {
      // Default behavior: reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-gray-600">Connecting to server...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-700 mb-6">{message}</p>
            <button 
              onClick={handleRetry}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
