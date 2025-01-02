import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';

const TeamStudentMeetingCountLeaderboard = () => {
    const [teamStudentCounts, setTeamStudentCounts] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('All Workshop teams');
    const [selectedTeamType, setSelectedTeamType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [yearMeetingCount, setYearMeetingCount] = useState(0);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const years = [
        { value: 4, label: '2025' },
        { value: 3, label: '2026' },
        { value: 2, label: '2027' },
        { value: 1, label: '2028' }
    ];

    const years1 = [
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' },
        { value: '2027', label: '2027' },
        { value: '2028', label: '2028' }
    ];

    const printStudents = () => {
        const printWindow = window.open('', '_blank');


        // Base64 encoded logo (replace this with your actual logo's base64 string)


        const printContent = `
        <!DOCTYPE html>
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
              .page {
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
            .page-header {
              position: relative;
              height: 150px;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
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
              position: absolute;
              bottom: 0;
              width: 100%;
              padding: 10px 0;
            }
            table { 
              margin-top: 0; 
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
          <div class="page-header">
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
            
            <div class="certificate-content">
              <p>Meeting Attendance Record for ${selectedTeam}</p>
              <h2>HACKERZ 2025</h2>
            </div>
          </div>
        
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Register</th>
                <th>Section</th>
                <th>Year</th>
                <th>Meeting Count</th>
              </tr>
            </thead>
            <tbody>
              ${teamStudentCounts.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.name}</td>
                  <td>${student.register}</td>
                  <td>${student.section}</td>
                  <td>${student.year}</td>
                  <td>${student.meeting_count}</td>
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
    // Define teams (same as previous code)
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
        'All Technical Teams',
        'All Non-Technical Teams',
        'All Workshop Teams',
        'All Committee Teams',
        'All Event Teams'
    ]

    useEffect(() => {
        const fetchMeetingCount = async () => {
            if (selectedYear) {
                try {
                    const selectedYearData = years.find((y) => y.label === selectedYear);
                    if (!selectedYearData) return;

                    const response = await fetch(`/api/totalMeetingCount?year=${selectedYearData.value}`);
                    if (!response.ok) throw new Error('Failed to fetch meeting count');
                    const data = await response.json();
                    setYearMeetingCount(data.meetingCount);
                } catch (err) {
                    console.error('Error fetching meeting count:', err);
                    setYearMeetingCount(0);
                }
            } else {
                setYearMeetingCount(0);
            }
        };

        fetchMeetingCount();
    }, [selectedYear]);


    useEffect(() => {
        const fetchTeamStudentMeetingCounts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/meetingcnt?team=${encodeURIComponent(selectedTeam)}${selectedYear ? `&year=${selectedYear}` : ''}`
                );
                if (!response.ok) throw new Error('Failed to fetch team student meeting counts');
                const data = await response.json();
                setTeamStudentCounts(data);
                setCurrentPage(1);
                setIsLoading(false);
            } catch (err) {
                setError(err.message || 'An unknown error occurred');
                setIsLoading(false);
            }
        };

        if (selectedTeam) {
            fetchTeamStudentMeetingCounts();
        }
    }, [selectedTeam, selectedYear]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const changeYear = (y) => {
        if(y === '2028'){
            return 2028;
        }
        if(y === '2027'){
            return 2027;
        }
        if(y === '2026'){
            return 2026;
        }
        if(y === '2025'){
            return 2025;
        }
    }

    const currentStudentCounts = teamStudentCounts
        .filter(student => selectedYear ? student.year === changeYear(selectedYear) : true)
        .slice(indexOfFirstItem, indexOfLastItem);



    const totalPages = Math.ceil(teamStudentCounts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="backdrop-blur-xl rounded-2xl border border-white/10">
                    <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden p-6">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">
                            Team Student Meeting Counts
                        </h2>
                        <p className="text-center text-gray-500">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="backdrop-blur-xl rounded-2xl border border-white/10">
                    <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden p-6">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">
                            Team Student Meeting Counts
                        </h2>
                        <p className="text-center text-red-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row items-center mb-6">
                <img
                    className="w-36 h-36 rounded object-contain"
                    src="/logo1.png"
                    alt="Company Logo"
                />
                <button
                    onClick={printStudents}
                    className="bg-[#00f5d0] hover:bg-green-600 text-black px-4 py-2 rounded flex items-center"
                >
                    <Printer className="mr-2" size={20} />
                    Print
                </button>
                <div className="ml-auto flex flex-col space-y-4">
                    {/* Team Type Selection */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="team-type-select" className="text-white mr-2">Team Type:</label>
                        <select
                            id="team-type-select"
                            value={selectedTeamType}
                            onChange={(e) => {
                                setSelectedTeamType(e.target.value);
                                setSelectedTeam(''); // Reset specific team selection
                            }}
                            className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
                        >
                            <option className='text-white bg-black' value="">Select Team Type</option>
                            <option className='text-white bg-black' value="workshops">Workshops</option>
                            <option className='text-white bg-black' value="technical">Technical Teams</option>
                            <option className='text-white bg-black' value="non-technical">Non-Technical Teams</option>
                            <option className='text-white bg-black' value="committee">Committee Teams</option>
                        </select>
                    </div>

                    {/* Specific Team Selection */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="team-select" className="text-white mr-2">Select Team:</label>
                        <select
                            id="team-select"
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
                    <div className="flex items-center space-x-2">
                        <label htmlFor="year-filter-select" className="text-white mr-2">Filter by Year:</label>
                        <select
                            id="year-filter-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0]"
                        >
                            <option className='text-white bg-black' value="">Select Year</option>
                            {years1.map((year) => (
                                <option key={year.value} value={year.value} className="text-white bg-black">
                                    {year.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedYear && (
                        <div className="text-white text-right">
                            Total Meeting Count of the year: {yearMeetingCount}
                        </div>
                    )}
                </div>
            </div>

            <div className="backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-white-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider  md:table-cell">
                                        Register
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider  md:table-cell">
                                        Section
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider  md:table-cell">
                                        Year
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        Meeting Count
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentStudentCounts.map((student, index) => (
                                    <tr
                                        key={student.email}
                                        className="hover:bg-gray-800/50 transition duration-200"
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                                            {student.name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white  md:table-cell">
                                            {student.register}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white  md:table-cell">
                                            {student.section}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white  md:table-cell">
                                            {student.year}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-white">
                                            {student.meeting_count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center space-x-2 py-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-[#00f5d0] text-black rounded hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-white px-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-[#00f5d0] text-black rounded hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamStudentMeetingCountLeaderboard;