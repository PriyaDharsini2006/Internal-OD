import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Printer, Trash2, ChevronRight as ChevronRightFolder, Calendar,Edit2 } from 'lucide-react';

const StaybackLog = ({ staybacks, setStaybacks, fetchStaybacks }) => {
  const { status } = useSession();
  const [selectedStayback, setSelectedStayback] = useState(null);
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState(new Set());
  const [selectedCurrentStudents, setSelectedCurrentStudents] = useState(new Set());
  const [registerSearchTerm, setRegisterSearchTerm] = useState('');
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openFolders, setOpenFolders] = useState(new Set());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [staybackToDelete, setStaybackToDelete] = useState(null);
  const recordsPerPage = 15;
  const [editingStaybackTitle, setEditingStaybackTitle] = useState(null);
  const [newStaybackTitle, setNewStaybackTitle] = useState('');


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
 
  const editStaybackTitle = async () => {
    if (!selectedStayback || !newStaybackTitle.trim()) return;

    try {
      const response = await fetch(`/api/staybacklogs/${selectedStayback.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newStaybackTitle.trim()
        })
      });

      if (response.ok) {
        // Update the stayback title in the local state
        setStaybacks(prevStaybacks => {
          const updatedStaybacks = { ...prevStaybacks };
          Object.keys(updatedStaybacks).forEach(date => {
            updatedStaybacks[date] = updatedStaybacks[date].map(stayback => 
              stayback.id === selectedStayback.id 
                ? { ...stayback, title: newStaybackTitle.trim() } 
                : stayback
            );
          });
          return updatedStaybacks;
        });

        // Update the selectedStayback state
        setSelectedStayback(prev => ({
          ...prev,
          title: newStaybackTitle.trim()
        }));

        // Reset editing state
        setEditingStaybackTitle(null);
        setNewStaybackTitle('');

        // Refresh staybacks data
        await fetchStaybacks();
      } else {
        console.error('Failed to update stayback title');
      }
    } catch (error) {
      console.error('Failed to update stayback title', error);
    }
  };

  // Toggle selection of a current student
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

  // Add multiple selected students to stayback
  const addMultipleStudentsToStayback = async () => {
    if (!selectedStayback) return;
  
    try {
      const studentsToAdd = Array.from(selectedAvailableStudents);
      
      const response = await fetch(`/api/staybacklogs/${selectedStayback.id}/students`, {
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
        await fetchStaybacks();
      }
    } catch (error) {
      console.error('Failed to add students', error);
    }
  };

  // Remove multiple selected students from stayback
  const removeMultipleStudentsFromStayback = async () => {
    if (!selectedStayback) return;
  
    try {
      const studentsToRemove = Array.from(selectedCurrentStudents);
      
      const response = await fetch(`/api/staybacklogs/${selectedStayback.id}/students`, {
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
        await fetchStaybacks();
      }
    } catch (error) {
      console.error('Failed to remove students', error);
    }
  };

  // Select all available students
  const selectAllAvailableStudents = () => {
    const allAvailableEmails = currentStudents.map(student => student.email);
    setSelectedAvailableStudents(new Set(allAvailableEmails));
  };

  // Select all current students
  const selectAllCurrentStudents = () => {
    setSelectedCurrentStudents(new Set(students));
  };

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

  const confirmDeleteStayback = (stayback, e) => {
    // Stop event propagation to prevent opening stayback details
    e.stopPropagation();
    setStaybackToDelete(stayback);
    setIsDeleteConfirmOpen(true);
  };

  const deleteStayback = async () => {
    if (!staybackToDelete) return;

    try {
      const response = await fetch(`/api/staybacklogs/${staybackToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Remove the deleted stayback from the staybacks list
        setStaybacks(prevStaybacks => {
          // Assuming staybacks is an object with date-based keys
          const updatedStaybacks = { ...prevStaybacks };
          Object.keys(updatedStaybacks).forEach(date => {
            updatedStaybacks[date] = updatedStaybacks[date].filter(
              stayback => stayback.id !== staybackToDelete.id
            );
          });
          return updatedStaybacks;
        });

        // Close the delete confirmation 
        setIsDeleteConfirmOpen(false);
        setStaybackToDelete(null);

        // Refresh staybacks data
        await fetchStaybacks();
      } else {
        console.error('Failed to delete stayback');
      }
    } catch (error) {
      console.error('Failed to delete stayback', error);
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

  const printStudents = () => {
    const printWindow = window.open('', '_blank');
    
    const studentDetails = students.map(email => {
      const student = allStudents.find(s => s.email === email);
      return student;
    }).filter(student => student);
    const logoBase64 = process.env.logoBase64;
    const cit = process.env.cit;


    // Base64 encoded logo (replace this with your actual logo's base64 string)
    const printContent = `
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
    
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
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
      margin-top: 100px;
      padding: 0 100px 50px 50px;
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
            <p>We deeply appreciate your dedication and valuable time for Hackerz!</p>
<p>Heartfelt thanks to all the students who are part of this stayback journey.</p>

          </div>
          <br>
          <hr>
          <h2>Stayback Details</h2>
          <p>${selectedStayback.title}</p>
          <p>Team: ${selectedStayback.team} | Date: ${new Date(selectedStayback.dateGroup.date).toLocaleDateString()}</p>
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
                ${studentDetails.map(student => `
                  <tr>
                    <td>${student.name || '-'}</td>
                    <td>${student.email}</td>
                    <td>${student.sec || '-'}</td>
                    <td>${student.year || '-'}</td>
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
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 space-y-2">
        {Object.entries(groupedStaybacks)
          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, dateStaybacks]) => (
            <div key={date} className="border rounded-lg bg-black shadow-sm">
              <div
                className="p-4 flex items-center cursor-pointer hover:bg-gray-900"
                onClick={() => toggleFolder(date)}
              >
                {openFolders.has(date) ? (
                  <ChevronDown className="h-5 w-5 text-[#00f5d0] mr-2" />
                ) : (
                  <ChevronRightFolder className="h-5 w-5 text-[#00f5d0] mr-2" />
                )}
                <Calendar className="h-5 w-5 text-[#00f5d0] mr-2" />
                <span className="font-medium text-white">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="ml-2 text-sm text-[#00f5d0]">
                  ({dateStaybacks.length} staybacks)
                </span>
              </div>

              {openFolders.has(date) && (
                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateStaybacks.map(stayback => (
                    <div
                      key={stayback.id}
                      className="p-4 rounded-md border bg-[#00f5d0] relative cursor-pointer hover:bg-green-200 transition-colors"
                      onClick={() => openStaybackDetails(stayback)}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => confirmDeleteStayback(stayback, e)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full z-10"
                        title="Delete Stayback"
                      >
                        <Trash2 size={16} />
                      </button>

                      <h3 className="font-semibold text-lg text-black mt-[-8px]">{stayback.title}</h3>
                      <p className="text-black">Team: {stayback.team}</p>
                      <p className="text-black">Students: {stayback.students?.length || 0}</p>
                    </div>
                  ))}
                </div>
              )}
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
                setStaybackToDelete(null);
              }}
              className="absolute top-2 right-2 text-white hover:text-red-500 transition"
              title="Cancel"
            >
              ✕
            </button>

            <Trash2 className="mx-auto mb-4 text-red-500" size={64} />
            <h2 className="text-2xl font-bold mb-4 text-white">
              Delete Stayback
            </h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete the stayback &quot;{staybackToDelete?.title}&quot;?
              This action cannot be undone.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setStaybackToDelete(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteStayback}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal for stayback details */}
      {selectedStayback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg w-11/12 max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              {editingStaybackTitle === selectedStayback.id ? (
                <div className="flex items-center space-x-2 w-full">
                  <input
                    type="text"
                    value={newStaybackTitle}
                    onChange={(e) => setNewStaybackTitle(e.target.value)}
                    className="flex-grow bg-black border rounded-md px-3 py-2 text-white"
                    placeholder="Enter new stayback title"
                  />
                  <button
                    onClick={editStaybackTitle}
                    className="bg-[#00f5d0] hover:bg-green-600 text-black px-3 py-2 rounded"
                    disabled={!newStaybackTitle.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingStaybackTitle(null);
                      setNewStaybackTitle('');
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-white">{selectedStayback.title}</h2>
                  <button
                    onClick={() => {
                      setEditingStaybackTitle(selectedStayback.id);
                      setNewStaybackTitle(selectedStayback.title);
                    }}
                    className="text-[#00f5d0] hover:text-green-400"
                    title="Edit Stayback Title"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>
              )}
              
              <div className="text-[#00f5d0] flex items-center space-x-4">
                <div>
                  <p>Team: {selectedStayback.team}</p>
                  <p>Date: {new Date(selectedStayback.dateGroup.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={printStudents}
                  className="bg-[#00f5d0] hover:bg-green-600 text-black px-3 py-2 rounded flex items-center"
                >
                  <Printer className="mr-2" size={20} /> Generate Report
                </button>
              </div>
            </div>


        <div className="flex-grow overflow-auto space-y-6">
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
                      onClick={addMultipleStudentsToStayback}
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
                          className={`hover:bg-gray-900 cursor-pointer ${
                            selectedAvailableStudents.has(student.email) ? 'bg-gray-800' : ''
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

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAvailableStudents.length)} of {filteredAvailableStudents.length} students
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 border rounded-md hover:bg-black-100 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 text-white" />
                    </button>
                    <span className="text-sm text-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="p-2 border rounded-md hover:bg-black-100 disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Students Section */}
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Stayback Students (Total: {students.length})
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllCurrentStudents}
                      className="bg-[#00f5d0] hover:bg-green-600 text-black px-3 py-1 rounded text-sm"
                    >
                      Select All
                    </button>
                    <button
                      onClick={removeMultipleStudentsFromStayback}
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
                            className={`hover:bg-gray-900 ${
                              selectedCurrentStudents.has(email) ? 'bg-gray-800' : ''
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
            <button
              onClick={() => setSelectedStayback(null)}
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

export default StaybackLog;



