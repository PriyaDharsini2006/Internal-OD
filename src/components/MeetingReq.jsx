import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, X, Plus, ChevronDown, AlertTriangle } from 'lucide-react';
import MeetingLog from './MeetingLog';
import MeetingCnt from './meetingcnt';


const FullPageMeetingCount = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-[#00f5d0]">
        <h1 className="text-3xl font-bold text-[#00f5d0]">Total Meeting Count Leaderboard</h1>
        <button
          onClick={onClose}
          className="text-[#00f5d0] hover:opacity-90"
        >
          <X size={32} />
        </button>
      </div>

      <div className="flex-grow overflow-auto">
        <MeetingCnt />
      </div>
    </div>
  );
};


const MeetingRequest = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showFullPageMeetingCount, setShowFullPageMeetingCount] = useState(false);

  const handleButtonClick = () => {
    setShowFullPageMeetingCount(true);
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
    'Case Study',
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
    'Decoration Team',
    'Video Editing',
  ]

  const allTeams = [
    'All Teachnical Teams',
    'All Non-Technical Teams',
    'All Workshop Teams',
    'All Committee Teams',
    'All Event Teams'
  ]



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    team: '',
    title: '',
    from_time: '',
    from_time_modifier: 'AM',
    to_time: '',
    to_time_modifier: 'AM',
    date: '',
    students: []
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedYear, setSelectedYear] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  const [registerNumberSearch, setRegisterNumberSearch] = useState('');
  const [timeError, setTimeError] = useState('');
  const [businessHoursWarning, setBusinessHoursWarning] = useState(false);
  const [proceedWithSubmit, setProceedWithSubmit] = useState(false);
  const [selectedTeamType, setSelectedTeamType] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  const isOutsideBusinessHours = (time, modifier) => {
    // Convert time to 24-hour format for easier comparison
    let [hours, minutes] = time.split(':').map(Number);

    // Adjust for AM/PM
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    // Check if time is before 8 AM or after 5 PM
    return hours < 8 || hours >= 17;
  };


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
  }, [status, searchTerm, selectedYear]);


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

    // Check if first time checking outside business hours or already proceeded
    if (!proceedWithSubmit && (
      isOutsideBusinessHours(formData.from_time, formData.from_time_modifier) ||
      isOutsideBusinessHours(formData.to_time, formData.to_time_modifier)
    )) {
      setBusinessHoursWarning(true);
      return;
    }

    // Reset business hours warning and proceed flag
    setBusinessHoursWarning(false);
    setProceedWithSubmit(false);

    setLoading(true);
    setError(null);

    const timeValidation = validateTime(
      formData.from_time,
      formData.from_time_modifier,
      formData.to_time,
      formData.to_time_modifier
    );

    if (timeValidation) {
      setTimeError(timeValidation);
      setLoading(false);
      return;
    }

    try {
      const fromTime24 = convertTo24Hour(formData.from_time, formData.from_time_modifier);
      const toTime24 = convertTo24Hour(formData.to_time, formData.to_time_modifier);

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          team: selectedTeam,
          date: new Date(formData.date),
          from_time: new Date(`${formData.date}T${fromTime24}`),
          to_time: new Date(`${formData.date}T${toTime24}`)
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
        from_time_modifier: 'AM',
        to_time: '',
        to_time_modifier: 'AM',
        date: '',
        students: []
      });

      await fetchMeetings();
      alert('Meeting request submitted successfully');
      setIsModalOpen(false);
      setTimeError('');
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
    const registerLower = student.register.toLowerCase();
    const registerSearchLower = registerNumberSearch.toLowerCase();

    const matchesLocalSearch =
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.sec.toLowerCase().includes(searchLower) ||
      student.year.toString().includes(searchLower);

    const matchesRegisterNumber =
      registerNumberSearch === '' || registerLower.includes(registerSearchLower);

    return matchesLocalSearch && matchesRegisterNumber;
  });

  const convertTo24Hour = (time, modifier) => {
    if (!time) return '';
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const validateTime = (startTime, startModifier, endTime, endModifier) => {
    // Check if both times are provided
    if (!startTime || !endTime) return null;

    // Convert times to 24-hour format
    const start24Hour = convertTo24Hour(startTime, startModifier);
    const end24Hour = convertTo24Hour(endTime, endModifier);

    // Split into hours and minutes
    const [startHours, startMinutes] = start24Hour.split(':').map(Number);
    const [endHours, endMinutes] = end24Hour.split(':').map(Number);

    // Create comparison times
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Check if end time is after start time
    if (startTotalMinutes >= endTotalMinutes) {
      return 'End time must be after start time';
    }

    return null;
  };


  const handleTimeChange = (e, timeType) => {
    const time = e.target.value;

    setFormData(prev => ({
      ...prev,
      [timeType]: time
    }));

    const timeValidation = validateTime(
      timeType === 'from_time' ? time : formData.from_time,
      timeType === 'from_time' ? formData.from_time_modifier : formData.to_time_modifier,
      timeType === 'to_time' ? time : formData.to_time,
      timeType === 'to_time' ? formData.to_time_modifier : formData.from_time_modifier
    );


    setTimeError(timeValidation || '');
  };

  const handleTimeModifierChange = (modifier, timeType) => {
    const modifierKey = timeType === 'from_time' ? 'from_time_modifier' : 'to_time_modifier';

    setFormData(prev => ({
      ...prev,
      [modifierKey]: modifier
    }));



    const timeValidation = validateTime(
      formData.from_time,
      timeType === 'from_time' ? modifier : formData.from_time_modifier,
      formData.to_time,
      timeType === 'to_time' ? modifier : formData.to_time_modifier
    );

    setTimeError(timeValidation || '');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      team: '',
      title: '',
      from_time: '',
      from_time_modifier: 'AM',
      to_time: '',
      to_time_modifier: 'AM',
      date: '',
      students: []
    });
    setError(null);
    setLocalSearch('');
    setTimeError(''); // Ensure this is cleared
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
          Meetings
        </h1>
        <button
          onClick={handleButtonClick} className="bg-[#00f5d0] font-grotesk mt-[50px] w-[189px] h-[40px] hover:opacity-90 text-black font-bold py-2 px-4 rounded flex items-center">
          Total Meeting Count
        </button>
        {showFullPageMeetingCount && (
          <FullPageMeetingCount
            onClose={() => setShowFullPageMeetingCount(false)}
          />
        )}
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
            className="bg-[#00f5d0] hover:opacity-90 font-grotesk text-black font-bold py-2 px-4 rounded flex items-center"
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

              <h1 className="text-xl sm:text-2xl font-grotesk mb-4 sm:mb-6 text-gray-400">
                Create Meeting
              </h1>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-white">Team</label>
                  <div className="relative">
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
                      <option className='text-white bg-black' value="allTeams">All Teams</option>
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
                      {selectedTeamType === 'non-technical' &&
                        nonTechnicalTeams.map((team) => (
                          <option className='text-white bg-black' key={team} value={team}>
                            {team}
                          </option>
                        ))
                      }
                      {selectedTeamType === 'allTeams' &&
                        allTeams.map((team) => (
                          <option className='text-white bg-black' key={team} value={team}>
                            {team}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-white">Title</label>
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
                    className="w-full px-3 py-2 border border-white rounded-md bg-black text-[#00f5d0] focus:ring-2 focus:ring-[#00f5d0] 
               [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 
               [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:hue-rotate-[120deg] 
               [&::-webkit-calendar-picker-indicator]:saturate-[1000%]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[#00f5d0]">Select Students</label>

                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f5d0]" size={20} />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#00f5d0]">Select Students</label>

                    <div className="mb-4 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f5d0]" size={20} />
                      <input
                        type="text"
                        placeholder="Search Register Number..."
                        value={registerNumberSearch}
                        onChange={(e) => setRegisterNumberSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                      />
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto border border-white rounded-md">
                    <table className="min-w-full divide-y divide-[#00f5d0]">
                      <thead className="bg-black sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                            Select
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#00f5d0] uppercase tracking-wider">
                            Register
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-black divide-y divide-[#00f5d0]">
                        {filteredStudents.map((student) => (
                          <tr
                            key={student.email}
                            className={`hover:bg-[#00f5d010] cursor-pointer ${formData.students.includes(student.email) ? 'bg-[#00f5d020]' : ''
                              }`}
                            onClick={() => handleStudentSelect(student.email)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={formData.students.includes(student.email)}
                                onChange={() => handleStudentSelect(student.email)}
                                className="h-4 w-4 text-[#00f5d0] focus:ring-[#00f5d0] border-[#00f5d0] rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {student.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {student.register}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#00f5d0]">From Time</label>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        name="from_time"
                        value={formData.from_time}
                        onChange={(e) => handleTimeChange(e, 'from_time')}
                        required
                        className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                      />
                      <select
                        value={formData.from_time_modifier}
                        onChange={(e) => handleTimeModifierChange(e.target.value, 'from_time')}
                        className="px-2 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#00f5d0]">To Time</label>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        name="to_time"
                        value={formData.to_time}
                        onChange={(e) => handleTimeChange(e, 'to_time')}
                        required
                        className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                      />
                      <select
                        value={formData.to_time_modifier}
                        onChange={(e) => handleTimeModifierChange(e.target.value, 'to_time')}
                        className="px-2 py-2 border border-white rounded-md bg-black text-white focus:ring-2 focus:ring-[#00f5d0]"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {timeError && (
                  <div className="text-red-500 text-sm mt-2">
                    {timeError}
                  </div>
                )}

                {businessHoursWarning && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md flex items-center mb-4">
                    <AlertTriangle className="mr-3 text-yellow-600" size={24} />
                    <div>
                      <p className="font-semibold">Outside College Hours</p>
                      <p className="text-sm">
                        This meeting is scheduled outside standard college hours (8 AM - 5 PM).
                        Are you sure you want to proceed?
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProceedWithSubmit(true);
                            handleSubmit(new Event('submit'));
                          }}
                          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                        >
                          Yes, Submit Anyway
                        </button>
                        <button
                          type="button"
                          onClick={() => setBusinessHoursWarning(false)}
                          className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 sm:py-3 rounded-md text-black font-bold transition duration-200 ${loading
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