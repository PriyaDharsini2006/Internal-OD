// import React, { useState, useEffect } from 'react';
// import { XCircle, User, CalendarDays } from 'lucide-react';

// export const RejectedRequestsTable = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchRejectedRequests();
//   }, []);

//   const fetchRejectedRequests = async () => {
//     try {
//       const response = await fetch('/api/requests?status=-1');
//       if (!response.ok) throw new Error('Failed to fetch requests');
//       const data = await response.json();
//       setRequests(data.data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return (
//     <div className="flex justify-center items-center min-h-[400px]">
//       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//     </div>
//   );

//   if (error) return (
//     <div className="text-red-600 text-center p-4">
//       Error: {error}
//     </div>
//   );

//   return (
//     <div className="bg-white shadow-sm rounded-lg overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Student Details
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Request Details
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Duration
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
            
//           </tbody>
'use client'
import React, { useState, useEffect } from 'react';
import { XCircle, User, CalendarDays } from 'lucide-react';

export const RejectedRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.studentName}
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
                    <span className="text-sm text-gray-500">
                      {request.startDate} - {request.endDate}
                    </span>
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
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rejected requests found
          </div>
        )}
      </div>
    </div>
  );
};

export default RejectedRequestsTable;