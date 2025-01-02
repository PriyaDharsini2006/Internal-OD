import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00f5d0]"></div>
  </div>
);

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/10 p-6 rounded-lg shadow-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00f5d0] mx-auto"></div>
      <p className="text-[#00f5d0] mt-4 text-center">Processing...</p>
    </div>
  </div>
);

const ODRequestApproval = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [uniqueReasons, setUniqueReasons] = useState(['All']);
  const [uniqueYears, setUniqueYears] = useState(['All']);
  const [selectedReason, setSelectedReason] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showBatchTimingForm, setShowBatchTimingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchTimings, setBatchTimings] = useState({ from_time: '', to_time: '' });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  const formatTime = useCallback((time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleReasonSelect = useCallback((reason) => {
    setSelectedReason(reason);
    setCurrentPage(1);
  }, []);

  const handleYearSelect = useCallback((year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  }, []);

  const toggleSelection = useCallback((odId) => {
    setSelectedRequests(prev =>
      prev.includes(odId) ? prev.filter(id => id !== odId) : [...prev, odId]
    );
  }, []);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedRequests.length === 0) {
      setError('Please select at least one request');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/od-request/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          requestIds: selectedRequests,
          action,
          ...(action === 'modify' && batchTimings)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process requests');
      }

      const updatedResponse = await fetch('/api/od-request?status=0', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!updatedResponse.ok) {
        throw new Error('Failed to fetch updated requests');
      }

      const data = await updatedResponse.json();
      setRequests(data);
      setSelectedRequests([]);
      setShowBatchTimingForm(false);

      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'modified';
      alert(`Successfully ${actionText} ${selectedRequests.length} request(s)`);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the requests');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedRequests, batchTimings]);


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'HOD') {
        router.push('/unauthorized');
      } else {
        const fetchData = async () => {
          try {
            const response = await fetch('/api/od-request?status=0');
            const data = await response.json();
            setRequests(data);
            setUniqueReasons(['All', ...new Set(data.map(request => request.reason).filter(Boolean))]);
            setUniqueYears(['All', ...new Set(data.map(request => request.year).filter(Boolean))]);
          } catch (error) {
            setError('Failed to load requests');
          } finally {
            setIsLoading(false);
          }
        };
        fetchData();
      }
    }
  }, [status, session, router]);


  const getFilteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesReason = selectedReason === 'All' || request.reason === selectedReason;
      const matchesYear = selectedYear === 'All' || String(request.year).trim() === String(selectedYear).trim();
      const matchesSearch = !searchQuery || request.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesReason && matchesYear && matchesSearch;
    });
  }, [requests, selectedReason, selectedYear, searchQuery]);


  const toggleSelectAll = () => {
    const filteredRequests = getFilteredRequests;
    setSelectedRequests(
      selectedRequests.length === filteredRequests.length
        ? []
        : filteredRequests.map(r => r.od_id)
    );
  };

  const renderBulkActionButtons = () => {
    if (selectedRequests.length === 0) {
      return null;
    }

    return (
      <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg mt-4">
        <div className="text-gray-300">
          {selectedRequests.length} request(s) selected
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowBatchTimingForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            disabled={isProcessing}
          >
            Modify Timings
          </button>
          <button
            onClick={() => handleBulkAction('approve')}
            className="bg-[#00f5d0] font-grotesk w-full sm:w-auto text-sm sm:text-base hover:opacity-90 text-black font-bold py-2 px-4 rounded flex items-center justify-center"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleBulkAction('reject')}
            className="bg-red-500 font-grotesk w-full sm:w-auto text-sm sm:text-base hover:opacity-90 text-black font-bold py-2 px-4 rounded flex items-center justify-center"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      </div>
    );
  };


  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return getFilteredRequests.slice(startIndex, startIndex + recordsPerPage);
  }, [getFilteredRequests, currentPage]);

  const totalPages = useMemo(() =>
    Math.ceil(getFilteredRequests.length / recordsPerPage)
    , [getFilteredRequests.length]);

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      {isProcessing && <LoadingOverlay />}
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">

        <div className="flex flex-row">
          <div className="flex-shrink-0 ">
            <img
              className="w-36 h-36 rounded object-contain"
              src="/logo1.png"
              alt="Company Logo"
            />
          </div>
          <div className="py-10 print:hidden">
            <h1 className="text-2xl px-36 py-6 md:text-3xl font-grotesk font-bold text-[#00f5d0]">
              On Duty Requests
            </h1>

          </div>
        </div>


        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {uniqueReasons.map((reason) => (
            <button
              key={reason}
              onClick={() => handleReasonSelect(reason)}
              className={`p-4 rounded-lg shadow-md text-center transition-all ${selectedReason === reason
                ? 'bg-[#00f5d0] text-black ring-2 ring-blue-300'
                : ' bg-white/5 hover:bg-white/5 text-gray-300'
                }`}
            >
              <div className="font-medium">{reason}</div>
              <div className="text-sm mt-1">
                ({reason === "All"
                  ? requests.length
                  : requests.filter(r => r.reason === reason).length} students)
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <select
              value={selectedYear}
              onChange={(e) => handleYearSelect(e.target.value)}
              className="px-36 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
            >
              {uniqueYears.map(year => (
                <option className='bg-black' key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedReason && (
          <div className="mb-4 max-h-[50vh] overflow-y-auto">
            <table className="min-w-full ">
              <thead className=" bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedRequests.length === getFilteredRequests.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Stayback</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Meeting</th>
                  {selectedReason === "All" && (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Reason</th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">From Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">To Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Requested By</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr
                    key={request.od_id}
                    className={selectedRequests.includes(request.od_id) ? "hover:bg-white/5" : ""}
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.od_id)}
                        onChange={() => toggleSelection(request.od_id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 relative w-48">
                      {request.name}
                      <div className="absolute top-0 right-0 flex space-x-1">
                        {request.roles?.isCoreLead && (
                          <div
                            className="w-4 h-4 rounded-full bg-red-500 ml-2 mt-[15px] flex items-center justify-center text-white text-[8px] font-bold"
                            title="Core Lead"
                          >
                            C
                          </div>
                        )}
                        {request.roles?.isTeamLead && (
                          <div
                            className="w-4 h-4 rounded-full bg-green-500 mt-[15px] flex items-center justify-center text-white text-[8px] font-bold"
                            title="Team Lead"
                          >
                            L
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{request.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{request.stayback_cnt || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{request.meeting_cnt || 0}</td>
                    {selectedReason === "All" && (
                      <td className="px-4 py-3 text-sm text-gray-300">{request.reason}</td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-300">{formatTime(request.from_time)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatTime(request.to_time)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{request.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{request.requested_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {(currentPage - 1) * recordsPerPage + 1} - {Math.min(currentPage * recordsPerPage, getFilteredRequests.length)} of {getFilteredRequests.length} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-black bg-[#00f5d0] hover:bg-[#00f5d0] hover:text-black rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-black bg-[#00f5d0] hover:bg-[#00f5d0] hover:text-black rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {renderBulkActionButtons()}

        {showBatchTimingForm && (
          <div className="mt-4 p-4 border rounded-md  bg-white/5">
            <h2 className="text-lg font-bold mb-4">Modify Batch Timings</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBulkAction('modify');
              }}
              className="space-y-4"
            >
              <div className="flex space-x-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">From Time</label>
                  <input
                    type="time"
                    value={batchTimings.from_time}
                    onChange={(e) => setBatchTimings(prev => ({ ...prev, from_time: e.target.value }))}
                    className="border px-4 py-2 rounded  bg-white/5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">To Time</label>
                  <input
                    type="time"
                    value={batchTimings.to_time}
                    onChange={(e) => setBatchTimings(prev => ({ ...prev, to_time: e.target.value }))}
                    className="border px-4 py-2  bg-white/5 rounded"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBatchTimingForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ODRequestApproval;