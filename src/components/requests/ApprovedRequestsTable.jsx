'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle, User, CalendarDays, CheckSquare } from 'lucide-react';

export const ApprovedRequestsTable = () => {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const response = await fetch(`/api/attendance/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceType: attendanceType,
        }),
      });

      if (!response.ok) throw new Error('Failed to update attendance');
      fetchApprovedRequests();
    } catch (err) {
      console.error('Error updating attendance:', err);
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
                            className={`px-4 py-2 rounded-md ${
                              attendanceDetail.forenoon 
                                ? 'bg-[#00f5d0]/20 text-[#00f5d0]' 
                                : 'bg-gray-800 text-gray-300'
                            }`}
                            disabled={!isForenoon}
                          >
                            Forenoon
                          </button>
                        )}
                        {isAfternoon && (
                          <button
                            onClick={() => handleAttendanceUpdate(request.id, 'afternoon')}
                            className={`px-4 py-2 rounded-md ${
                              attendanceDetail.afternoon 
                                ? 'bg-[#00f5d0]/20 text-[#00f5d0]' 
                                : 'bg-gray-800 text-gray-300'
                            }`}
                            disabled={!isAfternoon}
                          >
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
// 'use client'
// import React, { useState, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { User, CalendarDays } from 'lucide-react';

// export const ApprovedRequestsTable = () => {
//   const { data: session, status } = useSession();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [optimisticUpdates, setOptimisticUpdates] = useState({});

//   useEffect(() => {
//     if (status === 'authenticated' && session?.user?.role === 'TeamLead') {
//       fetchApprovedRequests();
//     } else {
//       setLoading(false);
//     }
//   }, [status, session]);

//   const fetchApprovedRequests = async () => {
//     try {
//       const response = await fetch('/api/attendance?status=1');
//       if (!response.ok) throw new Error('Failed to fetch requests');
//       const data = await response.json();
//       setRequests(data.data);
//       // Reset optimistic updates when fresh data is fetched
//       setOptimisticUpdates({});
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderAttendanceStatus = (request) => {
//     const fromTime = new Date(request.from_time);
//     const toTime = new Date(request.to_time);
//     const noonCutoff = new Date(fromTime);
//     noonCutoff.setHours(12, 0, 0, 0);

//     const isForenoon = fromTime < noonCutoff;
//     const isAfternoon = toTime > noonCutoff;

//     return { isForenoon, isAfternoon };
//   };

//   const handleAttendanceUpdate = useCallback(async (requestId, attendanceType) => {
//     // Immediate optimistic UI update
//     setOptimisticUpdates(prev => ({
//       ...prev,
//       [requestId]: {
//         ...prev[requestId],
//         [attendanceType]: !(prev[requestId]?.[attendanceType] || false)
//       }
//     }));

//     try {
//       const response = await fetch(`/api/attendance/${requestId}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           attendanceType: attendanceType,
//         }),
//       });

//       if (!response.ok) {
//         // Revert optimistic update if server request fails
//         setOptimisticUpdates(prev => {
//           const updatedState = {...prev};
//           if (updatedState[requestId]) {
//             delete updatedState[requestId][attendanceType];
//           }
//           return updatedState;
//         });
//         throw new Error('Failed to update attendance');
//       }

//       // Optional: Refetch to ensure final state matches server
//       fetchApprovedRequests();
//     } catch (err) {
//       console.error('Error updating attendance:', err);
//     }
//   }, []);

//   const formatTime = (dateTime) => {
//     return new Date(dateTime).toLocaleTimeString([], { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     });
//   };

//   if (status === 'loading' || loading) return (
//     <div className="flex justify-center items-center min-h-[400px]">
//       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//     </div>
//   );

//   if (status === 'authenticated' && session?.user?.role !== 'TeamLead') {
//     return (
//       <div className="text-red-600 text-center p-4">
//         Access Denied: Only Team Leads can view this table
//       </div>
//     );
//   }

//   if (error) return (
//     <div className="text-red-600 text-center p-4">
//       Error: {error}
//     </div>
//   );

//   return (
//     <div className="bg-black text-white shadow-sm rounded-lg overflow-hidden">
//       <div className='flex flex-row space-x-96'>
//         <div className="flex-shrink-0">
//           <img 
//             className="w-36 h-36 rounded object-contain" 
//             src="/logo1.png" 
//             alt="Company Logo" 
//           />
//         </div>
//         <div className="text-3xl py-10 print:hidden text-[#00f5d0]">
//           ATTENDANCE
//         </div>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-700">
//           <thead className="bg-gray-900">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Student Details
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Request Details
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Duration
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
//                 Attendance
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-black divide-y divide-gray-700">
//             {requests.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
//                   No approved requests found
//                 </td>
//               </tr>
//             ) : (
//               requests.map((request) => {
//                 const { isForenoon, isAfternoon } = renderAttendanceStatus(request);
//                 const attendanceDetail = request.attendance_detail || { forenoon: false, afternoon: false };
                
//                 // Merge server state with optimistic updates
//                 const forenoonStatus = optimisticUpdates[request.id]?.forenoon ?? attendanceDetail.forenoon;
//                 const afternoonStatus = optimisticUpdates[request.id]?.afternoon ?? attendanceDetail.afternoon;

//                 return (
//                   <tr key={request.id}>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center">
//                         <User className="w-5 h-5 text-gray-400 mr-3" />
//                         <div>
//                           <div className="text-sm font-medium text-white">
//                             {request.user.name}
//                           </div>
//                           <div className="text-sm text-gray-400">
//                             {request.user.sec} Year {request.user.year}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-white font-medium">
//                         {request.reason}
//                       </div>
//                       <div className="text-sm text-gray-400">
//                         {request.description}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center">
//                         <CalendarDays className="w-5 h-5 text-gray-400 mr-3" />
//                         <div>
//                           <div className="text-sm text-white">
//                             From: {formatTime(request.from_time)}
//                           </div>
//                           <div className="text-sm text-white">
//                             To: {formatTime(request.to_time)}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex space-x-2">
//                         {isForenoon && (
//                           <button
//                             onClick={() => handleAttendanceUpdate(request.id, 'forenoon')}
//                             className={`px-4 py-2 rounded-md ${
//                               forenoonStatus 
//                                 ? 'bg-[#00f5d0]/20 text-[#00f5d0]' 
//                                 : 'bg-gray-800 text-gray-300'
//                             }`}
//                             disabled={!isForenoon}
//                           >
//                             Forenoon
//                           </button>
//                         )}
//                         {isAfternoon && (
//                           <button
//                             onClick={() => handleAttendanceUpdate(request.id, 'afternoon')}
//                             className={`px-4 py-2 rounded-md ${
//                               afternoonStatus 
//                                 ? 'bg-[#00f5d0]/20 text-[#00f5d0]' 
//                                 : 'bg-gray-800 text-gray-300'
//                             }`}
//                             disabled={!isAfternoon}
//                           >
//                             Afternoon
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ApprovedRequestsTable;