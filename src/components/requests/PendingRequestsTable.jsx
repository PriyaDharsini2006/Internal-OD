'use client'
import React, { useState, useEffect } from 'react';
import { User, CalendarDays, Printer } from 'lucide-react';
import { Copyright } from 'lucide-react';

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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px] w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 text-center p-4 w-full">
      Error: {error}
    </div>
  );

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
          
          <button 
            onClick={handlePrint} 
            className="flex items-center  bg-[#00f5d0] text-black px-6 py-4 rounded hover:bg-white/5 hover:text-white transition"
          >
            <Printer className="mr-2 w-5 h-5" />
            Print
          </button>
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

      {/* Print View */}
      <div className="print-view hidden print:block">
        {/* First Page */}
        <div className="first-page print-page">
          <div className="header flex justify-between items-center mb-6 md:mb-8">
            <img 
              src="citlogo.png" 
              alt="Chennai Institute of Technology Logo" 
              className="w-16 md:w-24 h-auto"
            />
            <img 
              src="logo.png" 
              alt="Hackerz Logo" 
              className="w-16 md:w-24 h-auto"
            />
          </div>

          <div className="space-y-6">
            <div className="address-from">
              <strong>From</strong>
              <div className="text-sm md:text-base mt-2">
                Team Hackerz24,<br />
                Department of Computer Science,<br />
                Chennai Institute of Technology,<br />
                Sarathy Nagar, Nandambakkam Post,<br />
                Kundrathur, Chennai-600069.
              </div>
            </div>

            <div className="address-to">
              <strong>To</strong>
              <div className="text-sm md:text-base mt-2">
                The Head of Department,<br />
                Chennai Institute of Technology,<br />
                Sarathy Nagar, Nandambakkam Post,<br />
                Kundrathur, Chennai-600069.
              </div>
            </div>

            <div className="subject font-bold text-sm md:text-base">
              Subject: Requesting permission for OD regarding Hackerz24 symposium.
            </div>

            <div className="content text-sm md:text-base space-y-4">
              <p>Respected Mam,</p>
              <p>We hereby request you to grant permission for the following list of students to pursue our work for Hackerz. We request you to kindly grant permission for the mentioned students on {currentDate}.</p>
            </div>

            <div className="mt-8 md:mt-12">
              <div className="text-sm md:text-base">
                Regards,<br />
                Team Hackerz24
              </div>
            </div>

            <div className="signature-section mt-8 flex flex-col  items-end justify-end">
              <img 
                className="w-20 md:w-32 h-12 " 
                src="sign.png" 
                alt="Signature" 
              />
              <div className="text-sm md:text-base">
                <p className="m-0 ml-10">Head of Department</p>
                <p className="m-0">Computer Science and Engineering</p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Page - Requests Table */}
        <div className="second-page print-page">
          {/* Table contents remain the same as browser view */}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          nav, footer {
            display: none !important;
          }

          .print-container {
            margin: 0 !important;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .print-page {
            page-break-after: always;
            margin: 0;
            padding: 1rem md:2rem;
          }

          .print-page:last-child {
            page-break-after: avoid;
          }

          .print:hidden {
            display: none !important;
          }

          .browser-view {
            display: none !important;
          }

          .print-view {
            display: block !important;
          }
        }

        @media screen {
          .print-view {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HackerzPrintView;