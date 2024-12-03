import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';

const TeamStudentMeetingCountLeaderboard = () => {
    const [teamStudentCounts, setTeamStudentCounts] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('All Workshop teams');
    const [selectedTeamType, setSelectedTeamType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Define teams (same as previous code)
    const Workshops = [
        'Linux and Networking',
        'Github',
        'UI/UX',
        'AR/VR',
        'AWS',
        'AI',
        'All Workshop Teams'
    ];

    const nonTechnicalTeams = [
        'Treasure Hunt',
        'Mobile Gaming',
        'Shortfilm',
        'Meme',
        'Photography',
        'All Non-Technical Teams'
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
        'All Technical Teams'
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
        'All Committe Teams'
    ]

    useEffect(() => {
        const fetchTeamStudentMeetingCounts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/meetingcnt?team=${encodeURIComponent(selectedTeam)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch team student meeting counts');
                }
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
    }, [selectedTeam]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudentCounts = teamStudentCounts.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(teamStudentCounts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="print-container container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="browser-view backdrop-blur-xl rounded-2xl border border-white/10">
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
            <div className="print-container container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="browser-view backdrop-blur-xl rounded-2xl border border-white/10">
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
        <div className="print-container container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="print-view hidden print:block">
                {/* First Page Content */}
                <div className="first-page print-page">
                    <div className="header flex justify-between items-center">
                        <img
                            id="citLogo"
                            src="citlogo.png"
                            alt="Chennai Institute of Technology Logo"
                            className="w-44 h-48 rounded object-contain"
                        />
                        <img
                            id="hackerzLogo"
                            src="logo.png"
                            alt="Hackerz Logo"
                            className="w-36 h-36 rounded object-contain"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-center mb-6">
                <img
                    className="w-36 h-36 rounded object-contain"
                    src="/logo1.png"
                    alt="Company Logo"
                />
                <div className="ml-auto flex flex-col space-y-4">
                    {/* Team Type Selection */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="team-type-select" className="text-white print:hidden mr-2">Team Type:</label>
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
                        <label htmlFor="team-select" className="text-white print:hidden mr-2">Select Team:</label>
                        <select
                            id="team-select"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            disabled={!selectedTeamType}
                            className="w-full print-hidden px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 focus:ring-2 focus:ring-[#00f5d0] focus:border-[#00f5d0] disabled:opacity-50"
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
                        </select>
                    </div>
                </div>
            </div>

            <div className="browser-view backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden">
                    {/* Print Header - Only visible when printing */}
                    <div className="hidden print:block print-header mb-2 text-center">
                        <h1 className="text-2xl font-bold mb-2">Team Student Meeting Counts</h1>
                        <p className="text-lg">
                            Team Type: {selectedTeamType ? selectedTeamType.charAt(0).toUpperCase() + selectedTeamType.slice(1) : 'N/A'}
                        </p>
                        <p className="text-lg mb-4">
                            Team: {selectedTeam || 'N/A'}
                        </p>
                    </div>

                    {/* Print Button for web view */}
                    <div className="browser-only flex justify-end p-2 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#00f5d0] text-black rounded hover:bg-white/10 hover:text-white transition"
                        >
                            <Printer className="w-5 h-5" />
                            <span>Print Report</span>
                        </button>
                    </div>

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
                    <div className="flex justify-center items-center space-x-2 py-4 print:hidden">
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

            {/* Additional print-specific styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, 
                    .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .browser-only, 
                    .print-hidden {
                        display: none !important;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table, th, td {
                        border: 1px solid #000;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                    }
                    * {
                        color: black !important;
                        print-color-adjust: exact;
                    }
                    select {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default TeamStudentMeetingCountLeaderboard;