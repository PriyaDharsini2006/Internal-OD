'use client'
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Search, Printer } from 'lucide-react';

const MeetingUsers = () => {
  const [meetingUsers, setMeetingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  // Get current date in a readable format
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    fetchMeetingUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = meetingUsers.filter((user) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, meetingUsers]);

  const fetchMeetingUsers = async () => {
    try {
      const response = await fetch('/api/meeting-users');
      if (!response.ok) throw new Error('Failed to fetch meeting users');
      const data = await response.json();
      setMeetingUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center mb-2 sm:mb-0">
            <Calendar className="w-5 h-5 mr-2 print:hidden text-blue-600" />
            <h2 className="text-lg font-semibold print:hidden text-gray-800">
              Meeting Users Count
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="relative w-full max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 print:hidden text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-3 py-2 border print:hidden border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={handlePrint}
              className="flex items-center bg-blue-500 print:hidden text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto justify-center"
            >
              <Printer className="w-5 print:hidden h-5 mr-2" />
              Print
            </button>
          </div>
        </div>
        
        {/* Printable Content */}
        <div className="hidden print:block print-content">
          {/* First Page */}
          <div className="first-page print-page p-6">
            <div className="header flex justify-between items-center mb-8">
              <img 
                id="citLogo" 
                src="/citlogo.png" 
                alt="Chennai Institute of Technology Logo" 
                className="w-16 sm:w-24 h-auto"
              />
              <img 
                id="hackerzLogo" 
                src="/logo.png" 
                alt="Hackerz Logo" 
                className="w-16 sm:w-24 h-auto"
              />
            </div>

            <div className="address-from mb-6 text-sm sm:text-base">
              <strong>From</strong>
              <div>
                Team Hackerz24,<br />
                Department of Computer Science,<br />
                Chennai Institute of Technology,<br />
                Sarathy Nagar, Nandambakkam Post,<br />
                Kundrathur, Chennai-600069.
              </div>
            </div>

            <div className="address-to mb-6 text-sm sm:text-base">
              <strong>To</strong>
              <div>
                The Head of Department,<br />
                Chennai Institute of Technology,<br />
                Sarathy Nagar, Nandambakkam Post,<br />
                Kundrathur, Chennai-600069.
              </div>
            </div>

            <div className="subject font-bold mb-6 text-sm sm:text-base">
              Subject: Requesting permission for OD regarding Hackerz24 symposium.
            </div>

            <div className="content leading-relaxed mb-10 text-sm sm:text-base">
              <p>Respected Mam,</p>
              <p>We hereby request you to grant permission for the following list of students to pursue our work for Hackerz. We request you to kindly grant permission for the mentioned students on {currentDate}.</p>
            </div>

            <div className="closing mb-7 text-sm sm:text-base">
              Regards,<br />
              Team Hackerz24
            </div>

            <div className="signature-section flex items-center">
              <img 
                className="signature-img w-24 sm:w-40 h-auto mr-3" 
                src="/sign.png" 
                alt="Signature" 
              />
              <div className="text-sm sm:text-base">
                <p className="m-0">Head of Department</p>
                <p className="m-0">Computer Science and Engineering</p>
              </div>
            </div>
          </div>

          {/* Second Page - Meeting Users Table */}
          <div className="second-page print-page p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Meeting Users List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meeting Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.email}>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.meeting_cnt > 5 
                          ? 'bg-red-100 text-red-800'
                          : user.meeting_cnt > 2 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                          {user.meeting_cnt}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Regular View */}
        <div className="overflow-x-auto print:hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meeting Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                    No meeting users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.email}>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.meeting_cnt > 5 
                        ? 'bg-red-100 text-red-800'
                        : user.meeting_cnt > 2 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                        {user.meeting_cnt}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        }
      `}</style>
    </div>
  );
};

export default MeetingUsers;