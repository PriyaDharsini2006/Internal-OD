import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MeetingCountLeaderboard = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        const fetchMeetingUsers = async () => {
            try {
                const response = await fetch('/api/staybackcnt');
                if (!response.ok) {
                    throw new Error('Failed to fetch stayback users');
                }
                const data = await response.json();
                setUsers(data);
                console.log('Fetched users:', data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message || 'An unknown error occurred');
                setIsLoading(false);
            }
        };

        fetchMeetingUsers();
    }, []);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (isLoading) {
        return (
            <div className="print-container container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="browser-view backdrop-blur-xl rounded-2xl border border-white/10">
                    <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden p-6">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">
                            Meeting Count Leaderboard
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
                            Stayback Count Leaderboard
                        </h2>
                        <p className="text-center text-red-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="print-container container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row  text-center">
                <img
                    className="w-36 h-36 rounded object-contain"
                    src="/logo1.png"
                    alt="Company Logo"
                />
                <p className='font-grotesk text-3xl mt-[50px] ml-[350px] justify-center text-[#00f5d0]'>Stayback Counts</p>
            </div>
            <div className="browser-view backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="bg-white/5 shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                                        Register
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                                        Section
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                                        Year
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                        Staybacks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentUsers.map((user, index) => (
                                    <tr key={user.email} className="hover:bg-gray-800/50 transition duration-200">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white hidden md:table-cell">
                                            {user.register}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white hidden md:table-cell">
                                            {user.section}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white hidden md:table-cell">
                                            {user.year}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-white">
                                            {user.stayback_cnt}
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

export default MeetingCountLeaderboard;