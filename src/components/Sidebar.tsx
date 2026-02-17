import React from 'react';
import { Home, Tv, Search, User } from 'lucide-react';

interface SidebarProps {
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile }) => {
  if (isMobile) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-6 hidden md:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-red-600">PaixãoFlix</h1>
      </div>
      
      <nav className="space-y-4">
        <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-red-600 text-white transition-colors">
          <Home className="w-5 h-5" />
          <span>Início</span>
        </button>
        
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
          <Tv className="w-5 h-5" />
          <span>Séries</span>
        </button>
        
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
          <Search className="w-5 h-5" />
          <span>Buscar</span>
        </button>
        
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
