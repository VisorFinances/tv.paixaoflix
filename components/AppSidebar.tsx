import * as React from 'react';
import { Home, Search, Tv, Film, Heart, List } from 'lucide-react';

interface AppSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'cinema', label: 'Cinema', icon: Film },
    { id: 'series', label: 'Séries', icon: Tv },
    { id: 'kids', label: 'Kids', icon: Heart },
    { id: 'live', label: 'TV ao Vivo', icon: Tv },
    { id: 'mylist', label: 'Minha Lista', icon: List },
    { id: 'search', label: 'Buscar', icon: Search },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-sidebar-background border-r border-sidebar-border z-40 transition-all duration-300">
      <div className="p-4">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mb-8">
          <span className="text-sidebar-primary-foreground font-bold">P</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeView === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AppSidebar;
