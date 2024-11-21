import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const MeetingLog = () => {
    const { data: session, status } = useSession();
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [students, setStudents] = useState([]);
    const [presentStudents, setPresentStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMeetings = async () => {
          try {
            const response = await fetch('/api/meetings');
            const data = await response.json();
            setMeetings(data.map(meeting => ({
              ...meeting,
              from_time: new Date(meeting.from_time),
              to_time: new Date(meeting.to_time),
              date: new Date(meeting.date)
            })));
          } catch (error) {
            console.error('Failed to fetch meetings', error);
          }
        };

        const fetchStudents = async () => {
            try {
              const response = await fetch('/api/students');
              const data = await response.json();
              // Ensure data is an array
              setAllStudents(Array.isArray(data) ? data : []);
            } catch (error) {
              console.error('Failed to fetch students', error);
              setAllStudents([]);
            }
          };

    
          if (status === 'authenticated') {
            fetchMeetings();
            fetchStudents();
          }
        }, [status]);

  const openMeetingDetails = async (meeting) => {
    try {
      setSelectedMeeting(meeting);
      setStudents(meeting.students || []);
      setPresentStudents(meeting.students || []);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Meeting List Rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map(meeting => (
          <div 
            key={meeting.id} 
            className={`p-4 rounded-md shadow-md cursor-pointer ${
              new Date() > meeting.to_time 
                ? 'bg-green-100 hover:bg-green-200' 
                : 'bg-red-100 hover:bg-red-200'
            }`}
            onClick={() => openMeetingDetails(meeting)}
          >
            <h3 className="font-semibold text-lg">{meeting.title}</h3>
            <p>Team: {meeting.team}</p>
            <p>Date: {meeting.date.toLocaleDateString()}</p>
            <p>Time: {meeting.from_time.toLocaleTimeString()} - {meeting.to_time.toLocaleTimeString()}</p>
          </div>
        ))}
      </div>

      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-5/6 max-w-4xl max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">{selectedMeeting.title} Details</h2>
            
            <div className="flex-grow overflow-auto grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Available Students</h3>
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-3"
                />
                <div className="max-h-[50vh] overflow-y-auto">
                  {filteredAvailableStudents.map(student => (
                    <div 
                      key={student.email} 
                      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                    >
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <button 
                        onClick={() => addStudentToMeeting(student.email)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">
                  Meeting Students (Total: {students.length})
                </h3>
                <div className="max-h-[50vh] overflow-y-auto">
                  {students.map(email => {
                    const student = allStudents.find(s => s.email === email);
                    return (
                      <div 
                        key={email} 
                        className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                      >
                        <div>
                          <p className="font-medium">{student?.name || email}</p>
                          {student?.email && (
                            <p className="text-sm text-gray-500">{student.email}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeStudentFromMeeting(email)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedMeeting(null)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
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