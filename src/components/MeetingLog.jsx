import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const MeetingLog = ({ meetings, setMeetings, fetchMeetings }) => {
  const { status } = useSession();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        const data = await response.json();
        setAllStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch students', error);
        setAllStudents([]);
      }
    };

    if (status === 'authenticated') {
      fetchStudents();
    }
  }, [status]);

  const openMeetingDetails = async (meeting) => {
    try {
      setSelectedMeeting(meeting);
      setStudents(meeting.students || []);
      setCurrentPage(1);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to fetch meeting students', error);
    }
  };

  const addStudentToMeeting = async (email) => {
    if (!selectedMeeting) return;

    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, meetingId: selectedMeeting.id })
      });
      
      if (response.ok) {
        const updatedStudents = [...students, email];
        setStudents(updatedStudents);
        setMeetings(prevMeetings => 
          prevMeetings.map(meeting => 
            meeting.id === selectedMeeting.id 
              ? { ...meeting, students: updatedStudents } 
              : meeting
          )
        );
        // Refresh meetings data after successful addition
        await fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to add student', error);
    }
  };

  const removeStudentFromMeeting = async (email) => {
    if (!selectedMeeting) return;

    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}/students`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, meetingId: selectedMeeting.id })
      });
      
      if (response.ok) {
        const updatedStudents = students.filter(e => e !== email);
        setStudents(updatedStudents);
        setMeetings(prevMeetings => 
          prevMeetings.map(meeting => 
            meeting.id === selectedMeeting.id 
              ? { ...meeting, students: updatedStudents } 
              : meeting
          )
        );
        // Refresh meetings data after successful removal
        await fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to remove student', error);
    }
  };

  const filteredAvailableStudents = (allStudents || [])
    .filter(student => 
      student && 
      student.email && 
      !students.includes(student.email) && 
      (
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  // Pagination calculations
  const totalPages = Math.ceil(filteredAvailableStudents.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentStudents = filteredAvailableStudents.slice(startIndex, endIndex);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {meetings.map(meeting => (
          <div 
            key={meeting.id} 
            className={`p-4 rounded-md shadow-md cursor-pointer ${
              new Date() > new Date(meeting.to_time) 
                ? 'bg-green-100 hover:bg-green-200' 
                : 'bg-red-100 hover:bg-red-200'
            }`}
            onClick={() => openMeetingDetails(meeting)}
          >
            <h3 className="font-semibold text-lg">{meeting.title}</h3>
            <p>Team: {meeting.team}</p>
            <p>Date: {new Date(meeting.date).toLocaleDateString()}</p>
            <p>Time: {new Date(meeting.from_time).toLocaleTimeString()} - {new Date(meeting.to_time).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>

      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-7xl max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-6">{selectedMeeting.title} Details</h2>
            
            <div className="flex-grow overflow-auto space-y-6">
              {/* Available Students Section */}
              <div className="border rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-4">Available Students</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentStudents.map(student => (
                        <tr 
                          key={student.email}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => addStudentToMeeting(student.email)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addStudentToMeeting(student.email);
                              }}
                            >
                              Add
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.sec || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.year || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAvailableStudents.length)} of {filteredAvailableStudents.length} students
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Students Section */}
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Meeting Students (Total: {students.length})
                </h3>
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map(email => {
                        const student = allStudents.find(s => s.email === email);
                        return (
                          <tr key={email} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => removeStudentFromMeeting(email)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Remove
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student?.name || '-'}</div>
                              <div className="text-sm text-gray-500">{email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student?.sec || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student?.year || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedMeeting(null)}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingLog;