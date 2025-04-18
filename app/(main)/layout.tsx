import React from 'react';
import MainNavbar from '@/components/MainNavbar';

// You might want to import the Footer here as well if you remove it from the root layout,
// or keep the Footer in the root layout to apply everywhere.
// import Footer from '@/components/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="main-layout">
      <MainNavbar />
      {/* The Footer could potentially go here if not in root layout */}
      {children}
      {/* <Footer /> */}
    </div>
  );
} 