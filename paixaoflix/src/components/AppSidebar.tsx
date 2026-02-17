import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Film, 
  Tv, 
  Radio, 
  Baby, 
  Heart,
  Menu,
  X
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Início', id: 'home' },
    { icon: Film, label: 'Cinema', id: 'cinema' },
    { icon: Tv, label: 'Séries', id: 'series' },
    { icon: Radio, label: 'Ao Vivo', id: 'live' },
    { icon: Baby, label: 'Kids', id: 'kids' },
    { icon: Heart, label: 'Minha Lista', id: 'favorites' },
  ];

  const handleMenuItemClick = (itemId: string) => {
    // Handle navigation
    console.log(`Navigating to: ${itemId}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-black z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-64`}
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-white text-xl font-bold">PaixãoFlix</h1>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-gray-500 text-sm">
            <p>© 2025 PaixãoFlix</p>
            <p className="text-xs mt-1">Streaming Personalizado</p>
          </div>
        </div>
      </motion.aside>

      {/* Hover Trigger for Desktop */}
      <div
        className="hidden md:block fixed top-0 left-0 w-2 h-full z-30"
        onMouseEnter={() => setIsOpen(true)}
      />
    </>
  );
};

export default AppSidebar;
