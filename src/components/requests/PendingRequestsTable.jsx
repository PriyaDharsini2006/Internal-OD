'use client'
import React, { useState, useEffect } from 'react';
import { Clock, User, CalendarDays } from 'lucide-react';

export const PendingRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
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
      fetchPendingRequests();
    } catch (err) {
      console.error('Error updating status:', err);
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
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
                          From: {new Date(request.from_time).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-900">
                          To: {new Date(request.to_time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(request.id, -1)}
                        className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 1)}
                        className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};