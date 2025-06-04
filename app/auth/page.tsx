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
      const redirectPath = role === 'vendor' ? '/vendor/dashboard' : '/customer';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Kirana Store
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your neighborhood grocery store
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
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
                <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Continue as
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    variants={itemVariants}
                    onClick={() => handleRoleSelect('customer')}
                    className="flex flex-col items-center justify-center p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <LucideUser className="h-12 w-12 text-green-600 dark:text-green-400 mb-2" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Customer</span>
                  </motion.button>
                  
                  <motion.button
                    variants={itemVariants}
                    onClick={() => handleRoleSelect('vendor')}
                    className="flex flex-col items-center justify-center p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <LucideStore className="h-12 w-12 text-green-600 dark:text-green-400 mb-2" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Vendor</span>
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
                <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {currentView === 'signin' ? 'Sign in' : 'Sign up'} as {role === 'vendor' ? 'Vendor' : 'Customer'}
                </h2>
                
                {error && (
                  <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                    {error}
                  </div>
                )}
                
                {currentView === 'signup' && (
                  <motion.div variants={itemVariants} className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </motion.div>
                )}
                
                <motion.div variants={itemVariants} className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={currentView === 'signin' ? "current-password" : "new-password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                    >
                      {showPassword ? (
                        <LucideEyeOff className="h-5 w-5" />
                      ) : (
                        <LucideEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={toggleView}
                      className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                    >
                      {currentView === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      currentView === 'signin' ? 'Sign in' : 'Sign up'
                    )}
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