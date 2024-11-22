import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightFolder, Calendar } from 'lucide-react';

const StaybackLog = ({ staybacks, setStaybacks, fetchStaybacks }) => {
  const { status } = useSession();
  const [selectedStayback, setSelectedStayback] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openFolders, setOpenFolders] = useState(new Set());
  const recordsPerPage = 15;

  // Handle folder toggle
  const toggleFolder = (date) => {
    const newOpenFolders = new Set(openFolders);
    if (newOpenFolders.has(date)) {
      newOpenFolders.delete(date);
    } else {
      newOpenFolders.add(date);
    }
    setOpenFolders(newOpenFolders);
  };

  // Fetch all students on component mount
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

  const openStaybackDetails = async (stayback) => {
    try {
      // Get the complete stayback details including students
      const response = await fetch(`/api/staybacklogs/${stayback.id}`);
      const detailedStayback = await response.json();
      
      setSelectedStayback(detailedStayback);
      setStudents(detailedStayback.students || []);
      setCurrentPage(1);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to fetch stayback details', error);
    }
  };

  const addStudentToStayback = async (email) => {
    if (!selectedStayback) return;
  
    try {
      const response = await fetch(`/api/staybacklogs/${selectedStayback.id}/students`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          students: [...students, email] // Use the students state array
        })
      });
      
      if (response.ok) {
        setStudents(prev => [...prev, email]);
        await fetchStaybacks();
      }
    } catch (error) {
      console.error('Failed to add student', error);
    }
  };
  
  const removeStudentFromStayback = async (email) => {
    if (!selectedStayback) return;
  
    try {
      const response = await fetch(`/api/staybacklogs/${selectedStayback.id}/students`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          students: students.filter(e => e !== email) // Filter from the students state array
        })
      });
      
      if (response.ok) {
        setStudents(prev => prev.filter(e => e !== email));
        await fetchStaybacks();
      }
    } catch (error) {
      console.error('Failed to remove student', error);
    }
  };

  const filteredAvailableStudents = allStudents
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

  // Group staybacks by date
  const groupedStaybacks = React.useMemo(() => {
    const groups = {};
    Object.values(staybacks).forEach(staybackArray => {
      staybackArray.forEach(stayback => {
        const dateStr = new Date(stayback.dateGroup.date).toISOString().split('T')[0];
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(stayback);
      });
    });
    return groups;
  }, [staybacks]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 space-y-2">
        {Object.entries(groupedStaybacks)
          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, dateStaybacks]) => (
          <div key={date} className="border rounded-lg bg-white shadow-sm">
            <div 
              className="p-4 flex items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleFolder(date)}
            >
              {openFolders.has(date) ? (
                <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
              ) : (
                <ChevronRightFolder className="h-5 w-5 text-gray-500 mr-2" />
              )}
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ({dateStaybacks.length} staybacks)
              </span>
            </div>
            
            {openFolders.has(date) && (
              <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateStaybacks.map(stayback => (
                  <div 
                    key={stayback.id}
                    className="p-4 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => openStaybackDetails(stayback)}
                  >
                    <h3 className="font-semibold text-lg text-gray-800">{stayback.title}</h3>
                    <p className="text-gray-600">Team: {stayback.team}</p>
                    <p className="text-gray-600">Students: {stayback.students?.length || 0}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for stayback details */}
      {selectedStayback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedStayback.title}</h2>
              <div className="text-gray-600">
                <p>Team: {selectedStayback.team}</p>
                <p>Date: {new Date(selectedStayback.dateGroup.date).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex-grow overflow-auto space-y-6">
              {/* Available Students Section */}
              <div className="border rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-4">Available Students</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md"
                    />
                  </div>
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
                      {currentStudents.map(student => (
                        <tr 
                          key={student.email}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => addStudentToStayback(student.email)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addStudentToStayback(student.email);
                              }}
                            >
                              Add
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.sec || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.year || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAvailableStudents.length)} of {filteredAvailableStudents.length} students
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                  Stayback Students (Total: {students.length})
                </h3>
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
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
                      {students.map(email => {
                        const student = allStudents.find(s => s.email === email);
                        return (
                          <tr key={email} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => removeStudentFromStayback(email)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Remove
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student?.name || '-'}</div>
                              <div className="text-sm text-gray-500">{email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.sec || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student?.year || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedStayback(null)}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200"
            >
              Close
            </button>
          </div>    
        </div>
      )}
    </div>
  );
};

export default StaybackLog;