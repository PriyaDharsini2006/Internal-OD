'use client'
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
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



const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState('dashboard');

  // Add useEffect for authentication check
  useEffect(() => {
    // If not authenticated, redirect to sign in
    if (status === 'unauthenticated') {
      signIn();
    }
    // If authenticated but not HOD, redirect to unauthorized page
    else if (status === 'authenticated' && session?.user?.role !== 'HOD') {
      router.push('/unauthorized');
    }
  }, [status, session, router]);

  // If not authenticated or not HOD, show loading or nothing
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'HOD') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const renderComponent = () => {
    switch(activeComponent) {
      case 'dashboard':
        return <ApproveRequest />;
      case 'pending':
        return <PendingRequestsTable />;
      case 'approved':
        return <Approved />;
      case 'rejected':
        return <RejectedRequestsTable />;
      default:
        return <ApproveRequest />;
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

export default Dashboard;