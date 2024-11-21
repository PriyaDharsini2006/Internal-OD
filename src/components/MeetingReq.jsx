import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MeetingLog from './MeetingLog';

const MeetingRequest = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    team: '',
    title: '',
    from_time: '',
    to_time: '',
    date: '',
    students: []
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch students when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError('Failed to fetch students');
      }
    };

    if (status === 'authenticated') {
      fetchStudents();
    }
  }, [status]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle student selection
  const handleStudentSelect = (email) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.includes(email)
        ? prev.students.filter(e => e !== email)
        : [...prev.students, email]
    }));
  };

  // Submit meeting request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date),
          from_time: new Date(`${formData.date}T${formData.from_time}`),
          to_time: new Date(`${formData.date}T${formData.to_time}`)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit meeting request');
      }

      // Reset form after successful submission
      setFormData({
        team: '',
        title: '',
        from_time: '',
        to_time: '',
        date: '',
        students: []
      });

      // Optional: Show success message or redirect
      alert('Meeting request submitted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  return (
    <>
    <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-700">Create Meeting Request</h1>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Team</label>
          <input
            type="text"
            name="team"
            value={formData.team}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">From Time</label>
            <input
              type="time"
              name="from_time"
              value={formData.from_time}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">To Time</label>
            <input
              type="time"
              name="to_time"
              value={formData.to_time}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Select Students</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-md p-2">
            {students.map((student) => (
              <div 
                key={student.email} 
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  formData.students.includes(student.email) 
                    ? 'bg-blue-100 ring-2 ring-blue-300' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleStudentSelect(student.email)}
              >
                <input
                  type="checkbox"
                  checked={formData.students.includes(student.email)}
                  onChange={() => handleStudentSelect(student.email)}
                  className="mr-2 flex-shrink-0"
                />
                <span className="truncate">{student.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 sm:py-3 rounded-md text-white transition duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Create Meeting Request'}
          </button>
        </div>
      </form>
    </div>
    <MeetingLog/>
    </>
  );
};

export default MeetingRequest;