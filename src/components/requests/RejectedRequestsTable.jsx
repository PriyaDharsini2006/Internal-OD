'use client'
import React, { useState, useEffect } from 'react';
import { XCircle, User, CalendarDays, Printer } from 'lucide-react';

export const RejectedRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="print-container">
      {/* Browser-only view */}
      <div className="browser-view">
        {/* Print Button - Visible only in browser */}
        <div className="p-4 flex justify-end print:hidden">
          <button 
            onClick={handlePrint} 
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <Printer className="mr-2  w-5 h-5" /> Print
          </button>
        </div>

        {/* Table-only view for browser */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No rejected requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.requestType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-500 font-medium">
                            Rejected
                          </span>
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
              className="w-24 h-auto"
            />
            <img 
              id="hackerzLogo" 
              src="logo.png" 
              alt="Hackerz Logo" 
              className="w-24 h-auto"
            />
          </div>

          <div className="address-from mb-6">
            <strong>From</strong>
            <div>
              Team Hackerz'24,<br />
              Department of Computer Science,<br />
              Chennai Institute of Technology,<br />
              Sarathy Nagar, Nandambakkam Post,<br />
              Kundrathur, Chennai-600069.
            </div>
          </div>

          <div className="address-to mb-6">
            <strong>To</strong>
            <div>
              The Head of Department,<br />
              Chennai Institute of Technology,<br />
              Sarathy Nagar, Nandambakkam Post,<br />
              Kundrathur, Chennai-600069.
            </div>
          </div>

          <div className="subject font-bold mb-6">
            Subject: Requesting permission for OD regarding Hackerz'24 symposium.
          </div>

          <div className="content leading-relaxed mb-10">
            <p>Respected Mam,</p>
            <p>We hereby request you to grant permission for the following list of students to pursue our work for Hackerz. We request you to kindly grant permission for the mentioned students on {currentDate}.</p>
          </div>

          <div className="closing mb-7">
            Regards,<br />
            Team Hackerz'24
          </div>

          <div className="signature-section flex items-center">
            <img 
              className="signature-img w-40 h-auto mr-4" 
              src="sign.png" 
              alt="Signature" 
            />
            <div>
              <p className="m-0">Head of Department</p>
              <p className="m-0">Computer Science and Engineering</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No rejected requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <User className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.studentId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.requestType}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-500 font-medium">
                              Rejected
                            </span>
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
    nav {
      display: none !important;
    }

    /* Ensure the printed content starts from the top */
    .print-container {
      margin-top: 0 !important;
    }

    body {
      margin: 0;
      padding: 0;
    }

    .print-page {
      page-break-after: always;
      margin: 0;
      padding: 2rem;
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

export default RejectedRequestsTable; 