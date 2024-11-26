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
  AlertCircle,
  Menu,
  X,
  Copyright 
} from 'lucide-react';

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Format today's date
  const today = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const handleBack = () => {
    // Directly navigate to the external dashboard URL
    window.location.href = 'https://dashboard-vs8l.vercel.app/Navbar';
  };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-gray-300">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-black backdrop-blur-xl border-b border-white/10 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-28">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                className="w-32 h-28 rounded object-contain" 
                src="/logo1.png" 
                alt="Company Logo" 
              />
            </div>

            {/* Date - Hidden on mobile */}
            <div className="hidden md:block text-center">
              <p className="text-lg font-medium text-gray-300 font-grotesk">
                {formattedDate}
              </p>
            </div>
            <button 
            variant="outline" 
            onClick={handleBack} 
            className="px-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          
          >
            Back to Dashboard
          </button>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              {!session ? (
                <button 
                  onClick={handleSignInClick}
                  className="flex items-center gap-2 bg-[#00f5d0] text-black px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-300 font-grotesk group"
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
                      className="w-10 h-10 rounded-full border-2 border-[#00f5d0]/20 object-cover"
                    />
                  ) : (
                    <User 
                      className="text-[#00f5d0] w-10 h-10" 
                      strokeWidth={1.5} 
                    />
                  )}
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition-all duration-300 group"
                  >
                    <LogOut 
                      className="w-5 h-5 group-hover:-rotate-12 transition-transform" 
                      strokeWidth={2} 
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-[#00f5d0] hover:opacity-80 p-2"
              >
                {isMobileMenuOpen ? 
                  <X className="w-6 h-6" /> : 
                  <Menu className="w-6 h-6" />
                }
              </button>
            </div>
          </div>

          {/* Date - Visible on mobile */}
          <div className="md:hidden text-center py-2 border-t border-white/10">
            <p className="text-sm font-medium text-gray-300 font-grotesk">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="container mx-auto p-4">
                {!session ? (
                  <button 
                    onClick={handleSignInClick}
                    className="w-full flex items-center justify-center gap-2 bg-[#00f5d0] text-black px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-300 font-grotesk group"
                  >
                    <LogIn 
                      className="w-5 h-5 group-hover:rotate-12 transition-transform" 
                      strokeWidth={2} 
                    />
                    Login
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      {session.user.image ? (
                        <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full border-2 border-[#00f5d0]/20 object-cover"
                        />
                      ) : (
                        <User 
                          className="text-[#00f5d0] w-12 h-12" 
                          strokeWidth={1.5} 
                        />
                      )}
                    </div>
                    <button 
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition-all duration-300 group"
                    >
                      <LogOut 
                        className="w-5 h-5 group-hover:-rotate-12 transition-transform" 
                        strokeWidth={2} 
                      />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-32 pb-16 flex-grow">
        <HomeTable />
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsLoginModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center space-y-4">
                <AlertCircle 
                  className="text-[#00f5d0] w-12 md:w-16 h-12 md:h-16" 
                  strokeWidth={1.5} 
                />
                <h2 className="text-xl md:text-2xl font-bold text-gray-200 text-center font-grotesk">
                  Sign In
                </h2>
                <p className="text-sm md:text-base text-gray-400 text-center">
                  Please sign in to access additional features
                </p>
              </div>
              
              <button 
                onClick={() => signIn("google")}
                className="w-full flex items-center justify-center gap-2 bg-[#00f5d0] text-black py-3 rounded-xl hover:opacity-90 transition-all duration-300 font-grotesk group"
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