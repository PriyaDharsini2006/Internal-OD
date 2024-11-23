// 'use client'
// import React, { useState, useEffect } from 'react';
// import { XCircle, User, CalendarDays, Printer, Menu, X,Copyright, RefreshCw } from 'lucide-react';

// export const RejectedRequestsTable = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Get current date
//   const currentDate = new Date().toLocaleDateString('en-GB', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
//   });

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

//   const handleUnreject = async (requestId) => {
//     try {
//       const response = await fetch(`/api/requests/${requestId}/unreject`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status: 0 })
//       });

//       if (!response.ok) throw new Error('Failed to unreject request');
      
//       // Remove the unrejected request from the list
//       setRequests(requests.filter(request => request.id !== requestId));
//     } catch (err) {
//       setError(err.message);
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

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
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
//     <div className="print-container max-w-full">
//       {/* Mobile Menu Toggle */}
//       <div className="lg:hidden p-4 flex justify-end print:hidden">
//         <button 
//           onClick={toggleMobileMenu} 
//           className="text-gray-600 hover:text-gray-900 focus:outline-none"
//         >
//           {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//         </button>
//       </div>

//       {/* Browser View */}
//       <div className="browser-view">
//         {/* Print Button - Visible only in browser */}
//         <div className="p-4 flex justify-end print:hidden">
//         <div className='flex flex-row '>
//         <div className="flex-shrink-0  ">
//               <img 
//                 className="w-36 h-36 rounded object-contain" 
//                 src="/logo.png" 
//                 alt="Company Logo" 
//               />
//             </div>
//           <div className="px-96 py-10 justify-end print:hidden">
          
//             <button 
//               onClick={handlePrint} 
//               className="flex items-center justify-end bg-blue-500 text-white px-6 py-4 rounded hover:bg-blue-600 transition"
//             >
//               <Printer className="mr-2 w-5 h-5" />
//               Print
//             </button>
//           </div>
//           </div>
//           {/* <button 
//             onClick={handlePrint} 
//             className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mr-2"
//           >
//             <Printer className="mr-2 w-5 h-5" /> Print
//           </button> */}
//         </div>

//         {/* Desktop Table */}
//         <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Student Details
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Request Details
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Duration
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {requests.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                       No rejected requests found
//                     </td>
//                   </tr>
//                 ) : (
//                   requests.map((request) => (
//                     <tr key={request.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0">
//                             <User className="h-8 w-8 text-gray-400" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">
//                               {request.user.name}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               {request.studentId}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="text-sm text-gray-900">
//                           {request.requestType}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {request.description}
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
//                           <div>
//                             <div className="text-sm text-gray-900">
//                               From: {formatTime(request.from_time)}
//                             </div>
//                             <div className="text-sm text-gray-900">
//                               To: {formatTime(request.to_time)}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <XCircle className="h-4 w-4 text-red-500 mr-2" />
//                           <span className="text-sm text-red-500 font-medium">
//                             Rejected
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <button 
//                           onClick={() => handleUnreject(request.id)}
//                           className="flex items-center bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
//                         >
//                           <RefreshCw className="mr-2 w-4 h-4" /> Unreject
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Mobile View */}
//         <div className="lg:hidden px-4">
//           {requests.length === 0 ? (
//             <div className="text-center text-gray-500 py-4">
//               No rejected requests found
//             </div>
//           ) : (
//             requests.map((request) => (
//               <div 
//                 key={request.id} 
//                 className="bg-white shadow-sm rounded-lg mb-4 p-4 border border-gray-200"
//               >
//                 <div className="flex justify-between items-center mb-2">
//                   <div className="flex items-center">
//                     <User className="h-6 w-6 text-gray-400 mr-2" />
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">
//                         {request.user.name}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {request.studentId}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-red-500">
//                     <XCircle className="h-4 w-4 mr-1" />
//                     <span className="text-sm font-medium">Rejected</span>
//                   </div>
//                 </div>
//                 <div className="border-t pt-2 mt-2">
//                   <div className="text-sm text-gray-900 mb-1">
//                     <strong>Request:</strong> {request.requestType}
//                   </div>
//                   <div className="text-sm text-gray-500 mb-1">
//                     {request.description}
//                   </div>
//                   <div className="flex items-center text-sm text-gray-700">
//                     <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
//                     <div>
//                       From: {formatTime(request.from_time)} | 
//                       To: {formatTime(request.to_time)}
//                     </div>
//                   </div>
//                   <div className="mt-2">
//                     <button 
//                       onClick={() => handleUnreject(request.id)}
//                       className="w-full flex justify-center items-center bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
//                     >
//                       <RefreshCw className="mr-2 w-4 h-4" /> Unreject
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//             {/* Print View - Full Document */}
//             <div className="print-view hidden print:block">
//         {/* [Previous print view code remains the same] */}
//         {/* ... (keep the existing print view content) ... */}
//       </div>

