'use client'
import React, { useState, useEffect } from 'react';
import { User, CalendarDays, Printer, Menu, X } from 'lucide-react';

export const Approved = () => {
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
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=1');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
          className="flex items-center justify-center w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {isMobileMenuOpen ? (
            <>
              <X className="mr-2 w-5 h-5" />
              Close Menu
            </>
          ) : (
            <>
              <Menu className="mr-2 w-5 h-5" />
              Actions
            </>
          )}
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-actions mt-2 space-y-2">
            <button 
              onClick={handlePrint} 
              className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              <Printer className="mr-2 w-5 h-5" />
              Print
            </button>
          </div>
        )}
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
              <p className='text-[#00f5d0]'>{formattedDate}</p>
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
            {/* <button 
              onClick={handlePrint} 
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              <Printer className="mr-2 w-5 h-5" />
              Print
            </button> */}
          </div>
          
          <div className="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                      No approved requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex  items-center">
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
                      <td className="px-4 sm:px-6  py-4">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print View - Full Document */}
      <div className="print-view hidden print:block">
        {/* First Page Content */}
        <div className="first-page print-page">
          <div className="header flex justify-between items-center mb-8">
            <img 
              id="citLogo" 
              src="citlogo.png" 
              alt="Chennai Institute of Technology Logo" 
              className="w-16 sm:w-24 h-auto"
            />
            <img 
              id="hackerzLogo" 
              src="logo.png" 
              alt="Hackerz Logo" 
              className="w-16 sm:w-24 h-auto"
            />
          </div>

          <div className="address-from mb-4 sm:mb-6">
            <strong>From</strong>
            <div className="text-sm sm:text-base">
              Team Hackerz24,<br />
              Department of Computer Science,<br />
              Chennai Institute of Technology,<br />
              Sarathy Nagar, Nandambakkam Post,<br />
              Kundrathur, Chennai-600069.
            </div>
          </div>

          <div className="address-to mb-4 sm:mb-6">
            <strong>To</strong>
            <div className="text-sm sm:text-base">
              The Head of Department,<br />
              Chennai Institute of Technology,<br />
              Sarathy Nagar, Nandambakkam Post,<br />
              Kundrathur, Chennai-600069.
            </div>
          </div>

          <div className="subject font-bold mb-4 sm:mb-6 text-sm sm:text-base">
            Subject: Requesting permission for OD regarding Hackerz24 symposium.
          </div>

          <div className="content leading-relaxed mb-6 sm:mb-10 text-sm sm:text-base">
            <p>Respected Mam,</p>
            <p>We hereby request you to grant permission for the following list of students to pursue our work for Hackerz. We request you to kindly grant permission for the mentioned students on {currentDate}.</p>
          </div>

          <div className="closing mb-4 sm:mb-7 text-sm sm:text-base">
            Regards,<br />
            Team Hackerz24
          </div>

          <div className="signature-section mt-8 flex flex-col items-end justify-end">
  <div className="flex flex-col items-center">
    <img 
      className="w-20 md:w-32 h-12 mb-2" 
      src="sign.png" 
      alt="Signature" 
    />
    <div className="text-sm md:text-base text-center">
      <p className="m-0">Head of Department</p>
      <p className="m-0">Computer Science and Engineering</p>
    </div>
  </div>
</div>

        </div>

        {/* Second Page - Requests Table */}
        <div className="second-page print-page">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Request Details
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                        No approved requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-gray-400 mr-3 hidden sm:block" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user.sec} Year {request.user.year}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                          <div className="text-sm text-gray-900 font-medium">
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
                              <div className="text-sm text-gray-900">
                                From: {formatTime(request.from_time)}
                              </div>
                              <div className="text-sm text-gray-900">
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

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Hide the navbar during print */
          nav, .mobile-actions {
            display: none !important;
          }
            footer{
            display:none !important}

          /* Ensure the printed content starts from the top */
          .print-container {
            margin-top: 0 !important;
            padding: 0 !important;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .print-page {
            page-break-after: always;
            margin: 0;
            padding: 1rem sm:2rem;
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

        /* Mobile and Responsive Adjustments */
        @media (max-width: 640px) {
          .px-6 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .text-sm {
            font-size: 0.75rem;
            line-height: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Approved;