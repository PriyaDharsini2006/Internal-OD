'use client'
import React, { useState, useEffect } from 'react';
import Loading from '.././Loading';
import { User, CalendarDays, Printer, Menu, X, Send, Loader2 } from 'lucide-react';
import { getSession } from 'next-auth/react'
export const Approved = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [hall, setHall] = useState('');
  const [note, setNote] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [hasSpecialAccess, setHasSpecialAccess] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const ALLOWED_EMAILS = [
    'mukeshg.cse2023@citchennai.net',
    'dharsinidhipu2006@gmail.com', 
    'sanjayb.cse2021@citchennai.net'
  ];
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      try {
        // Get session and user email
        const session = await getSession();
        if (session) {
          const email = session.user.email;
          console.log(session.user.email);
          setUserEmail(email);

          // Check if user has special access
          setHasSpecialAccess(ALLOWED_EMAILS.includes(email));
        }

        // Fetch approved requests
        await fetchApprovedRequests();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRequests();
  }, [])
 
 
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

  const handleGenerateExcel = async () => {
    try {
      setSendingEmails(true);
      setEmailStatus(null);
      
      // Fetch Excel file
      const response = await fetch('/api/requests?status=1&export=excel');
  
      if (!response.ok) {
        throw new Error('Failed to generate Excel file');
      }
  
      const excelBlob = await response.blob();
  
      // Create FormData to send Excel file
      const formData = new FormData();
      formData.append('file', excelBlob, 'approved_requests.xlsx');
      formData.append('subject', 'Approved Requests');
      formData.append('hall', hall);
      formData.append('note', note);
  
      // Send Excel file to email route
      const emailResponse = await fetch('https://mail-render-vsmd.onrender.com/api/send-emails', {
        method: 'POST',
        body: formData
      });
      
      const result = await emailResponse.json();
  
      if (emailResponse.ok) {
        setEmailStatus({
          success: true,
          message: 'Emails sent successfully',
          totalEmails: result.totalEmails,
          successfulEmails: result.successfulEmails,
          failedEmails: result.failedEmails,
          results: result.results
        });
      } else {
        setEmailStatus({
          success: false,
          message: result.error || 'Failed to send emails',
          totalEmails: 0,
          successfulEmails: 0,
          failedEmails: 0
        });
      }
    } catch (err) {
      console.error('Excel generation and email sending error:', err);
      setEmailStatus({
        success: false,
        message: err.message,
        totalEmails: 0,
        successfulEmails: 0,
        failedEmails: 0
      });
    } finally {
      setSendingEmails(false);
    }
  };

  const renderEmailStatus = () => {
    if (!emailStatus) return null;
  
    console.log('Current emailStatus:', emailStatus);
  
    return (
      <div className={`p-4 rounded mt-4 ${
        emailStatus.success ? 'bg-white/5 border border-[#00f5d0]/20' : 'bg-red-100 text-red-800'
      }`}>
        <div className="mb-4 text-[#00f5d0]">
          {emailStatus.message}
        </div>
        
        <div className="grid grid-cols-1 gap-1 mb-1">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-sm text-gray-400">Total Emails</div>
            <div className="text-2xl font-bold text-[#00f5d0]">
              {emailStatus.totalEmails || 0}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-sm text-gray-400">Successfully Sent</div>
            <div className="text-2xl font-bold text-[#00f5d0]">
              {emailStatus.successfulEmails || 0}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-sm text-gray-400">Failed</div>
            <div className="text-2xl font-bold text-red-500">
              {emailStatus.failedEmails || 0}
            </div>
          </div>
        </div>
  
        {emailStatus.results && emailStatus.results.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold text-[#00f5d0] mb-2">Detailed Results:</h4>
            <div className="max-h-60 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {emailStatus.results.map((result, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-4 py-2 text-sm text-gray-300">{result.email}</td>
                      <td className={`px-4 py-2 text-sm ${
                        result.status === 'Success' ? 'text-[#00f5d0]' : 'text-red-400'
                      }`}>
                        {result.status}
                        {result.error && <span className="text-red-400"> ({result.error})</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };
 
  const generateExcelButton = hasSpecialAccess && (
    <div className="flex flex-col">
      <button
        onClick={handleGenerateExcel}
        disabled={sendingEmails}
        className={`flex items-center justify-center bg-[#00f5d0] text-black px-4 py-2 rounded transition ${
          sendingEmails ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#00f5d0]'
        }`}
      >
        {sendingEmails ? (
          <>
            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
            Sending Emails...
          </>
        ) : (
          <>
            <Send className="mr-2 w-5 h-5" />
            Send Emails
          </>
        )}
      </button>
      {renderEmailStatus()}
    </div>
  );


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return <Loading />;
  }
  
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
              <X className="mr-2 print:hidden w-5 h-5" />
              <span className="print:hidden">Close Menu</span>
            </>
          ) : (
            <>
              <Menu className="mr-2 print:hidden w-5 h-5" />
              <span className="print:hidden">Actions</span>
            </>
          )}
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-actions mt-2 space-y-2">
            {hasSpecialAccess && (
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Enter Hall"
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0] text-sm"
                />
                <input
                  type="text"
                  placeholder="Enter Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0] text-sm"
                />
                {generateExcelButton}
              </div>
            )}
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center bg-[#00f5d0] text-black px-4 py-2 rounded hover:bg-[#00f5d0] transition"
            >
              <Printer className="mr-2 w-5 h-5" />
              Generate Report
            </button>
          </div>
        )}
      </div>

      {/* Browser-only view */}
      <div className="browser-view backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden">
          {/* Desktop Print Section */}
          <div className="hidden lg:block p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex items-center space-x-4">
                <img
                  className="w-24 h-24 lg:w-36 lg:h-36 rounded object-contain"
                  src="/logo1.png"
                  alt="Company Logo"
                />
                <p className='text-[#00f5d0] text-sm lg:text-base'>{formattedDate}</p>
              </div>
              <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {hasSpecialAccess && (
                <div className="w-full lg:w-1/2 space-y-4">
                  <input
                    type="text"
                    placeholder="Enter Hall"
                    value={hall}
                    onChange={(e) => setHall(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0] text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Enter Note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0] text-sm"
                  />
                  
                  <div className="flex space-x-4">
                    {generateExcelButton}
                  </div>
                  <div className="flex space-x-4">
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center bg-[#00f5d0] text-black px-4 py-2 rounded hover:bg-[#00f5d0] hover:text-black transition"
                  >
                    <Printer className="mr-2 w-5 h-5" />
                    Generate Report
                  </button>
                </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Requests Table */}
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
              <tbody className="divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                      No approved requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-800 transition">
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
                        <div className="text-sm text-white font-medium">
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
                className="w-24 sm:w-24 h-auto"
              />
              <img
                id="hackerzLogo"
                src="logo.png"
                alt="Hackerz Logo"
                className="w-20 sm:w-24 h-auto"
              />
            </div>

            <div className="address-from mb-4 sm:mb-6">
              <strong>From</strong>
              <div className="text-sm text-black sm:text-base">
                Team Hackerz24,<br />
                Department of Computer Science,<br />
                Chennai Institute of Technology,<br />
                Sarathy Nagar, Nandambakkam Post,<br />
                Kundrathur, Chennai-600069.
              </div>
            </div>

            <div className="address-to text-black mb-4 sm:mb-6">
              <strong>To</strong>
              <div className="text-sm text-black sm:text-base">
                The Head of Department,<br />
                Chennai Institute of Technology,<br />
                Sarathy Nagar, Nandambakkam Post,<br />
                Kundrathur, Chennai-600069.
              </div>
            </div>

            <div className="subject font-bold text-black mb-4 sm:mb-6 text-sm sm:text-base">
              Subject: Requesting permission for OD regarding Hackerz24 symposium.
            </div>

            <div className="content leading-relaxed text-black mb-6 sm:mb-10 text-sm sm:text-base">
              <p>Respected Mam,</p>
              <p>We hereby request you to grant permission for the following list of students to pursue our work for Hackerz. We request you to kindly grant permission for the mentioned students on {currentDate}.</p>
            </div>

            <div className="closing mb-4 sm:mb-7 text-black text-sm sm:text-base">
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
                  <p className="text-black m-0">Head of Department</p>
                  <p className="text-black m-0">Computer Science and Engineering</p>
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
  /* Existing print styles */
  nav, .mobile-actions {
    display: none !important;
  }

  footer {
    display: none !important;
  }

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
    
    /* New border styles */
    
    
    margin: 5mm;
    padding: 5mm;
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