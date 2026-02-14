import React, { useState } from "react";
import { motion } from "framer-motion";

const TestConnection = () => {
  const [backendStatus, setBackendStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/test");
      const data = await response.json();
      setBackendStatus(data);
    } catch (error) {
      setBackendStatus({ success: false, message: error.message });
    }
    setLoading(false);
  };

  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/test-db");
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      setDbStatus({ success: false, message: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Connection Test
        </h1>

        <div className="space-y-4">
          {/* Test Backend Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={testBackend}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Backend Connection"}
          </motion.button>

          {/* Backend Status */}
          {backendStatus && (
            <div
              className={`p-4 rounded-lg ${
                backendStatus.success
                  ? "bg-green-100 border-2 border-green-500"
                  : "bg-red-100 border-2 border-red-500"
              }`}
            >
              <p
                className={`font-semibold ${
                  backendStatus.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {backendStatus.success ? "Backend Connected!" : "Backend Connection Failed"}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {backendStatus.message}
              </p>
            </div>
          )}

          {/* Test Database Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={testDatabase}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Database Connection"}
          </motion.button>

          {/* Database Status */}
          {dbStatus && (
            <div
              className={`p-4 rounded-lg ${
                dbStatus.success
                  ? "bg-green-100 border-2 border-green-500"
                  : "bg-red-100 border-2 border-red-500"
              }`}
            >
              <p
                className={`font-semibold ${
                  dbStatus.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {dbStatus.success ? " Database Connected!" : " Database Connection Failed"}
              </p>
              <p className="text-sm text-gray-700 mt-2">{dbStatus.message}</p>
              {dbStatus.note && (
                <p className="text-sm text-gray-600 mt-1 italic">
                  Note: {dbStatus.note}
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">
               Instructions:
            </h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Test Backend Connection"</li>
              <li>Then click "Test Database Connection"</li>
              <li>Both should show green checkmarks if everything is working</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;