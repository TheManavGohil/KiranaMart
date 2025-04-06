"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideUser, LucideStore, LucideArrowLeft, LucideEye, LucideEyeOff } from 'lucide-react';
import Image from 'next/image';
import { isAuthenticated as checkAuth, getUserRole, getUser } from '@/lib/auth';

// Define the variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function AuthPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'role-select' | 'signin' | 'signup'>('role-select');
  const [role, setRole] = useState<'customer' | 'vendor' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };
  
  const handleRoleSelect = (selectedRole: 'customer' | 'vendor') => {
    setRole(selectedRole);
    setCurrentView('signin');
  };
  
  const toggleView = () => {
    setCurrentView(currentView === 'signin' ? 'signup' : 'signin');
    setError('');
  };
  
  const handleBack = () => {
    if (currentView === 'role-select') {
      router.push('/');
    } else {
      setCurrentView('role-select');
      setError('');
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!role) return;
    
    try {
      setLoading(true);
      setError('');
      
      const endpoint = currentView === 'signin' 
        ? '/api/auth/signin' 
        : '/api/auth/signup';
      
      const payload = currentView === 'signin'
        ? { email: formData.email, password: formData.password, role }
        : { name: formData.name, email: formData.email, password: formData.password, role };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      console.log("Authentication successful! Setting token and user...");
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Also set the cookie directly in case the utility function doesn't
      document.cookie = `token=${data.token}; path=/; max-age=${60*60*24*7}`; // 7 days
      
      console.log("Token and user set, redirecting...");
      
      // Redirect based on role
      const redirectPath = role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard';
      console.log(`Redirecting to ${redirectPath}...`);
      
      // Use both router.replace and window.location for reliability
      router.replace(redirectPath);
      // Also use direct window.location as a fallback
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
      
    } catch (error) {
      console.error('Authentication error:', error);
      if (error instanceof Error) {
        const errMsg = error.message;
        if (currentView === 'signup' && errMsg.toLowerCase().includes('exists')) {
          setError('Email already exists. Please sign in.');
          setCurrentView('signin');
        } else {
          setError(errMsg);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('Auth check starting...');
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('Cookie token:', document.cookie.includes('token'));
    const authenticated = checkAuth();
    console.log('Auth status:', authenticated);
    if (authenticated) {
      const userRole = getUserRole();
      console.log('User role:', userRole);
      console.log('User info:', getUser());
      if (userRole === 'vendor') {
        console.log('Redirecting to vendor dashboard...');
        router.replace('/vendor/dashboard');
      } else if (userRole === 'customer') {
        console.log('Redirecting to customer dashboard...');
        router.replace('/customer/dashboard');
      } else {
        console.log('Redirecting to home...');
        router.replace('/');
      }
    } else {
      console.log('Not authenticated, showing auth form');
      setIsAuthChecked(true);
    }
  }, [router]);
  
  if (!isAuthChecked) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Kirana Store
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your neighborhood grocery store
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <LucideArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <AnimatePresence mode="wait">
            {currentView === 'role-select' && (
              <motion.div
                key="role-select"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
                  Continue as
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    variants={itemVariants}
                    onClick={() => handleRoleSelect('customer')}
                    className="flex flex-col items-center justify-center p-6 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <LucideUser className="h-12 w-12 text-indigo-600 mb-2" />
                    <span className="font-medium text-gray-900">Customer</span>
                  </motion.button>
                  
                  <motion.button
                    variants={itemVariants}
                    onClick={() => handleRoleSelect('vendor')}
                    className="flex flex-col items-center justify-center p-6 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <LucideStore className="h-12 w-12 text-indigo-600 mb-2" />
                    <span className="font-medium text-gray-900">Vendor</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {(currentView === 'signin' || currentView === 'signup') && role && (
              <motion.form
                key={currentView}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
              >
                <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
                  {currentView === 'signin' ? 'Sign in' : 'Sign up'} as {role === 'vendor' ? 'Vendor' : 'Customer'}
                </h2>
                
                {error && (
                  <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {currentView === 'signup' && (
                  <motion.div variants={itemVariants} className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </motion.div>
                )}
                
                <motion.div variants={itemVariants} className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <LucideEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <LucideEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : currentView === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                </motion.div>
                
                <motion.div variants={itemVariants} className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={toggleView}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {currentView === 'signin'
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 