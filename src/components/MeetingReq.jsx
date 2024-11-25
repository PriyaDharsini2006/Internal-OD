// 
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search,X, Plus, ChevronDown } from 'lucide-react';
import MeetingLog from './MeetingLog';

const MeetingRequest = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const teamOptions = [
    'Event Coordinator',
    'Committee Coordinator',
    'Content',
    'Development',
    'Design',
    'Documentation',
    'Helpdesk and Registration',
    'Hosting',
    'Logistics & Requirements',
    'Marketing',
    'Non-technical Events',
    'Social Media',
    'Technical',
    'Workshops',
    'Sponsorship',
    'Media',
    'Decoration'
  ];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  

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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedSection !== 'all') params.append('section', selectedSection);
        if (selectedYear !== 'all') params.append('year', selectedYear);
  
        const response = await fetch(`/api/students?${params.toString()}`);
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError('Failed to fetch students');
      }
    };
  
    if (status === 'authenticated') {
      fetchStudents();
      fetchMeetings();
    }
  }, [status, searchTerm, selectedSection, selectedYear]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSelect = (email) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.includes(email)
        ? prev.students.filter(e => e !== email)
        : [...prev.students, email]
    }));
  };

  

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

      setFormData({
        team: '',
        title: '',
        from_time: '',
        to_time: '',
        date: '',
        students: []
      });

      await fetchMeetings();
      alert('Meeting request submitted successfully');
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const filteredStudents = students.filter(student => {
    const searchLower = localSearch.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.sec.toLowerCase().includes(searchLower) ||
      student.year.toString().includes(searchLower)
    );
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      team: '',
      title: '',
      from_time: '',
      to_time: '',
      date: '',
      students: []
    });
    setError(null);
    setLocalSearch('');
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto bg-black rounded-xl shadow-md">
      <div className="flex flex-row">
        <div className="flex-shrink-0">
          <img 
            className="w-36 h-36 rounded object-contain" 
            src="/logo1.png" 
            alt="Company Logo" 
          />
        </div>
        <h1 className="text-2xl sm:text-2xl py-12 px-36 font-bold mb-4 ml-10 sm:mb-6 text-gray-400">
          Meeting
        </h1>
      </div>
  
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
  
      <div className="relative">
        <div className="flex justify-end mb-4 mt-[30px]">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#00f5d0] hover:opacity-90 text-black font-bold py-2 px-4 rounded flex items-center"
          >
            <Plus className="mr-2" size={20} />
            Create Meeting
          </button>
        </div>
  
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-40 flex justify-center items-center">
            <div className="bg-black border border-[#00f5d0] rounded-xl shadow-md w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-[#00f5d0] hover:opacity-90"
              >
                <X size={24} />
              </button>
  
              <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-400">
                Create Meeting
              </h1>
  
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
  
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#00f5d0]">Team</label>
                  <div className="relative">
                    <select
                      name="team"
                      value={formData.team}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0] appearance-none"
                    >
                      <option value="">Select a team</option>
                      {teamOptions.map((team) => (
                        <option key={team} value={team} className="bg-black text-white">
                          {team}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00f5d0] pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
  
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#00f5d0]">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                  />
                </div>
  
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#00f5d0]">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#00f5d0] rounded-md bg-white text-black focus:ring-2 focus:ring-[#00f5d0]"
                  />
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#00f5d0]">From Time</label>
                    <input
                      type="time"
                      name="from_time"
                      value={formData.from_time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#00f5d0]">To Time</label>
                    <input
                      type="time"
                      name="to_time"
                      value={formData.to_time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                    />
                  </div>
                </div>
  
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 sm:py-3 rounded-md text-black font-bold transition duration-200 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#00f5d0] hover:opacity-90'
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Create Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        <MeetingLog
          meetings={meetings}
          setMeetings={setMeetings}
          fetchMeetings={fetchMeetings}
        />
      </div>
    </div>
  );
  
};

export default MeetingRequest;