// "use client";

// import { useSession, signIn, signOut } from "next-auth/react";
// export default function HODPage() {
//   const { data: session } = useSession();

//   if (!session) {
//     return <p>Loading...</p>;
//   }
//   return (
//     <>
//       <h1>Welcome, {session.user.name}. You are logged in as HOD.</h1>
//       <p></p>
//       <button onClick={() => signOut()}>Sign out</button>
//     </>
//   );
// }
'use client'
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  CalendarDays, 
  User, 
  FileText,
  CheckSquare 
} from 'lucide-react';

const RequestStatusBadge = ({ status }) => {
  const badges = {
    0: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
    1: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Approved' },
    '-1': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' }
  };

  const badge = badges[status];
  const Icon = badge.icon;

  return (
    <span className={`px-3 py-1 text-sm rounded-full ${badge.bg} ${badge.text} flex items-center gap-1`}>
      <Icon className="w-4 h-4" />
      {badge.label}
    </span>
  );
};

const DashboardTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      fetchRequests(); // Refresh the table
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAttendanceUpdate = async (requestId, currentAttendance) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendance: !currentAttendance,
        }),
      });

      if (!response.ok) throw new Error('Failed to update attendance');
      fetchRequests(); // Refresh the table
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 text-center p-4">
      Error: {error}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="shadow-sm border rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.user.email}
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    From: {new Date(request.from_time).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-900">
                    To: {new Date(request.to_time).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RequestStatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.status === 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(request.id, -1)}
                        className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 1)}
                        className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                  {request.status === 1 && (
                    <button
                      onClick={() => handleAttendanceUpdate(request.id, request.attendance)}
                      className={`flex items-center px-3 py-1 rounded-md ${
                        request.attendance
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <CheckSquare className={`w-4 h-4 mr-2 ${
                        request.attendance ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      {request.attendance ? 'Attended' : 'Mark Attendance'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
};

export default DashboardTable;