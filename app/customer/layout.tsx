'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUserRole, getUser } from '@/lib/auth';
import { LucideHome, LucideShoppingCart, LucideUser, LucideLogOut } from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const userRole = getUserRole();

      if (!authenticated || userRole !== 'customer') {
        router.replace('/auth');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.replace('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const user = getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/customer" className="text-xl font-bold text-green-600">
              KiranaStore
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/customer"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  pathname === '/customer'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LucideHome className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                href="/customer/cart"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  pathname === '/customer/cart'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LucideShoppingCart className="w-5 h-5" />
                <span>Cart</span>
              </Link>

              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50">
                  <LucideUser className="w-5 h-5" />
                  <span>{user?.name || 'Account'}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link
                    href="/customer/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/customer/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <LucideLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 