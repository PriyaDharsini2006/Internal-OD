'use client'
import React, { useState, useEffect } from 'react';
import { User, Activity, Search, Printer, Menu, X } from 'lucide-react';

const StaybackUsers = () => {
  const [staybackUsers, setStaybackUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current date in a readable format
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    fetchStaybackUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = staybackUsers.filter((user) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, staybackUsers]);

  const fetchStaybackUsers = async () => {
    try {
      const response = await fetch('/api/stayback-users');
      if (!response.ok) throw new Error('Failed to fetch stayback users');
      const data = await response.json();
      setStaybackUsers(data);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Stayback count badge color logic
  const getStaybackBadgeClass = (count) => {
    if (count > 5) return 'bg-red-100 text-red-800';
    if (count > 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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
    <div className="bg-white shadow-sm rounded-lg overflow-hidden max-w-full">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden p-4 flex justify-end print:hidden">
        <button 
          onClick={toggleMobileMenu} 
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Header with Search and Print */}
      <div className="p-4 bg-gray-50 border-b flex flex-col lg:flex-row items-center justify-between">
        <div className="flex items-center mb-4 lg:mb-0">
          <Activity className="w-5 h-5 mr-2 print:hidden text-blue-600" />
          <h2 className="text-lg font-semibold print:hidden text-gray-800">
            Stayback Users Count
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 print:hidden text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-3 py-2 print:hidden border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center print:hidden bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors w-full lg:w-auto justify-center"
          >
            <Printer className="w-5 h-5 print:hidden mr-2" />
            Print
          </button>
        </div>
      </div>
      
      {/* Printable Content */}
      <div className="hidden print:block print-content">
        {/* [Previous print content remains the same] */}
        {/* (keep the existing print view content) */}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block print:hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stayback Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No stayback users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.email}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStaybackBadgeClass(user.stayback_cnt)}`}>
                        {user.stayback_cnt}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden px-4 py-2 print:hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No stayback users found
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user.email} 
              className="bg-white shadow-sm rounded-lg mb-4 p-4 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <User className="w-6 h-6 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStaybackBadgeClass(user.stayback_cnt)}`}>
                  {user.stayback_cnt}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          nav {
            display: none !important;
          }

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
        }

        @media screen and (max-width: 640px) {
          .px-6 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StaybackUsers;