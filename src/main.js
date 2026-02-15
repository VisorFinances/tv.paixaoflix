// Arquivo principal de inicialização do sistema de dados
import DataManager from './data/DataManager.ts';
import './ui-premium.js';

// Inicializar o sistema de dados quando o módulo for carregado
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando sistema de dados PaixãoFlix...');
  
  // Inicializar o DataManager
  const dataManager = DataManager.getInstance();
  
  // Adicionar listener para atualizações
  window.addEventListener('dataUpdated', (event) => {
    console.log('📦 Dados atualizados:', event.detail);
    
    // Atualizar interface com novos dados
    updateUIWithData(event.detail.data);
  });
  
  // Função para atualizar a interface
  function updateUIWithData(data) {
    // Atualizar contadores na interface
    updateCounters(data);
    
    // Atualizar status de conexão
    updateConnectionStatus(data);
    
    // Disparar eventos para componentes React (se existirem)
    if (window.React) {
      window.dispatchEvent(new CustomEvent('reactDataUpdate', {
        detail: data
      }));
    }
  }
  
  function updateCounters(data) {
    // Atualizar contadores de filmes, séries, canais
    const cinemaCount = document.getElementById('cinema-count');
    const seriesCount = document.getElementById('series-count');
    const canaisCount = document.getElementById('canais-count');
    const favoritosCount = document.getElementById('favoritos-count');
    
    if (cinemaCount) cinemaCount.textContent = data.cinema?.length || 0;
    if (seriesCount) seriesCount.textContent = data.series?.length || 0;
    if (canaisCount) canaisCount.textContent = data.canaisAoVivo?.length || 0;
    if (favoritosCount) favoritosCount.textContent = data.favoritos?.length || 0;
  }
  
  function updateConnectionStatus(data) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      const lastUpdate = new Date(data.timestamp);
      const timeAgo = getTimeAgo(lastUpdate);
      
      statusElement.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="status-indicator ${data.timestamp > Date.now() - 21 * 60 * 1000 ? 'online' : 'offline'}"></span>
          <span class="status-text">
            ${data.timestamp > Date.now() - 21 * 60 * 1000 ? 'Online' : 'Offline'}
          </span>
          <span class="update-time">Atualizado há ${timeAgo}</span>
        </div>
      `;
    }
  }
  
  function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    
    if (seconds < 60) return 'poucos segundos';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas`;
    return `${Math.floor(seconds / 86400)} dias`;
  }
  
  // Expor DataManager globalmente para uso em outros scripts
  window.PaixaoFlixDataManager = dataManager;
  
  console.log('✅ Sistema de dados PaixãoFlix inicializado com sucesso!');
});

// Exportar para uso em módulos
export default DataManager;
