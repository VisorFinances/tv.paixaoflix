import * as React from 'react';
import { Home, Search, Tv, Film, Heart, List } from 'lucide-react';

interface MenuCardsProps {
  onNavigate: (view: string) => void;
}

const MenuCards: React.FC<MenuCardsProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'cinema',
      title: 'Cinema',
      icon: <Film className="w-8 h-8" />,
      color: 'from-red-500 to-orange-500',
      onClick: () => onNavigate('cinema'),
    },
    {
      id: 'series',
      title: 'Séries',
      icon: <Tv className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-500',
      onClick: () => onNavigate('series'),
    },
    {
      id: 'kids',
      title: 'Kids',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-pink-500 to-rose-500',
      onClick: () => onNavigate('kids'),
    },
    {
      id: 'live',
      title: 'TV ao Vivo',
      icon: <Tv className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      onClick: () => onNavigate('live'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={card.onClick}
          className={`group relative overflow-hidden rounded-lg p-6 transition-all duration-300 hover:scale-105 ${
            card.color.includes('red') ? 'hover:shadow-red-500/25' :
            card.color.includes('blue') ? 'hover:shadow-blue-500/25' :
            card.color.includes('pink') ? 'hover:shadow-pink-500/25' :
            'hover:shadow-green-500/25'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90`} />
          <div className="relative z-10">
            {card.icon}
            <h3 className="text-white font-bold text-lg">{card.title}</h3>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MenuCards;
