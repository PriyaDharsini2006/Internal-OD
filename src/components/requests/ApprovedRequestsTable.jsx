'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, CalendarDays } from 'lucide-react';
import Loading from '.././Loading';

export const ApprovedRequestsTable = () => {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequests, setProcessingRequests] = useState({});

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TeamLead') {
      fetchApprovedRequests();
    } else {
      setLoading(false);
    }
  }, [status, session]);


   const fetchApprovedRequests = async () => {
    try {
      const response = await fetch('/api/attendance?status=1');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data);
      setLoading(false); // Set loading to false after successful fetch
    } catch (err) {
      setError(err.message);
      setLoading(false); // Set loading to false even if there's an error
    }
  };

  if (loading) {
    return <Loading />;
  }

  const renderAttendanceStatus = (request) => {
    const fromTime = new Date(request.from_time);
    const toTime = new Date(request.to_time);
    const noonCutoff = new Date(fromTime);
    noonCutoff.setHours(12, 0, 0, 0);

    const isForenoon = fromTime < noonCutoff;
    const isAfternoon = toTime > noonCutoff;

    return { isForenoon, isAfternoon };
  };

  const handleAttendanceUpdate = async (requestId, attendanceType) => {
    // Track processing state for this specific request
    setProcessingRequests(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [attendanceType]: true
      }
    }));

    try {
      const response = await fetch(`/api/attendance/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceType: attendanceType,
          toggle: true // Add this line to enable toggling
        }),
      });
      if (!response.ok) throw new Error('Failed to update attendance');
      
      // Refetch to get updated data
      await fetchApprovedRequests();
    } catch (err) {
      console.error('Error updating attendance:', err);
    } finally {
      // Clear processing state for this request
      setProcessingRequests(prev => {
        const updated = {...prev};
        delete updated[requestId]?.[attendanceType];
        return updated;
      });
    }
  };

  if (status === 'loading' || loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (status === 'authenticated' && session?.user?.role !== 'TeamLead') {
    return (
      <div className="text-red-600 text-center p-4">
        Access Denied: Only Team Leads can view this table
      </div>
    );
  }

  if (error) return (
    <div className="text-red-600 text-center p-4">
      Error: {error}
    </div>
  );

  return (
    <div className="bg-black text-white shadow-sm rounded-lg overflow-hidden">
      <div className='flex flex-row space-x-96'>
        <div className="flex-shrink-0">
          <img 
            className="w-36 h-36 rounded object-contain" 
            src="/logo1.png" 
            alt="Company Logo" 
          />
        </div>
        <div className="text-3xl py-10 print:hidden text-[#00f5d0]">
          ATTENDANCE
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Student Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Request Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Attendance
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-700">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No approved requests found
                </td>
              </tr>
            ) : (
              requests.map((request) => {
                const { isForenoon, isAfternoon } = renderAttendanceStatus(request);
                const attendanceDetail = request.attendance_detail || { forenoon: false, afternoon: false };
                const isProcessing = processingRequests[request.id];

                return (
                  <tr key={request.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {request.user.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {request.user.sec} Year {request.user.year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-medium">
                        {request.reason}
                      </div>
                      <div className="text-sm text-gray-400">
                        {request.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <CalendarDays className="w-5 h-5 text-gray-400 mr-3" />
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
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {isForenoon && (
                          <button
                            onClick={() => handleAttendanceUpdate(request.id, 'forenoon')}
                            className={`px-4 py-2 rounded-md relative ${
                              isProcessing?.forenoon 
                                ? 'bg-green-500/20 text-green-500 cursor-wait' 
                                : attendanceDetail.forenoon 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-gray-800 text-gray-300'
                            }`}
                            disabled={!!isProcessing?.forenoon}
                          >
                            {isProcessing?.forenoon && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              </span>
                            )}
                            Forenoon
                          </button>
                        )}
                        {isAfternoon && (
                          <button
                            onClick={() => handleAttendanceUpdate(request.id, 'afternoon')}
                            className={`px-4 py-2 rounded-md relative ${
                              isProcessing?.afternoon 
                                ? 'bg-green-500/20 text-green-500 cursor-wait' 
                                : attendanceDetail.afternoon 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-gray-800 text-gray-300'
                            }`}
                            disabled={!!isProcessing?.afternoon}
                          >
                            {isProcessing?.afternoon && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              </span>
                            )}
                            Afternoon
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovedRequestsTable;