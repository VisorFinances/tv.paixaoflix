import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = <Search className="w-16 h-16 text-gray-400" />
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-md">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
