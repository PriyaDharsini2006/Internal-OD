import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const RequestForm = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [requestType, setRequestType] = useState('OD Request');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const ITEMS_PER_PAGE = 10;
  const sectionsOptions = ['A', 'B', 'C', 'D'];
  const yearsOptions = [2027, 2026, 2025, 2024];
  const [loading, setLoading] = useState(true);


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
      setError(''); // Clear previous errors
      
      const params = new URLSearchParams({
        search: searchTerm,
        section: selectedSection,
        year: selectedYear
      });
  
      // Add error handling for each fetch request separately
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
        throw new Error('Failed to fetch counts data');
      }
  
      // Ensure countsData is an array
      const countsArray = Array.isArray(countsData) ? countsData : [];
      
      // Merge students data with their counts
      const studentsWithCounts = studentsData.map(student => ({
        ...student,
        counts: countsArray.find(count => count.email === student.email) || {
          stayback_cnt: 0,
          meeting_cnt: 0
        }
      }));
  
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
    const matchesSection = selectedSection === 'all' || student.sec === selectedSection;
    const matchesYear = selectedYear === 'all' || student.year === parseInt(selectedYear);
    return matchesSearch && matchesSection && matchesYear;
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

  const validateForm = () => {
    if (selectedStudents.length === 0) return 'Please select at least one student';
    if (!reason) return 'Please enter a reason';
    if (!description) return 'Please enter a description';
    if (!fromTime) return 'Please select start time';
    if (!toTime) return 'Please select end time';
    if (fromTime >= toTime) return 'End time must be after start time';
    return null;
  };

  const handleSendRequest = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const requests = selectedStudents.map(userId => ({
        user_id: userId,
        reason,
        description,
        from_time: new Date(`2024-01-01T${fromTime}`).toISOString(),
        to_time: new Date(`2024-01-01T${toTime}`).toISOString(),
        request_type: requestType,
        teamlead_id: session.user.id // Assuming you have the teamlead's ID in the session
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
      // Reset form
      setSelectedStudents([]);
      setReason('');
      setDescription('');
      setFromTime('');
      setToTime('');
      
      // Refresh the students data to get updated counts
      await fetchStudents();
    } catch (error) {
      setError('Failed to send request: ' + error.message);
    }
  };

  
  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-700">Send Requests</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

      <div className="flex gap-4 mb-4">
        {["OD Request", "Stayback Request", "Meeting Request"].map((type) => (
          <label key={type} className="flex items-center">
            <input
              type="radio"
              name="requestType"
              value={type}
              checked={requestType === type}
              onChange={() => setRequestType(type)}
              className="mr-2"
            />
            {type}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Sections</option>
          {sectionsOptions.map((section) => (
            <option key={section} value={section}>
              Section {section}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Years</option>
          {yearsOptions.map((year) => (
            <option key={year} value={year}>
              Year {year}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 overflow-y-auto max-h-96">
        <table className="min-w-full bg-white border">
          <thead className="sticky top-0 bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">Select</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Section</th>
              <th className="px-4 py-2 border">Year</th>
              <th className="px-4 py-2 border">Stayback Count</th>
              <th className="px-4 py-2 border">Meeting Count</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-2 text-center">Loading...</td>
              </tr>
            ) : (
              currentStudents.map((student) => (
                <tr key={student.user_id}>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.user_id)}
                      onChange={() => handleSelectStudent(student.user_id)}
                    />
                  </td>
                  <td className="px-4 py-2 border">{student.name}</td>
                  <td className="px-4 py-2 border">{student.email}</td>
                  <td className="px-4 py-2 border">{student.sec}</td>
                  <td className="px-4 py-2 border">{student.year}</td>
                  <td className="px-4 py-2 border">{student.counts.stayback_cnt}</td>
                  <td className="px-4 py-2 border">{student.counts.meeting_cnt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div>
          Showing {startIndex + 1} to {endIndex} of {totalStudents.length} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="px-4 py-2 border rounded"
          />
        </div>
      </div>

      <button
        onClick={handleSendRequest}
        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Send Request
      </button>
    </div>
  );
};

export default RequestForm;