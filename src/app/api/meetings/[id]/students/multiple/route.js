const addMultipleStudentsToMeeting = async () => {
    if (!selectedMeeting || selectedAvailableStudents.size === 0) return;
  
    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}/students/multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emails: Array.from(selectedAvailableStudents),
          meetingId: selectedMeeting.id 
        })
      });
  
      if (response.ok) {
        const result = await response.json();
        setStudents(result.students);
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting.id === selectedMeeting.id
              ? { ...meeting, students: result.students }
              : meeting
          )
        );
        
        // Clear selected available students
        setSelectedAvailableStudents(new Set());
      } else {
        const errorData = await response.json();
        console.error('Failed to add multiple students', errorData);
      }
    } catch (error) {
      console.error('Failed to add multiple students', error);
    }
  };
  
  const removeMultipleStudentsFromMeeting = async () => {
    if (!selectedMeeting || selectedCurrentStudents.size === 0) return;
  
    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}/students/multiple`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emails: Array.from(selectedCurrentStudents),
          meetingId: selectedMeeting.id 
        })
      });
  
      if (response.ok) {
        const result = await response.json();
        setStudents(result.students);
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting.id === selectedMeeting.id
              ? { ...meeting, students: result.students }
              : meeting
          )
        );
        
        // Clear selected current students
        setSelectedCurrentStudents(new Set());
      } else {
        const errorData = await response.json();
        console.error('Failed to remove multiple students', errorData);
      }
    } catch (error) {
      console.error('Failed to remove multiple students', error);
    }
  };