import React from 'react';
import { PendingRequestsTable } from '../../components/requests/PendingRequestsTable';
import { ApprovedRequestsTable } from '../../components/requests/ApprovedRequestsTable';
import RejectedRequestsTable from '../../components/requests/RejectedRequestsTable';



export default function PendingRequestsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OD Requests</h1>
      <PendingRequestsTable/>
    </div>
  );
}