//       {/* Print-specific styles */}
//       <style jsx global>{`
//         @media print {
//           nav {
//             display: none !important;
//           }
// footer{
//             display:none !important;}

//           .print-container {
//             margin-top: 0 !important;
//           }

//           body {
//             margin: 0;
//             padding: 0;
//           }

//           .print-page {
//             page-break-after: always;
//             margin: 0;
//             padding: 2rem;
//           }

//           .print-page:last-child {
//             page-break-after: avoid;
//           }

//           .print:hidden {
//             display: none !important;
//           }

//           .browser-view {
//             display: none !important;
//           }

//           .print-view {
//             display: block !important;
//           }
//         }

//         @media screen {
//           .print-view {
//             display: none !important;
//           }
//         }

//         /* Responsive adjustments */
//         @media (max-width: 640px) {
//           .px-6 {
//             padding-left: 1rem;
//             padding-right: 1rem;
//           }
//         }
//       `}</style>
      
//     </div>
//   );
// };

// export default RejectedRequestsTable;
'use client'
import React, { useState, useEffect } from 'react';
import { XCircle, User, CalendarDays, Printer, Menu, X, RefreshCw } from 'lucide-react';

const RejectedRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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

  const handleUnreject = async (requestId) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/unreject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 0 })
      });

      if (!response.ok) throw new Error('Failed to unreject request');
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600 text-center">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between">
            <img 
              src="/logo.png"
              alt="Company Logo"
              className="w-24 h-24 object-contain"
            />
            <button 
              onClick={toggleMobileMenu}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="mt-4 space-y-2 bg-white p-4 rounded-lg shadow-lg">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Printer size={20} />
                Print Document
              </button>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-8">
          <img 
            src="/logo.png"
            alt="Company Logo"
            className="w-32 h-32 object-contain"
          />
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors print:hidden"
          >
            <Printer size={20} />
            Print 
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No rejected requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900">{request.user.name}</div>
                            <div className="text-sm text-gray-500">{request.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{request.requestType}</div>
                          <div className="text-gray-500">{request.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="text-gray-900">From: {formatTime(request.from_time)}</div>
                            <div className="text-gray-900">To: {formatTime(request.to_time)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium text-red-500">Rejected</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button 
                          onClick={() => handleUnreject(request.id)}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Unreject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            {requests.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No rejected requests found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">{request.user.name}</div>
                          <div className="text-sm text-gray-500">{request.studentId}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-500">Rejected</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.requestType}</div>
                        <div className="text-sm text-gray-500">{request.description}</div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <div>
                          <div>From: {formatTime(request.from_time)}</div>
                          <div>To: {formatTime(request.to_time)}</div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleUnreject(request.id)}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Unreject Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Print View */}
        <div className="hidden print:block">
          <div className="mb-8 page-break-after-always">
            <div className="flex justify-between items-center mb-8">
              <img 
                src="/citlogo.png"
                alt="Chennai Institute of Technology Logo"
                className="w-24 h-auto"
              />
              <img 
                src="/logo.png"
                alt="Hackerz Logo"
                className="w-24 h-auto"
              />
            </div>

            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-center mb-6">Rejected Requests Report</h1>
              
              <div className="text-right mb-4">
                <div className="font-medium">Date: {currentDate}</div>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Student Details</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Request Details</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="font-medium">{request.user.name}</div>
                        <div className="text-sm">{request.studentId}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="font-medium">{request.requestType}</div>
                        <div className="text-sm">{request.description}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>From: {formatTime(request.from_time)}</div>
                        <div>To: {formatTime(request.to_time)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
          }

          nav, footer, .print\:hidden {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .page-break-after-always {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default RejectedRequestsTable;