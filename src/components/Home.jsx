'use client'
import React, { useState, useEffect } from 'react';
import { User, CalendarDays, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const Approved = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  // Apply filters and reset pagination whenever search term, year, or section changes
  useEffect(() => {
    filterRequests();
    setCurrentPage(1);
  }, [requests, searchTerm, yearFilter, sectionFilter]);

  const fetchApprovedRequests = async () => {
    try {
      const response = await fetch('/api/req?status=1');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search term, year, and section
  const filterRequests = () => {
    let result = requests;

    // Filter by search term (name)
    if (searchTerm) {
      result = result.filter(request => 
        request.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by year
    if (yearFilter) {
      result = result.filter(request => 
        request.user.year.toString() === yearFilter
      );
    }

    // Filter by section
    if (sectionFilter) {
      result = result.filter(request => 
        request.user.sec.toLowerCase() === sectionFilter.toLowerCase()
      );
    }

    setFilteredRequests(result);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format time without date
  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get unique years and sections for filters
  const uniqueYears = [...new Set(requests.map(req => req.user.year))];
  const uniqueSections = [...new Set(requests.map(req => req.user.sec))];

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
    <div className="container mx-auto p-4">
      {/* Search and Filter Section */}
      <div className="mb-4 flex space-x-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>

        {/* Year Filter */}
        <select 
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          {uniqueYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {/* Section Filter */}
        <select 
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sections</option>
          {uniqueSections.map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>
      </div>

      {/* Results Container */}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequests.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No approved requests found
                  </td>
                </tr>
              ) : (
                currentRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Section {request.user.sec} Year {request.user.year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {request.reason}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <CalendarDays className="w-5 h-5 text-gray-400 mr-3" />
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

        {/* Pagination Controls */}
        {filteredRequests.length > ITEMS_PER_PAGE && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing {' '}
              <span className="font-medium">
                {indexOfFirstItem + 1}
              </span>
              {' '} to {' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredRequests.length)}
              </span>
              {' '} of {' '}
              <span className="font-medium">
                {filteredRequests.length}
              </span>
              {' '} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approved;