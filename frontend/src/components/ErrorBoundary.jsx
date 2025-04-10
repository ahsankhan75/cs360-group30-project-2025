import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const isApiError = this.state.error?.message?.includes('Cannot connect to server');
      
      return (
        <div className="p-8 bg-red-50 rounded-lg shadow-md border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-4">Something went wrong</h2>
          
          {isApiError ? (
            <div>
              <p className="text-gray-800 mb-4">
                We couldn't connect to the server. This usually happens when the backend server is not running.
              </p>
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Possible solutions:</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Make sure the backend server is running on port 4000</li>
                  <li>Check that the .env file exists in the backend directory with correct settings</li>
                  <li>Look at the terminal running the backend for error messages</li>
                  <li>Try restarting both the frontend and backend servers</li>
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{this.state.error?.message || 'Unknown error occurred'}</p>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
