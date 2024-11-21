"use client";
import React, { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import RequestForm from "@/components/RequestForm";
import Approved from '@/components/requests/Approved';
import ApprovedRequestsTable from "@/components/requests/ApprovedRequestsTable";
import PendingRequestsTable from "@/components/requests/PendingRequestsTable";
import RejectedRequestsTable from "@/components/requests/RejectedRequestsTable";
import { 
  Clock, 
  CheckCircle, 
  CheckSquare,
  XCircle, 
  PlusCircle 
} from 'lucide-react';

// Navbar Component
const TeamLeadNavbar = ({ onNavItemClick, activeComponent }) => {
  const navItems = [
    { 
      name: 'Create Request', 
      icon: PlusCircle, 
      component: 'request-form' 
    },
    { 
      name: 'Pending Requests', 
      icon: Clock, 
      component: 'pending' 
    },
    { 
      name: 'Attendance', 
      icon: CheckSquare, 
      component: 'approved' 
    },
    { 
      name: 'Approved Requests', 
      icon: CheckCircle, 
      component: 'approved-request' 
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

// Main Page Component
export default function TeamLeadPage() {
  const { data: session } = useSession();
  const [activeComponent, setActiveComponent] = useState('request-form');

  if (!session) {
    return <div>Loading...</div>;
  }

  const renderComponent = () => {
    switch(activeComponent) {
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
      default:
        return <RequestForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TeamLeadNavbar 
        onNavItemClick={setActiveComponent} 
        activeComponent={activeComponent} 
      />
      <div className="pt-20">
        {renderComponent()}
      </div>
    </div>
  );
}