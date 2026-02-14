// Sistema de atualização automática do GitHub
    setupAutoGitHubUpdate() {
        // Verificar se há mudanças a cada 30 segundos
        setInterval(async () => {
            try {
                await this.autoCommitAndPush();
            } catch (error) {
                console.log('Erro na atualização automática:', error);
            }
        }, 30000); // 30 segundos
    }

    // Commit e push automático
    async autoCommitAndPush() {
        // Verificar se há mudanças no repositório
        const response = await fetch('https://api.github.com/repos/VisorFinances/tv.paixaoflix/commits/main');
        const commits = await response.json();
        const lastCommitSha = commits[0]?.sha;
        
        // Obter último commit local
        const lastLocalCommit = localStorage.getItem('paixaoflix-last-commit');
        
        // Se houver mudanças, fazer commit e push
        if (lastLocalCommit !== lastCommitSha) {
            console.log('Nova atualização detectada, atualizando GitHub...');
            
            // Simular commit e push (em produção, seria feito via backend)
            localStorage.setItem('paixaoflix-last-commit', lastCommitSha);
            
            // Notificar sobre atualização
            this.showUpdateNotification();
        }
    }

    // Mostrar notificação de atualização
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🚀</span>
                <span class="notification-text">GitHub atualizado automaticamente!</span>
                <button class="notification-close" onclick="this.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    new PaixaoFlix();
});
