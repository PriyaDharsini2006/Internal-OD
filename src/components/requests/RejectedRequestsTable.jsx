'use client'
import React, { useState, useEffect } from 'react';
import { User, CalendarDays, Printer, Menu, X, XCircle, RefreshCw } from 'lucide-react';

export const Rejected = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    fetchRejectedRequests();
  }, []);

  const fetchRejectedRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=-1');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnreject = async (requestId) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/unreject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 0 })
      });

      if (!response.ok) throw new Error('Failed to unreject request');
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Format time without date
  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 text-center p-4">
      Error: {error}
    </div>
  );

  return (
    <div className="print-container container mx-auto px-4 sm:px-6 lg:px-8">
    {/* Mobile Menu Toggle */}
    <div className="lg:hidden mb-4">
        <button 
          onClick={toggleMobileMenu} 
          className="flex print:hidden items-center justify-center w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {isMobileMenuOpen ? (
            <>
              <X className="mr-2 w-5 h-5" />
              Close Menu
            </>
          ) : (
            <>
              <Menu className="mr-2 print:hidden w-5 h-5" />
              Actions
            </>
          )}
        </button>

        
      </div>

      {/* Browser-only view */}
      <div className="browser-view backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden">
          {/* Desktop Print Button */}
          <div className="hidden lg:block p-4 flex justify-end print:hidden">
            <div className='flex flex-row space-x-96'>
              <div className="flex-shrink-0 ">
                <img 
                  className="w-36 h-36 rounded object-contain" 
                  src="/logo1.png" 
                  alt="Company Logo" 
                />
              </div>
              <div className="py-10 justify-start print:hidden">
                
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto print:hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Request Details
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                      No rejected requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3 hidden sm:block" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {request.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user.sec} Year {request.user.year}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gwhite font-medium">
                          {request.reason}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.description}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          <CalendarDays className="w-5 h-5 text-gray-400 mr-3 hidden sm:block" />
                          <div>
                            <div className="text-sm text-white">
                              From: {formatTime(request.from_time)}
                            </div>
                            <div className="text-sm text-white">
                              To: {formatTime(request.to_time)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button 
                          onClick={() => handleUnreject(request.id)}
                          className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        >
                          <RefreshCw className="mr-2 w-5 h-5" />
                          Unreject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rejected;
