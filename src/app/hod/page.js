'use client'
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import ApproveRequest from '@/components/ApproveRequest';
import Approved from '@/components/requests/Approved';
import RejectedRequestsTable from '@/components/requests/RejectedRequestsTable';
import PendingRequestsTable from '@/components/requests/PendingRequestsTable';
import { 
  Clock,
  CheckCircle, 
  XCircle, 
  CalendarDays, 
  User, 
  FileText,
  CheckSquare 
} from 'lucide-react';

// Existing RequestStatusBadge component remains the same
const RequestStatusBadge = ({ status }) => {
  const badges = {
    0: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
    1: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Approved' },
    '-1': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' }
  };

  const badge = badges[status];
  const Icon = badge.icon;

  return (
    <span className={`px-3 py-1 text-sm rounded-full ${badge.bg} ${badge.text} flex items-center gap-1`}>
      <Icon className="w-4 h-4" />
      {badge.label}
    </span>
  );
};

// Navigation Component
const Navbar = ({ onNavItemClick, activeComponent }) => {
  const navItems = [
    { 
      name: 'Dashboard', 
      icon: CalendarDays, 
      component: 'dashboard' 
    },
    { 
      name: 'Pending Requests', 
      icon: Clock, 
      component: 'pending' 
    },
    { 
      name: 'Approved Requests', 
      icon: CheckCircle, 
      component: 'approved' 
    },
    { 
      name: 'Rejected Requests', 
      icon: XCircle, 
      component: 'rejected' 
    }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex space-x-4">
          {navItems.map((item) => (
            <button
              key={item.component}
              onClick={() => onNavItemClick(item.component)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                activeComponent === item.component 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <button 
          onClick={() => signOut()} 
          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

// Main Dashboard Component with Navigation
const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderComponent = () => {
    switch(activeComponent) {
      case 'dashboard':
        return <DashboardTable />;
      case 'pending':
        return <PendingRequestsTable />;
      case 'approved':
        return <Approved />;
      case 'rejected':
        return <RejectedRequestsTable />;
      default:
        return <DashboardTable />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onNavItemClick={setActiveComponent} 
        activeComponent={activeComponent} 
      />
      <div className="pt-20">
        {renderComponent()}
      </div>
    </div>
  );
};

// Existing DashboardTable component remains the same (from your original code)
const DashboardTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      fetchRequests(); // Refresh the table
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAttendanceUpdate = async (requestId, currentAttendance) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendance: !currentAttendance,
        }),
      });

      if (!response.ok) throw new Error('Failed to update attendance');
      fetchRequests(); // Refresh the table
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 text-center p-4">
      Error: {error}
    </div>
  );

  return (
    <>
    <ApproveRequest/>
    </>
  );
};

export default Dashboard;