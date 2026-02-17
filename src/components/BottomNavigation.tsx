import React from 'react';
import { Home, Tv, Search, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 md:hidden">
      <div className="flex justify-around py-2">
        <button className="flex flex-col items-center p-2 text-red-600">
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Início</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400">
          <Tv className="w-6 h-6" />
          <span className="text-xs mt-1">Séries</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400">
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Buscar</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400">
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
