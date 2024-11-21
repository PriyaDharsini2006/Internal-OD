// // 'use client'
// // import React, { useState, useEffect } from 'react';
// // import { Clock, User, CalendarDays } from 'lucide-react';

// // export const PendingRequestsTable = () => {
// //   const [requests, setRequests] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     fetchPendingRequests();
// //   }, []);

// //   const fetchPendingRequests = async () => {
// //     try {
// //       const response = await fetch('/api/requests?status=0');
// //       if (!response.ok) throw new Error('Failed to fetch requests');
// //       const data = await response.json();
// //       setRequests(data.data);
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleStatusUpdate = async (requestId, newStatus) => {
// //     try {
// //       const response = await fetch('/api/requests', {
// //         method: 'PATCH',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           id: requestId,
// //           status: newStatus,
// //         }),
// //       });

// //       if (!response.ok) throw new Error('Failed to update status');
// //       fetchPendingRequests();
// //     } catch (err) {
// //       console.error('Error updating status:', err);
// //     }
// //   };
// //   const formatTime = (dateTime) => {
// //     return new Date(dateTime).toLocaleTimeString([], { 
// //       hour: '2-digit', 
// //       minute: '2-digit' 
// //     });
// //   };  

// //   if (loading) return (
// //     <div className="flex justify-center items-center min-h-[400px]">
// //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
// //     </div>
// //   );

// //   if (error) return (
// //     <div className="text-red-600 text-center p-4">
// //       Error: {error}
// //     </div>
// //   );

// //   return (
// //     <div className="bg-white shadow-sm rounded-lg overflow-hidden">
// //       <div className="overflow-x-auto">
// //         <table className="min-w-full divide-y divide-gray-200">
// //           <thead className="bg-gray-50">
// //             <tr>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Student Details
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Request Details
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Duration
// //               </th>
// //             </tr>
// //           </thead>
// //           <tbody className="bg-white divide-y divide-gray-200">
// //             {requests.length === 0 ? (
// //               <tr>
// //                 <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
// //                   No pending requests found
// //                 </td>
// //               </tr>
// //             ) : (
// //               requests.map((request) => (
// //                 <tr key={request.id}>
// //                   <td className="px-6 py-4">
// //                     <div className="flex items-center">
// //                       <User className="w-5 h-5 text-gray-400 mr-3" />
// //                       <div>
// //                         <div className="text-sm font-medium text-gray-900">
// //                           {request.user.name}
// //                         </div>
// //                         <div className="text-sm text-gray-500">
// //                           {request.user.sec} Year {request.user.year}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </td>
// //                   <td className="px-6 py-4">
// //                     <div className="text-sm text-gray-900 font-medium">
// //                       {request.reason}
// //                     </div>
// //                     <div className="text-sm text-gray-500">
// //                       {request.description}
// //                     </div>
// //                   </td>
// //                   <td className="px-6 py-4">
// //                     <div className="flex items-center">
// //                       <CalendarDays className="w-5 h-5 text-gray-400 mr-3" />
// //                       <div>
// //                       <div className="text-sm text-gray-900">
// //                           From: {formatTime(request.from_time)}
// //                         </div>
// //                         <div className="text-sm text-gray-900">
// //                           To: {formatTime(request.to_time)}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </td>
                  
// //                 </tr>
// //               ))
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };
// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, User, CalendarDays, Printer } from 'lucide-react';

// export const PendingRequestsTable = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const printRef = useRef(null);

//   useEffect(() => {
//     fetchPendingRequests();
//   }, []);

//   const fetchPendingRequests = async () => {
//     try {
//       const response = await fetch('/api/requests?status=0');
//       if (!response.ok) throw new Error('Failed to fetch requests');
//       const data = await response.json();
//       setRequests(data.data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusUpdate = async (requestId, newStatus) => {
//     try {
//       const response = await fetch('/api/requests', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: requestId,
//           status: newStatus,
//         }),
//       });

//       if (!response.ok) throw new Error('Failed to update status');
//       fetchPendingRequests();
//     } catch (err) {
//       console.error('Error updating status:', err);
//     }
//   };

//   const formatTime = (dateTime) => {
//     return new Date(dateTime).toLocaleTimeString([], { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     });
//   };

//   const handlePrint = () => {
//     window.print();
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
//       <div className="p-4 print:hidden">
//         <button 
//           onClick={handlePrint} 
//           className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           <Printer className="mr-2 w-5 h-5" /> Print Requests
//         </button>
//       </div>
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
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {requests.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
//                   No pending requests found
//                 </td>
//               </tr>
//             ) : (
//               requests.map((request) => (
//                 <tr key={request.id}>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center">
//                       <User className="w-5 h-5 text-gray-400 mr-3" />
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {request.user.name}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {request.user.sec} Year {request.user.year}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900 font-medium">
//                       {request.reason}
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       {request.description}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center">
//                       <CalendarDays className="w-5 h-5 text-gray-400 mr-3" />
//                       <div>
//                         <div className="text-sm text-gray-900">
//                           From: {formatTime(request.from_time)}
//                         </div>
//                         <div className="text-sm text-gray-900">
//                           To: {formatTime(request.to_time)}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // Add these styles to your global CSS or a separate print stylesheet
// const printStyles = `
// @media print {
//   body * {
//     visibility: hidden;
//   }
//   .print-container, 
//   .print-container * {
//     visibility: visible;
//   }
//   .print-container {
//     position: absolute;
//     left: 0;
//     top: 0;
//     width: 100%;
//   }
//   .print:hidden {
//     display: none !important;
//   }
// }
// `;
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Clock, User, CalendarDays, Printer } from 'lucide-react';

export const HackerzPrintView = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    fetchPendingRequests();
    setCurrentDate(new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }));
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=0');
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
    <div className="print-view">
      {/* First Page: Permission Letter */}
      <div className="first-page print-page">
        <div className="header flex justify-between items-center mb-8">
          <img
            id="citLogo"
            src="/citlogo.png"
            alt="Chennai Institute of Technology Logo"
            className="w-24 h-auto"
          />
          <img
            id="hackerzLogo"
            src="/logo.png"
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
            src="/sign.png"
            alt="Signature"
          />
          <div>
            <p className="m-0">Head of Department</p>
            <p className="m-0">Computer Science and Engineering</p>
          </div>
        </div>
      </div>

      {/* Second Page: Pending Requests Table */}
      <div className="second-page print-page mt-8">
        <h2 className="text-xl font-bold mb-4 text-center">Pending Requests for Hackerz'24</h2>
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
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No pending requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
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
        </div>
      </div>
    </div>
  );
};

// Print Styles
const printStyles = `
@media print {
  body * {
    visibility: hidden;
  }
  .print-page, 
  .print-page * {
    visibility: visible;
  }
  .print-page {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    page-break-after: always;
  }
}
`;

export default HackerzPrintView;