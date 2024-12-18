'use client';
import React, { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import RequestForm from "@/components/RequestForm";
import Approved from '@/components/requests/Approved';
import ApprovedRequestsTable from "@/components/requests/ApprovedRequestsTable";
import PendingRequestsTable from "@/components/requests/PendingRequestsTable";
import RejectedRequestsTable from "@/components/requests/RejectedRequestsTable";
import MeetingUpdateComponent from '@/components/MeetingReq';
import StaybackRequest from '@/components/StaybackReq';
import {
  Clock,
  CheckCircle,
  CheckSquare,
  XCircle,
  PlusCircle,
  Menu,
  X,
  ArrowUp,
  Home
} from 'lucide-react';

const TeamLeadNavbar = ({ onNavItemClick, activeComponent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Create Request', icon: PlusCircle, component: 'request-form' },
    { name: 'Pending Requests', icon: Clock, component: 'pending' },
    { name: 'Attendance', icon: CheckSquare, component: 'approved' },
    { name: 'Approved Requests', icon: CheckCircle, component: 'approved-request' },
    { name: 'Rejected Requests', icon: XCircle, component: 'rejected' },
    { name: 'Meeting', icon: ArrowUp, component: 'Meeting' },
    { name: 'Stayback', icon: Home, component: 'Stayback' },
  ];
  const handleBack = () => {
    window.location.href = 'https://dashboard-vs8l.vercel.app/Navbar';
  };

  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
                <span className="whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
          >
            Sign Out
          </button>
          <button 
            variant="outline" 
            onClick={handleBack} 
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          
          >
            Back to Dashboard
          </button>
          
        </div>

        <div className="md:hidden flex justify-between items-center w-full">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-300 hover:text-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <button
            onClick={() => signOut()}
            className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm"
          >
            Sign Out
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black top-16 z-30 md:hidden overflow-y-auto">
            <div className="flex flex-col space-y-4 p-4">
              {navItems.map((item) => (
                <button
                  key={item.component}
                  onClick={() => handleNavItemClick(item.component)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl ${
                    activeComponent === item.component
                      ? 'bg-[#00f5d0] text-black'
                      : 'hover:bg-white/10 text-gray-300'
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

export default function TeamLeadPage() {
  const { data: session } = useSession();
  const [activeComponent, setActiveComponent] = useState('request-form');

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00f5d0]"></div>
      </div>
    );
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case 'request-form':
        return <RequestForm />;
      case 'pending':
        return <PendingRequestsTable />;
      case 'approved':
        return <ApprovedRequestsTable />;
      case 'approved-request':
        return <Approved />;
      case 'rejected':
        return <RejectedRequestsTable />;
      case 'Meeting':
        return <MeetingUpdateComponent />;
      case 'Stayback':
        return <StaybackRequest />;
      default:
        return <RequestForm />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300">
      <TeamLeadNavbar
        onNavItemClick={setActiveComponent}
        activeComponent={activeComponent}
      />
      <div className="pt-16 md:pt-20 px-4 md:px-6 lg:px-8">
        {renderComponent()}
      </div>
    </div>
  );
}
