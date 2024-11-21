'use client';
import { useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LogIn, 
  LogOut, 
  User, 
  AlertCircle 
} from 'lucide-react';

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session.user.role;
      if (userRole === "TeamLead") {
        router.push("/teamlead");
      } else if (userRole === "HOD") {
        router.push("/hod");
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity, 
            duration: 1, 
            ease: "linear" 
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6"
        >
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle 
              className="text-yellow-500 w-16 h-16" 
              strokeWidth={1.5} 
            />
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Access Restricted
            </h2>
            <p className="text-gray-600 text-center">
              Please sign in to access the dashboard
            </p>
          </div>
          
          <button 
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 group"
          >
            <LogIn 
              className="w-5 h-5 group-hover:rotate-12 transition-transform" 
              strokeWidth={2} 
            />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6"
      >
        <div className="flex flex-col items-center space-y-4">
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover"
            />
          ) : (
            <User 
              className="text-blue-500 w-24 h-24" 
              strokeWidth={1.5} 
            />
          )}
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {session.user.name}
            </h2>
            <p className="text-gray-600 mt-2">
              {session.user.email}
            </p>
            {session.user.role && (
              <div className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full inline-block text-sm">
                {session.user.role}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 group"
          >
            <LogOut 
              className="w-5 h-5 group-hover:-rotate-12 transition-transform" 
              strokeWidth={2} 
            />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}