import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const MeetingLog = ({ meetings, setMeetings, fetchMeetings }) => {
  const { status } = useSession();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
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

  const deleteMeeting = async () => {
    if (!meetingToDelete) return;

    try {
      const response = await fetch(`/api/meetings/${meetingToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Remove the deleted meeting from the meetings list
        setMeetings(prevMeetings =>
          prevMeetings.filter(meeting => meeting.id !== meetingToDelete.id)
        );

        // Close the delete confirmation 
        setIsDeleteConfirmOpen(false);
        setMeetingToDelete(null);

        // Refresh meetings data
        await fetchMeetings();
      } else {
        console.error('Failed to delete meeting');
      }
    } catch (error) {
      console.error('Failed to delete meeting', error);
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


  const confirmDeleteMeeting = (meeting, e) => {
    // Stop event propagation to prevent opening meeting details
    e.stopPropagation();
    setMeetingToDelete(meeting);
    setIsDeleteConfirmOpen(true);
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
      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className={`p-4 rounded-md shadow-md relative transition ${new Date() > new Date(meeting.to_time)
              ? "bg-[#00f5d0] text-black hover:bg-green-200"
              : "bg-red-500 text-black hover:bg-red-200"
              }`}
          >
            {/* Delete Button */}
            <button
              onClick={(e) => confirmDeleteMeeting(meeting, e)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full z-10"
              title="Delete Meeting"
            >
              <Trash2 size={16} />
            </button>

            {/* Meeting Card Content */}
            <div
              className="cursor-pointer"
              onClick={() => openMeetingDetails(meeting)}
            >
              <h3 className="font-semibold text-lg">{meeting.title}</h3>
              <p>Team: {meeting.team}</p>
              <p>Date: {new Date(meeting.date).toLocaleDateString()}</p>
              <p>
                Time: {new Date(meeting.from_time).toLocaleTimeString()} -{" "}
                {new Date(meeting.to_time).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-black p-8 rounded-lg w-96 text-center relative shadow-2xl border border-red-500">
            {/* Close Icon */}
            <button
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setMeetingToDelete(null);
              }}
              className="absolute top-2 right-2 text-white hover:text-red-500 transition"
              title="Cancel"
            >
              ✕
            </button>

            <Trash2 className="mx-auto mb-4 text-red-500" size={64} />
            <h2 className="text-2xl font-bold mb-4 text-white">
              Delete Meeting
            </h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete the meeting?
              This action cannot be undone.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setMeetingToDelete(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteMeeting}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg w-11/12 max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedMeeting.title} Details
              </h2>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-auto space-y-6 bg-black">
              {/* Available Students Section */}
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Available Students</h3>
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f5d0]"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border bg-black rounded-md"
                  />
                </div>

                {/* Students Table */}
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-black sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-200">
                      {currentStudents.map((student) => (
                        <tr
                          key={student.email}
                          className="hover:bg-gray-900 cursor-pointer"
                          onClick={() => addStudentToMeeting(student.email)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="bg-[#00f5d0] hover:bg-green-600 text-black px-3 py-1 rounded text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addStudentToMeeting(student.email);
                              }}
                            >
                              Add
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {student.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {student.sec || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {student.year || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredAvailableStudents.length)} of{" "}
                    {filteredAvailableStudents.length} students
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 border rounded-md hover:bg-black-100 disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="p-2 border rounded-md hover:bg-black-100 disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
                    <thead className="bg-black sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-200">
                      {students.map((email) => {
                        const student = allStudents.find((s) => s.email === email);
                        return (
                          <tr key={email} className="hover:bg-black-400">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => removeStudentFromMeeting(email)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Remove
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {student?.name || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {student?.sec || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {student?.year || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMeeting(null)}
              className="mt-6 w-full bg-[#00f5d0] text-black py-2 rounded-md transition duration-200"
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