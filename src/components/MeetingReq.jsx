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
    <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <div className="flex flex-row">
        <div className="flex-shrink-0">
          <img 
            className="w-36 h-36 rounded object-contain" 
            src="/logo.png" 
            alt="Company Logo" 
          />
        </div>
        <h1 className="text-2xl sm:text-2xl py-12 px-36 font-bold mb-4 sm:mb-6 text-gray-700">
          Create Meeting
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Plus className="mr-2" size={20} />
            Create Meeting
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-md w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>

              <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-700">
                Create Meeting
              </h1>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Team</label>
                <div className="relative">
                  <select
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 appearance-none bg-white"
                  >
                    <option value="">Select a team</option>
                    {teamOptions.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                    size={20} 
                  />
                </div>
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

                  <div className="mb-4 relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
                    />
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
                        {filteredStudents.map((student) => (
                          <tr
                            key={student.email}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              formData.students.includes(student.email) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleStudentSelect(student.email)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={formData.students.includes(student.email)}
                                onChange={() => handleStudentSelect(student.email)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.sec}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.year}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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