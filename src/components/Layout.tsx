import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { mobile } = useResponsive();

  return (
    <div className="min-h-screen bg-black text-white">
      {!mobile && <Sidebar isMobile={mobile} />}
      <main className={`${mobile ? '' : 'ml-64'}`}>
        {children}
      </main>
      {mobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
