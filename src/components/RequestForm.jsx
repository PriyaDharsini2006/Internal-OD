import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const RequestForm = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [registerNumberSearch, setRegisterNumberSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [fromTimeModifier, setFromTimeModifier] = useState('AM');
  const [toTime, setToTime] = useState('');
  const [toTimeModifier, setToTimeModifier] = useState('AM');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { data: session, status } = useSession();
  const [timeError, setTimeError] = useState('');
  const [selectedTeamType, setSelectedTeamType] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  

  const router = useRouter();

  const ITEMS_PER_PAGE = 10;
  const sectionsOptions = ['A', 'B', 'C', 'D'];
  const yearsOptions = [2027, 2026, 2025, 2024];
  const [loading, setLoading] = useState(true);


  const convertTo24Hour = (time, modifier) => {
    if (!time) return '';
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const validateTime = (startTime, startModifier, endTime, endModifier) => {
    if (!startTime || !endTime) return null;

    const workingHoursStart = 8; // 8 AM
    const workingHoursEnd = 17; // 5 PM

    const startHour24 = parseInt(convertTo24Hour(startTime, startModifier).split(':')[0]);
    const endHour24 = parseInt(convertTo24Hour(endTime, endModifier).split(':')[0]);


    // Compare times considering AM/PM
    const startDateTime = new Date(2024, 0, 1, startHour24, 0);
    const endDateTime = new Date(2024, 0, 1, endHour24, 0);

    if (startDateTime >= endDateTime) {
      return 'End time must be after start time';
    }

    return null;
  };

  const handleFromTimeChange = (e) => {
    const time = e.target.value;
    setFromTime(time);
    const timeValidation = validateTime(time, fromTimeModifier, toTime, toTimeModifier);
    setTimeError(timeValidation || '');
  };

  const handleToTimeChange = (e) => {
    const time = e.target.value;
    setToTime(time);
    const timeValidation = validateTime(fromTime, fromTimeModifier, time, toTimeModifier);
    setTimeError(timeValidation || '');
  };

  const handleSendRequest = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const fromTime24 = convertTo24Hour(fromTime, fromTimeModifier);
      const toTime24 = convertTo24Hour(toTime, toTimeModifier);

      const requests = selectedStudents.map(userId => ({
        user_id: userId,
        reason: selectedTeam,
        description,
        from_time: new Date(`2024-01-01T${fromTime24}`).toISOString(),
        to_time: new Date(`2024-01-01T${toTime24}`).toISOString(),
        request_type: 'OD Request',
        teamlead_id: session.user.id
      }));

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (response.status === 401) {
        router.push('/api/auth/signin');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send request');
      }

      setSuccessMessage('Requests sent successfully');
      setSelectedStudents([]);
      setReason('');
      setDescription('');
      setFromTime('');
      setToTime('');

      await fetchStudents();
    } catch (error) {
      setError('Failed to send request: ' + error.message);
    }
  };

  const validateForm = () => {
    if (selectedStudents.length === 0) return 'Please select at least one student';
    if (!selectedTeamType) return 'Please select team type';
    if (!selectedTeam) return 'Please select a specific team';
    if (!description) return 'Please enter a description';
    if (!fromTime) return 'Please select start time';
    if (!toTime) return 'Please select end time';
    const timeValidation = validateTime(fromTime, fromTimeModifier, toTime, toTimeModifier);
    if (timeValidation) return timeValidation;
    return null;
  };


  const Workshops = [
    'Linux and Networking',
    'Github',
    'UI/UX',
    'AR/VR',
    'AWS',
    'AI',
  ];

  const nonTechnicalTeams = [
    'Treasure Hunt',
    'Mobile Gaming',
    'Shortfilm',
    'Meme',
    'Photography',
  ];

  const technicalTeams = [
    'Ideathon',
    'Paper presentation',
    'Code-a-thon',
    'Debuggin event',
    'Pair programming',
    'UI event',
    'Technical Quiz',
    'Case Study'
  ];

  const committee = [
    'Development Team',
    'Design Team',
    'Documentation Team',
    'Helpdesk and Registration',
    'Hosting Team',
    'Marketing Team',
    'Logistics and Requirements',
    'Media team',
    'Social media Team',
    'Sponsorship',
    'Decoration Team'
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'TeamLead') {
      router.push('/');
    }
  }, [status, session?.user?.role, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TeamLead') {
      fetchStudents();
    }
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        search: searchTerm,
        section: selectedSection,
        year: selectedYear
      });

      let studentsData = [];
      let countsData = [];

      try {
        const studentsResponse = await fetch(`/api/students?${params}`);
        if (!studentsResponse.ok) {
          throw new Error(`Students API Error: ${studentsResponse.status}`);
        }
        studentsData = await studentsResponse.json();
        
      } catch (studentError) {
        console.error('Students fetch error:', studentError);
        throw new Error('Failed to fetch students data');
      }

      try {
        const countsResponse = await fetch('/api/counts');
        if (!countsResponse.ok) {
          throw new Error(`Counts API Error: ${countsResponse.status}`);
        }
        countsData = await countsResponse.json();
      } catch (countsError) {
        console.error('Counts fetch error:', countsError);
        countsData = [];
      }

      const countsArray = Array.isArray(countsData) ? countsData : [];

      const countsMap = new Map(
        countsArray.map(count => [count.email, count])
      );

      const studentsWithCounts = studentsData.map(student => {
        const studentCounts = countsMap.get(student.email);
        return {
          ...student,
          counts: studentCounts || {
            stayback_cnt: 0,
            meeting_cnt: 0,
            email: student.email
          }
        };
      });

      setStudents(studentsWithCounts);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message || 'Failed to fetch data');
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        router.push('/api/auth/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'TeamLead') return;

    const debounceTimer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSection, selectedYear]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegisterNumber = 
      registerNumberSearch === '' || 
      student.register.toLowerCase().includes(registerNumberSearch.toLowerCase());
    const matchesSection = selectedSection === 'all' || student.sec === selectedSection;
    const matchesYear = selectedYear === 'all' || student.year === parseInt(selectedYear);
    
    return matchesSearch && 
           matchesRegisterNumber && 
           matchesSection && 
           matchesYear;
  });


  const totalStudents = filteredStudents;
  const totalPages = Math.ceil(totalStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalStudents.length);
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleSelectStudent = (userId) => {
    setSelectedStudents(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };




  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        {/* Header Section */}
        <div className="border-b border-white/10 bg-black/30 rounded-t-2xl px-6 py-5">
          <div className="flex flex-row">
            <div className="flex-shrink-0 flex flex-row">
              <img
                className="w-36 h-36 rounded object-contain"
                src="/logo1.png"
                alt="Company Logo"
              />
            </div>
            <h1 className="text-2xl px-36 py-10 md:text-3xl font-grotesk font-bold text-[#00f5d0]">
              Send OD Request
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-md">
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Register Number..."
                value={registerNumberSearch}
                onChange={(e) => setRegisterNumberSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
              />
            </div>
          </div>


          {/* Table Section */}
          <div className="relative overflow-hidden rounded-lg border border-white/10">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Select</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Year</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Stayback</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Meeting</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Register</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-400">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      currentStudents.map((student) => (
                        <tr
                          key={student.user_id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.user_id)}
                              onChange={() => handleSelectStudent(student.user_id)}
                              className="w-4 h-4 text-[#00f5d0] bg-white/5 border-white/10 rounded focus:ring-[#00f5d0]"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{student.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{student.year}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{student.counts?.stayback_cnt || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{student.counts?.meeting_cnt || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{student.register}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {endIndex} of {totalStudents.length} entries
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-white/10 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 text-gray-300"
              >
                Previous
              </button>

              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1 border border-white/10 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5"
                  >
                    1
                  </button>
                  {currentPage > 3 && (
                    <span className="px-3 py-1 text-sm text-gray-300">...</span>
                  )}
                </>
              )}

              {[...Array(3)].map((_, i) => {
                const pageNumber = currentPage - 1 + i;
                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === pageNumber
                          ? 'bg-[#00f5d0] text-black border-[#00f5d0]'
                          : 'border-white/10 text-gray-300 hover:bg-white/5'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="px-3 py-1 text-sm text-gray-300">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 border border-white/10 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-white/10 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 text-gray-300"
              >
                Next
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  value={selectedTeamType}
                  onChange={(e) => {
                    setSelectedTeamType(e.target.value);
                    setSelectedTeam(''); // Reset specific team when type changes
                  }}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
                >
                  <option className='text-white bg-black' value="">Select Team Type</option>
                  <option className='text-white bg-black' value="technical">Technical Teams</option>
                  <option className='text-white bg-black' value="non-technical">Non-Technical Teams</option>
                  <option className='text-white bg-black' value="workshops">workshops</option>
                  <option className='text-white bg-black' value="committee">Committee</option>
                </select>
              </div>
              <div>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  disabled={!selectedTeamType}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0] disabled:opacity-50"
                >
                  <option className='text-white bg-black' value="">Select Specific Team</option>
                  {selectedTeamType === 'technical' &&
                    technicalTeams.map((team) => (
                      <option className='text-white bg-black' key={team} value={team}>
                        {team}
                      </option>
                    ))
                  }
                  {selectedTeamType === 'non-technical' &&
                    nonTechnicalTeams.map((team) => (
                      <option className='text-white bg-black' key={team} value={team}>
                        {team}
                      </option>
                    ))
                  }
                  {selectedTeamType === 'workshops' &&
                    Workshops.map((team) => (
                      <option className='text-white bg-black' key={team} value={team}>
                        {team}
                      </option>
                    ))
                  }
                  {selectedTeamType === 'committee' &&
                    committee.map((team) => (
                      <option className='text-white bg-black' key={team} value={team}>
                        {team}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div>
              <input
                type="text"
                placeholder="Task"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 placeholder-gray-500 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0] resize-none"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Time
                </label>
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={fromTime}
                    onChange={handleFromTimeChange}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
                  />
                  <select
                    value={fromTimeModifier}
                    onChange={(e) => {
                      setFromTimeModifier(e.target.value);
                      const timeValidation = validateTime(fromTime, e.target.value, toTime, toTimeModifier);
                      setTimeError(timeValidation || '');
                    }}
                    className="px-2 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 border border-white/10"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {fromTime && (
                  <span className="text-sm text-gray-400 mt-1 block">
                    {`${fromTime} ${fromTimeModifier}`}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Time
                </label>
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={toTime}
                    onChange={handleToTimeChange}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
                  />
                  <select
                    value={toTimeModifier}
                    onChange={(e) => {
                      setToTimeModifier(e.target.value);
                      const timeValidation = validateTime(fromTime, fromTimeModifier, toTime, e.target.value);
                      setTimeError(timeValidation || '');
                    }}
                    className="px-2 py-2 bg-white/5 backdrop-blur-xl rounded-lg text-gray-300 border border-white/10"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {toTime && (
                  <span className="text-sm text-gray-400 mt-1 block">
                    {`${toTime} ${toTimeModifier}`}
                  </span>
                )}
              </div>
            </div>
            {timeError && (
              <div className="mt-2 text-sm text-red-400">
                {timeError}
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-6 py-4 bg-black/30 rounded-b-2xl">
          <button
            onClick={handleSendRequest}
            className="w-full py-2.5 bg-[#00f5d0] text-black rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#00f5d0] focus:ring-offset-2 transition-all"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;