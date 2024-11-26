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
  Menu,
  X,
  Copyright
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

// Responsive Navbar Component
const Navbar = ({ onNavItemClick, activeComponent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const handleBack = () => {
    // Directly navigate to the external dashboard URL
    window.location.href = 'https://dashboard-vs8l.vercel.app/Navbar';
  };

  const handleNavItemClick = (component) => {
    onNavItemClick(component);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-gray-300 z-20 border-b border-white/10">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="hidden md:flex space-x-4 w-full justify-between items-center">
        <div className="flex space-x-4 overflow-x-auto">
            
                {navItems.map((item) => (
              <button
                key={item.component}
                onClick={() => onNavItemClick(item.component)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-xl ${
                  activeComponent === item.component
                    ? 'bg-[#00f5d0] text-black'
                    : 'hover:bg-white/10 text-gray-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <button 
            variant="outline" 
            onClick={handleBack} 
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          
          >
            Back to Dashboard
          </button>

          <button 
            onClick={() => signOut()} 
            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center w-full">
          <button 
            onClick={toggleMobileMenu} 
            className="text-gray-700 hover:text-gray-900"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <button 
            variant="outline" 
            onClick={handleBack} 
            className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            Back
          </button>
          <button 
            onClick={() => signOut()} 
            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
          >
            Sign Out
          </button>
        
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white top-16 z-30 md:hidden">
            <div className="flex flex-col space-y-4 p-4">
              {navItems.map((item) => (
                <button
                  key={item.component}
                  onClick={() => handleNavItemClick(item.component)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md text-left ${
                    activeComponent === item.component 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState('dashboard');

  // Authentication and role check
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    }
    else if (status === 'authenticated' && session?.user?.role !== 'HOD') {
      router.push('/unauthorized');
    }
  }, [status, session, router]);

  // Loading state
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
    <div className="min-h-screen bg-black text-gray-300">
      <Navbar 
        onNavItemClick={setActiveComponent} 
        activeComponent={activeComponent} 
      />
      <div className="pt-16 md:pt-20 px-4 md:px-6 lg:px-8">
        {renderComponent()}
      </div>
      
    </div>
  );
};

export default Dashboard;