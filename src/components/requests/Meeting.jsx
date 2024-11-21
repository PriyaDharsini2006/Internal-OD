'use client'
import React, { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';

const MeetingUsers = () => {
  const [meetingUsers, setMeetingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMeetingUsers();
  }, []);

  const fetchMeetingUsers = async () => {
    try {
      const response = await fetch('/api/meeting-users');
      if (!response.ok) throw new Error('Failed to fetch meeting users');
      const data = await response.json();
      setMeetingUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
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
      <div className="p-4 bg-gray-50 border-b flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          Meeting Users Count
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meeting Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meetingUsers.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No meeting users found
                </td>
              </tr>
            ) : (
              meetingUsers.map((user) => (
                <tr key={user.email}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.meeting_cnt > 5 
                      ? 'bg-red-100 text-red-800'
                      : user.meeting_cnt > 2 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                      {user.meeting_cnt}
                    </span>
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

export default MeetingUsers;