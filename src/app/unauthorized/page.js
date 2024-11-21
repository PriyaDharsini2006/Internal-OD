'use client'
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="mb-6">
          {session?.user 
            ? "You do not have permission to view this page." 
            : "Please sign in to access this page."}
        </p>
        <Link 
          href="/" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}