'use client'
import React, { useState, useEffect } from 'react';
import { User, CalendarDays } from 'lucide-react';
import Loading from  '.././Loading';

export const HackerzPrintView = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=0');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) return (
    <div className="text-red-600 text-center p-4 w-full">
      Error: {error}
    </div>
  );

  if(loading) {
    return <Loading/>;
  }

  return (
    <div className="bg-black text-white shadow-sm rounded-lg overflow-hidden">
     
      {/* Browser-only view */}
      <div className="browser-view">
        <div className=" shadow-sm rounded-lg overflow-hidden w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4">
            <div className="w-36 h-36 rounded object-contain">
              <img 
                className="w-full h-auto rounded object-contain" 
                src="/logo1.png" 
                alt="Company Logo" 
              />
            </div>
            <div className="py-10 justify-start print:hidden">
          
          
        </div>
          </div>
          
          {/* Table Section */}
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-3 md:px-6 py-4 text-center text-gray-500">
                      No pending requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 md:w-5 md:h-5 text-white  flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {request.user.name}
                            </div>
                            <div className="text-xs md:text-sm text-white">
                              {request.user.sec} Year {request.user.year}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="text-sm text-white font-medium line-clamp-2">
                          {request.reason}
                        </div>
                        <div className="text-xs md:text-sm text-white line-clamp-2">
                          {request.description}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="text-xs md:text-sm text-white">
                              From: {formatTime(request.from_time)}
                            </div>
                            <div className="text-xs md:text-sm text-white">
                              To: {formatTime(request.to_time)}
                            </div>
                          </div>
                        </div>
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

export default HackerzPrintView;