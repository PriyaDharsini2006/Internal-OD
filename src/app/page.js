'use client';
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import HomeTable from "@/components/Home";
import { 
  LogIn, 
  LogOut,
  User,
  AlertCircle 
} from 'lucide-react';

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Redirect based on user role
      if (session.user.role === "HOD") {
        router.push("/hod");
      } else if (session.user.role === "TeamLead") {
        router.push("/teamlead");
      }
    }
  }, [session, router]);

  const handleSignInClick = () => {
    setIsLoginModalOpen(true);
    signIn("google");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navigation with Login Button */}
      <nav className="absolute top-0 right-0 p-4 z-10">
        {!session ? (
          <button 
            onClick={handleSignInClick}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 group"
          >
            <LogIn 
              className="w-5 h-5 group-hover:rotate-12 transition-transform" 
              strokeWidth={2} 
            />
            Login
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover"
              />
            ) : (
              <User 
                className="text-blue-500 w-10 h-10" 
                strokeWidth={1.5} 
              />
            )}
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 group"
            >
              <LogOut 
                className="w-5 h-5 group-hover:-rotate-12 transition-transform" 
                strokeWidth={2} 
              />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content - Approved Requests Table */}
      <div className="container mx-auto px-4 py-16">
        <HomeTable />
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setIsLoginModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center space-y-4">
                <AlertCircle 
                  className="text-yellow-500 w-16 h-16" 
                  strokeWidth={1.5} 
                />
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                  Sign In
                </h2>
                <p className="text-gray-600 text-center">
                  Please sign in to access additional features
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}