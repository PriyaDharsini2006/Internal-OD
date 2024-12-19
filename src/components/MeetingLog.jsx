import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronLeft, ChevronRight, Trash2, Printer, Edit2 } from 'lucide-react';

const MeetingLog = ({ meetings, setMeetings, fetchMeetings }) => {
  const { status } = useSession();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [registerSearchTerm, setRegisterSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const recordsPerPage = 15;
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState(new Set());
  const [selectedCurrentStudents, setSelectedCurrentStudents] = useState(new Set());
  const [isEditingMeetingTitle, setIsEditingMeetingTitle] = useState(false);
  const [editedMeetingTitle, setEditedMeetingTitle] = useState('');
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editedValues, setEditedValues] = useState({
    title: '',
    date: '',
    from_time: '',
    to_time: '',
    team: ''
  });

  const startEditingMeetingTitle = () => {
    setEditedMeetingTitle(selectedMeeting.title);
    setIsEditingMeetingTitle(true);
  };

  const startEditing = (meeting, e) => {
    e.stopPropagation();
    setEditingMeeting(meeting);
    setEditedValues({
      title: meeting.title,
      date: formatDateForInput(meeting.date),
      from_time: formatDateTimeForInput(meeting.from_time),
      to_time: formatDateTimeForInput(meeting.to_time),
      team: meeting.team
    });
  };

  const saveEdits = async (e) => {
    e.stopPropagation();
    if (!editingMeeting) return;

    try {
      // Ensure proper date formatting
      const formattedData = {
        ...editedValues,
        date: new Date(editedValues.date).toISOString(),
        from_time: new Date(editedValues.from_time).toISOString(),
        to_time: new Date(editedValues.to_time).toISOString(),
      };

      const response = await fetch(`/api/meetings/${editingMeeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      if (response.ok) {
        const updatedMeeting = await response.json();
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting.id === editingMeeting.id
              ? { ...meeting, ...updatedMeeting }
              : meeting
          )
        );
        setEditingMeeting(null);
      } else {
        console.error('Failed to update meeting');
      }
    } catch (error) {
      console.error('Failed to update meeting', error);
    }
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateTimeForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, -8);
  };




  const toggleAvailableStudentSelection = (email) => {
    setSelectedAvailableStudents(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(email)) {
        newSelected.delete(email);
      } else {
        newSelected.add(email);
      }
      return newSelected;
    });
  };

  const toggleCurrentStudentSelection = (email) => {
    setSelectedCurrentStudents(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(email)) {
        newSelected.delete(email);
      } else {
        newSelected.add(email);
      }
      return newSelected;
    });
  };


  // Select all current students
  const selectAllCurrentStudents = () => {
    setSelectedCurrentStudents(new Set(students));
  };


  const printStudents = () => {
    const printWindow = window.open('', '_blank');
    const meetingStudentDetails = students.map(email =>
      allStudents.find(student => student.email === email) || { email }
    );

    const studentDetails = students.map(email => {
      const student = allStudents.find(s => s.email === email);
      return student;
    }).filter(student => student);



    // Base64 encoded logo (replace this with your actual logo's base64 string)
    const printContent = `
      
<!DOCTYPE html>
<html>
<head>
  <style>
    @media print {
    html, body { 
    margin: 0 !important; 
    padding: 0 !important; 
    height: 100% !important;
    
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
      body { 
       
       
         margin: 0 !important; 
    padding: 0 !important; 
   
      }
      .certificate-page {
        page-break-after: always;
        min-height: 95vh;
        display: flex;
        flex-direction: column;
        padding: 20px;
       
      }
    }
    body { 
      font-family: Arial, sans-serif; 
      margin: 20px; 
      padding: 0; 
      position: relative;
       min-height: 100vh;
      
    }
    .page {
      position: relative;
      padding: 120px 20px 20px;
       border-bottom: 2px solid black !important;
    }
    .logo-left, .logo-right {
                  position: absolute;
                  top: 10px;
                  height: auto;
                  padding: 10px;
                }
                .logo-left {
                  top: 40px;
                  height: 60px;
                  width: 240px;
                }
                .logo-right {
                  right: 20px;
                  height: 120px;
                  width: 120px;
                }
    .certificate-content {
      text-align: center;
      margin-top: 50px;
      padding: 0 50px;
    }
    table { 
      
      
      margin-top: 20px; 
      border: 2px solid black;
       width: 100%; 
    border-collapse: separate !important;
    border-spacing: 0 !important;
    }
    th, td { 
      border: 1px solid #333; 
      padding: 8px; 
      text-align: left; 
    }
    th { 
      background-color: #f2f2f2; 
      position: sticky;
      top: 0;
      background: white;
      border-bottom: 2px solid black;
    }
       * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
    @media print {
      th {
        position: static;
      }
      body {
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <img 
      src="${cit}" 
      alt="Company Image 1" 
      class="logo-left"
    />
    <img 
      src="${logoBase64}" 
      alt="Company Logo" 
      class="logo-right"
    />
    
    <div class="certificate-content">
      <p>Thank you for attending today's meeting and showing your enthusiasm for </p>
      <h2>HACKERZ 2025!</h2>
      <p>Remember, this is more than just an event it's your chance to learn, grow, and shine. Only those who attend regularly, stay active, and contribute interactively will earn exclusive privileges like OD and exciting outreach opportunities. Don't miss the chance to be part of something truly impactful your journey to greatness starts here!</p>
    </div>
  </div>

  <br>

  <h2>Meeting Details</h2>
  <p><strong>Meeting:</strong> ${selectedMeeting.title}</p>
  <p><strong>Date:</strong> ${new Date(selectedMeeting.date).toLocaleDateString()}</p>
  <p><strong>Time:</strong> ${new Date(selectedMeeting.from_time).toLocaleTimeString()} - ${new Date(selectedMeeting.to_time).toLocaleTimeString()}</p>
  <p><strong>Total Attendees:</strong> ${meetingStudentDetails.length}</p>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Section</th>
        <th>Year</th>
      </tr>
    </thead>
    <tbody>
      ${meetingStudentDetails.map(student => `
        <tr>
          <td>${student.name || 'N/A'}</td>
          <td>${student.email}</td>
          <td>${student.sec || 'N/A'}</td>
          <td>${student.year || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 100);
  };

  const addMultipleStudentsToMeeting = async () => {
    if (!selectedMeeting) return;

    try {
      const studentsToAdd = Array.from(selectedAvailableStudents);

      const response = await fetch(`/api/meetings/${selectedMeeting.id}/students`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          students: [...students, ...studentsToAdd]
        })
      });

      if (response.ok) {
        setStudents(prev => [...new Set([...prev, ...studentsToAdd])]);
        setSelectedAvailableStudents(new Set());
        await fetchMeetings(); // Assuming you have this method to refresh meetings
      }
    } catch (error) {
      console.error('Failed to add students', error);
    }
  };

  const removeMultipleStudentsFromMeeting = async () => {
    if (!selectedMeeting) return;

    try {
      const studentsToRemove = Array.from(selectedCurrentStudents);

      const response = await fetch(`/api/meetings/${selectedMeeting.id}/students`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          students: students.filter(email => !studentsToRemove.includes(email))
        })
      });

      if (response.ok) {
        setStudents(prev => prev.filter(email => !studentsToRemove.includes(email)));
        setSelectedCurrentStudents(new Set());
        await fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to remove students', error);
    }
  };


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


  const confirmDeleteMeeting = (meeting, e) => {
    // Stop event propagation to prevent opening meeting details
    e.stopPropagation();
    setMeetingToDelete(meeting);
    setIsDeleteConfirmOpen(true);
  };


  const filteredAvailableStudents = allStudents
    .filter(student =>
      student &&
      student.email &&
      !students.includes(student.email) &&
      (
        (nameSearchTerm === '' ||
          (student.name && student.name.toLowerCase().includes(nameSearchTerm.toLowerCase()))) &&
        (registerSearchTerm === '' ||
          (student.register && student.register.toLowerCase().includes(registerSearchTerm.toLowerCase())))
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

            {/* Edit Button */}
            <button
              onClick={(e) => startEditing(meeting, e)}
              className="absolute top-2 right-10 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full z-10"
              title="Edit Meeting"
            >
              <Edit2 size={16} />
            </button>

            {/* Meeting Card Content */}
            <div
              className="cursor-pointer"
              onClick={() => openMeetingDetails(meeting)}
            >
              {editingMeeting?.id === meeting.id ? (
                <div onClick={(e) => e.stopPropagation()} className="space-y-2">
                  <input
                    type="text"
                    value={editedValues.title}
                    onChange={(e) => setEditedValues({ ...editedValues, title: e.target.value })}
                    className="w-full p-1 rounded bg-white text-black"
                    placeholder="Meeting Title"
                  />
                  <input
                    type="text"
                    value={editedValues.team}
                    onChange={(e) => setEditedValues({ ...editedValues, team: e.target.value })}
                    className="w-full p-1 rounded bg-white text-black"
                    placeholder="Team"
                  />
                  <input
                    type="date"
                    value={editedValues.date}
                    onChange={(e) => setEditedValues({ ...editedValues, date: e.target.value })}
                    className="w-full p-1 rounded bg-white text-black"
                  />
                  <input
                    type="datetime-local"
                    value={editedValues.from_time}
                    onChange={(e) => setEditedValues({ ...editedValues, from_time: e.target.value })}
                    className="w-full p-1 rounded bg-white text-black"
                  />
                  <input
                    type="datetime-local"
                    value={editedValues.to_time}
                    onChange={(e) => setEditedValues({ ...editedValues, to_time: e.target.value })}
                    className="w-full p-1 rounded bg-white text-black"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMeeting(null);
                      }}
                      className="px-2 py-1 bg-gray-500 text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdits}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-lg">{meeting.title}</h3>
                  <p>Team: {meeting.team}</p>
                  <p>Date: {new Date(meeting.date).toLocaleDateString()}</p>
                  <p>
                    Time: {new Date(meeting.from_time).toLocaleTimeString()} -{" "}
                    {new Date(meeting.to_time).toLocaleTimeString()}
                  </p>
                </>
              )}
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
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg w-11/12 max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">

              <div className="flex items-center space-x-2">
                <h2 className="text-2xl text-white font-bold">
                  {selectedMeeting.title}
                </h2>
              </div>

              <button
                onClick={printStudents}
                className="bg-[#00f5d0] hover:bg-green-600 text-black px-4 py-2 rounded flex items-center"
                disabled={students.length === 0}
              >
                <Printer className="mr-2" size={20} />
                Generate Report
              </button>
            </div>


            {/* Modal Content */}
            <div className="flex-grow overflow-auto space-y-6 bg-black">
              {/* Available Students Section */}
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Available Students</h3>
                  <div className="flex space-x-2">
                    {/* <button
                      onClick={selectAllAvailableStudents}
                      className="bg-[#00f5d0] hover:bg-green-600 text-black px-3 py-1 rounded text-sm"
                    >
                      Select All
                    </button> */}
                    <button
                      onClick={addMultipleStudentsToMeeting}
                      className="bg-[#00f5d0] hover:bg-green-600 text-black px-3 py-1 rounded text-sm"
                      disabled={selectedAvailableStudents.size === 0}
                    >
                      Add Selected ({selectedAvailableStudents.size})
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f5d0]" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={nameSearchTerm}
                      onChange={(e) => setNameSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border bg-black rounded-md text-white"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f5d0]" size={20} />
                    <input
                      type="text"
                      placeholder="Search by register number..."
                      value={registerSearchTerm}
                      onChange={(e) => setRegisterSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border bg-black rounded-md text-white"
                    />
                  </div>
                </div>


                {/* Students Table */}
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-black sticky top-0">
                      <tr>
                        <th className="px-2 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Register
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-200">
                      {currentStudents.map(student => (
                        <tr
                          key={student.email}
                          className={`hover:bg-gray-900 cursor-pointer ${selectedAvailableStudents.has(student.email) ? 'bg-gray-800' : ''
                            }`}
                          onClick={() => toggleAvailableStudentSelection(student.email)}
                        >
                          <td className="px-2 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedAvailableStudents.has(student.email)}
                              onChange={() => toggleAvailableStudentSelection(student.email)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {student.sec || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {student.year || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {student.register || '-'}
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Meeting Students (Total: {students.length})
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllCurrentStudents}
                      className="bg-[#00f5d0] hover:bg-green-600 text-black px-3 py-1 rounded text-sm"
                    >
                      Select All
                    </button>
                    <button
                      onClick={removeMultipleStudentsFromMeeting}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      disabled={selectedCurrentStudents.size === 0}
                    >
                      Remove Selected ({selectedCurrentStudents.size})
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-black sticky top-0">
                      <tr>
                        <th className="px-2 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                          Register
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-200">
                      {students.map(email => {
                        const student = allStudents.find(s => s.email === email);
                        return (
                          <tr
                            key={email}
                            className={`hover:bg-gray-900 ${selectedCurrentStudents.has(email) ? 'bg-gray-800' : ''
                              }`}
                            onClick={() => toggleCurrentStudentSelection(email)}
                          >
                            <td className="px-2 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedCurrentStudents.has(email)}
                                onChange={() => toggleCurrentStudentSelection(email)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{student?.name || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {student?.sec || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {student?.year || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {student?.register || '-'}
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





