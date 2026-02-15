// Sistema de Player Completo para PaixãoFlix
class PaixaoFlixPlayer {
  constructor() {
    this.currentVideo = null;
    this.playerElement = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.isMuted = false;
    this.isFullscreen = false;
    this.subtitleTrack = null;
    this.audioTrack = null;
    this.videoId = null;
    this.progressInterval = null;
  }

  // Inicializar player
  initPlayer(videoUrl, videoId = null) {
    this.videoId = videoId;
    this.currentVideo = videoUrl;
    
    // Criar modal do player
    this.createPlayerModal();
    
    // Carregar vídeo
    this.loadVideo(videoUrl);
    
    // Iniciar monitoramento de progresso
    this.startProgressMonitoring();
  }

  // Criar modal do player
  createPlayerModal() {
    // Remover player existente
    this.closePlayer();

    const modal = document.createElement('div');
    modal.className = 'player-modal';
    modal.id = 'paixaoflix-player';
    
    modal.innerHTML = `
      <button class="player-close" onclick="window.paixaoFlixPlayer.closePlayer()">✕</button>
      <div class="player-container">
        <video id="main-video" controls>
          <source src="${this.currentVideo}" type="video/mp4">
          Seu navegador não suporta o vídeo.
        </video>
      </div>
    `;

    document.body.appendChild(modal);
    this.playerElement = document.getElementById('main-video');
    
    // Configurar eventos do vídeo
    this.setupVideoEvents();
  }

  // Carregar vídeo
  loadVideo(url) {
    if (this.playerElement) {
      this.playerElement.src = url;
      this.playerElement.load();
      this.playerElement.play().then(() => {
        this.isPlaying = true;
      }).catch(error => {
        console.error('Erro ao reproduzir vídeo:', error);
      });
    }
  }

  // Configurar eventos do vídeo
  setupVideoEvents() {
    if (!this.playerElement) return;

    this.playerElement.addEventListener('loadedmetadata', () => {
      this.duration = this.playerElement.duration;
    });

    this.playerElement.addEventListener('timeupdate', () => {
      this.currentTime = this.playerElement.currentTime;
    });

    this.playerElement.addEventListener('play', () => {
      this.isPlaying = true;
    });

    this.playerElement.addEventListener('pause', () => {
      this.isPlaying = false;
    });

    this.playerElement.addEventListener('volumechange', () => {
      this.volume = this.playerElement.volume;
      this.isMuted = this.playerElement.muted;
    });

    this.playerElement.addEventListener('ended', () => {
      this.onVideoEnded();
    });

    // Eventos de teclado
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
  }

  // Manipular eventos de teclado
  handleKeyboard(e) {
    if (!this.playerElement) return;

    switch(e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.seek(10);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.seek(-10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.changeVolume(0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.changeVolume(-0.1);
        break;
      case 'f':
        e.preventDefault();
        this.toggleFullscreen();
        break;
      case 'm':
        e.preventDefault();
        this.toggleMute();
        break;
      case 'c':
        e.preventDefault();
        this.toggleSubtitles();
        break;
      case 'Escape':
        e.preventDefault();
        this.closePlayer();
        break;
    }
  }

  // Controlar reprodução
  togglePlay() {
    if (this.isPlaying) {
      this.playerElement.pause();
    } else {
      this.playerElement.play();
    }
  }

  // Avançar/retroceder
  seek(seconds) {
    if (this.playerElement) {
      this.playerElement.currentTime = Math.max(0, Math.min(this.duration, this.currentTime + seconds));
    }
  }

  // Mudar volume
  changeVolume(delta) {
    if (this.playerElement) {
      this.playerElement.volume = Math.max(0, Math.min(1, this.volume + delta));
    }
  }

  // Mutar/desmutar
  toggleMute() {
    if (this.playerElement) {
      this.playerElement.muted = !this.playerElement.muted;
    }
  }

  // Toggle legendas
  toggleSubtitles() {
    if (this.playerElement && this.playerElement.textTracks.length > 0) {
      const track = this.playerElement.textTracks[0];
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
    }
  }

  // Toggle tela cheia
  toggleFullscreen() {
    const modal = document.getElementById('paixaoflix-player');
    if (!modal) return;

    if (!document.fullscreenElement) {
      modal.requestFullscreen().then(() => {
        this.isFullscreen = true;
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
      });
    }
  }

  // Iniciar monitoramento de progresso
  startProgressMonitoring() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.progressInterval = setInterval(() => {
      if (this.videoId && this.currentTime > 0 && this.duration > 0) {
        // Salvar progresso usando a função global
        if (window.PaixaoFlix && window.PaixaoFlix.salvarProgresso) {
          window.PaixaoFlix.salvarProgresso(this.videoId, this.currentTime, this.duration);
        }
      }
    }, 5000); // Salvar a cada 5 segundos
  }

  // Quando o vídeo termina
  onVideoEnded() {
    if (this.videoId) {
      // Marcar como 100% assistido
      if (window.PaixaoFlix && window.PaixaoFlix.salvarProgresso) {
        window.PaixaoFlix.salvarProgresso(this.videoId, this.duration, this.duration);
      }
    }

    // Fechar player após 3 segundos
    setTimeout(() => {
      this.closePlayer();
    }, 3000);
  }

  // Fechar player
  closePlayer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    const modal = document.getElementById('paixaoflix-player');
    if (modal) {
      modal.remove();
    }

    this.playerElement = null;
    this.currentVideo = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.videoId = null;

    // Remover listener de teclado
    document.removeEventListener('keydown', this.handleKeyboard);
  }

  // Picture-in-Picture
  async togglePiP() {
    if (!this.playerElement) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await this.playerElement.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Erro ao toggle PiP:', error);
    }
  }

  // Trocar legenda
  changeSubtitle(language) {
    if (!this.playerElement) return;

    // Desativar todas as legendas
    Array.from(this.playerElement.textTracks).forEach(track => {
      track.mode = 'hidden';
    });

    // Ativar legenda selecionada
    const track = Array.from(this.playerElement.textTracks).find(t => t.language === language);
    if (track) {
      track.mode = 'showing';
      this.subtitleTrack = language;
    }
  }

  // Trocar áudio
  changeAudio(index) {
    if (!this.playerElement || !this.playerElement.audioTracks) return;

    // Desativar todos os áudios
    Array.from(this.playerElement.audioTracks).forEach(track => {
      track.enabled = false;
    });

    // Ativar áudio selecionado
    const track = this.playerElement.audioTracks[index];
    if (track) {
      track.enabled = true;
      this.audioTrack = index;
    }
  }

  // Obter estado atual
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      isFullscreen: this.isFullscreen,
      subtitleTrack: this.subtitleTrack,
      audioTrack: this.audioTrack
    };
  }
}

// Criar instância global
window.paixaoFlixPlayer = new PaixaoFlixPlayer();

// Função global para iniciar player
window.initPlayer = function(videoUrl, videoId = null) {
  window.paixaoFlixPlayer.initPlayer(videoUrl, videoId);
};

// Função global para fechar player
window.closePlayer = function() {
  window.paixaoFlixPlayer.closePlayer();
};
