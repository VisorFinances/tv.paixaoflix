// Componente de Status de Conexão e Atualização
import React, { useState, useEffect } from 'react';
import { useDataManager } from '../hooks/useDataManager';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { lastUpdate, isDataFresh, refreshData, isLoading } = useDataManager();
  const [timeUntilUpdate, setTimeUntilUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdate;
      const updateInterval = 21 * 60 * 1000; // 21 minutos
      const remaining = Math.max(0, updateInterval - timeSinceLastUpdate);
      
      setTimeUntilUpdate(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatLastUpdate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (): string => {
    if (isLoading) return 'text-yellow-500';
    if (isDataFresh) return 'text-green-500';
    return 'text-orange-500';
  };

  const getStatusText = (): string => {
    if (isLoading) return 'Atualizando...';
    if (isDataFresh) return 'Dados atualizados';
    return 'Dados desatualizados';
  };

  const getStatusIcon = (): string => {
    if (isLoading) return '🔄';
    if (isDataFresh) return '✅';
    return '⚠️';
  };

  return (
    <div className={`connection-status ${className}`}>
      <div className="flex items-center space-x-2 text-sm">
        <span className={getStatusColor()}>
          {getStatusIcon()} {getStatusText()}
        </span>
        
        <span className="text-gray-400">•</span>
        
        <span className="text-gray-300">
          Última atualização: {formatLastUpdate(lastUpdate)}
        </span>
        
        <span className="text-gray-400">•</span>
        
        <span className="text-gray-300">
          Próxima atualização em: {formatTime(timeUntilUpdate)}
        </span>
        
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Atualizando...' : 'Atualizar Agora'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
