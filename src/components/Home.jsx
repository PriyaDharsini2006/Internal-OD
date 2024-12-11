'use client'
import React, { useState, useEffect } from 'react';
import { User, CalendarDays, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from './Loading';

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

  const filterRequests = () => {
    let result = requests;

    if (searchTerm) {
      result = result.filter(request => 
        request.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearFilter) {
      result = result.filter(request => 
        request.user.year.toString() === yearFilter
      );
    }

    if (sectionFilter) {
      result = result.filter(request => 
        request.user.sec.toLowerCase() === sectionFilter.toLowerCase()
      );
    }

    setFilteredRequests(result);
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const uniqueYears = [...new Set(requests.map(req => req.user.year))];
  const uniqueSections = [...new Set(requests.map(req => req.user.sec))];

  if (loading) return (
    <Loading/>
  );

  if (error) return (
    <div className="text-red-400 text-center p-4 bg-black">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-300">
      <div className="container mx-auto p-4">
        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white/5 backdrop-blur-xl rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00f5d0] transition-all"
            />
            <Search className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
          </div>

          {/* Year Filter */}
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-3.5 bg-white/5 backdrop-blur-xl rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00f5d0] transition-all"
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
            className="px-4 py-3.5 bg-white/5 backdrop-blur-xl rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00f5d0] transition-all"
          >
            <option value="">All Sections</option>
            {uniqueSections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>

        {/* Results Container */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {currentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                      No approved requests found
                    </td>
                  </tr>
                ) : (
                  currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-[#00f5d0] mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-200">
                              {request.user.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              Section {request.user.sec} Year {request.user.year}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200 font-medium">
                          {request.reason}
                        </div>
                        <div className="text-sm text-gray-400">
                          {request.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CalendarDays className="w-5 h-5 text-[#00f5d0] mr-3" />
                          <div>
                            <div className="text-sm text-gray-200">
                              From: {formatTime(request.from_time)}
                            </div>
                            <div className="text-sm text-gray-200">
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
            <div className="flex justify-between items-center px-6 py-4 bg-white/5">
              <div className="text-sm text-gray-400">
                Showing {' '}
                <span className="font-medium text-gray-300">
                  {indexOfFirstItem + 1}
                </span>
                {' '} to {' '}
                <span className="font-medium text-gray-300">
                  {Math.min(indexOfLastItem, filteredRequests.length)}
                </span>
                {' '} of {' '}
                <span className="font-medium text-gray-300">
                  {filteredRequests.length}
                </span>
                {' '} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-gray-300 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-gray-300 transition-all"
                >
                  Next <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approved;