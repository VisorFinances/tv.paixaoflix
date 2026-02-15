// Advanced Video Player Controller
class VideoPlayer {
    constructor() {
        this.player = null;
        this.modal = null;
        this.controls = {
            playPause: null,
            volume: null,
            subtitle: null,
            pip: null,
            fullscreen: null,
            progress: null,
            progressFill: null
        };
        this.isFullscreen = false;
        this.isPiP = false;
        this.currentVolume = 1;
        this.isMuted = false;
        this.subtitleTracks = [];
        this.currentSubtitleTrack = -1;
        
        this.init();
    }
    
    init() {
        this.player = document.getElementById('videoPlayer');
        this.modal = document.getElementById('videoModal');
        
        if (!this.player || !this.modal) return;
        
        this.setupControls();
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.setupGestureControls();
        this.loadSettings();
    }
    
    setupControls() {
        this.controls.playPause = document.getElementById('playPauseBtn');
        this.controls.volume = document.getElementById('volumeBtn');
        this.controls.subtitle = document.getElementById('subtitleBtn');
        this.controls.pip = document.getElementById('pipBtn');
        this.controls.fullscreen = document.getElementById('fullscreenBtn');
        this.controls.progress = document.querySelector('.progress-bar');
        this.controls.progressFill = document.getElementById('progressFill');
        
        // Setup control buttons
        if (this.controls.playPause) {
            this.controls.playPause.addEventListener('click', () => this.togglePlayPause());
        }
        
        if (this.controls.volume) {
            this.controls.volume.addEventListener('click', () => this.toggleMute());
        }
        
        if (this.controls.subtitle) {
            this.controls.subtitle.addEventListener('click', () => this.toggleSubtitles());
        }
        
        if (this.controls.pip) {
            this.controls.pip.addEventListener('click', () => this.togglePiP());
        }
        
        if (this.controls.fullscreen) {
            this.controls.fullscreen.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Setup progress bar
        if (this.controls.progress) {
            this.controls.progress.addEventListener('click', (e) => this.seekTo(e));
        }
        
        // Setup volume control with wheel
        this.player.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                this.adjustVolume(e.deltaY > 0 ? -0.1 : 0.1);
            }
        });
    }
    
    setupEventListeners() {
        // Player events
        this.player.addEventListener('play', () => this.onPlay());
        this.player.addEventListener('pause', () => this.onPause());
        this.player.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.player.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.player.addEventListener('ended', () => this.onEnded());
        this.player.addEventListener('error', (e) => this.onError(e));
        this.player.addEventListener('volumechange', () => this.onVolumeChange());
        
        // Modal events
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Close button
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Picture-in-Picture events
        this.player.addEventListener('enterpictureinpicture', () => {
            this.isPiP = true;
            this.updatePiPButton();
        });
        
        this.player.addEventListener('leavepictureinpicture', () => {
            this.isPiP = false;
            this.updatePiPButton();
        });
        
        // Fullscreen events
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenButton();
        });
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seek(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seek(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustVolume(-0.1);
                    break;
                case 'm':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'c':
                    e.preventDefault();
                    this.toggleSubtitles();
                    break;
                case 'p':
                    e.preventDefault();
                    this.togglePiP();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.close();
                    break;
            }
        });
    }
    
    setupGestureControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        this.player.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        });
        
        this.player.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;
            
            // Detect swipe gestures
            if (deltaTime < 500) {
                if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
                    // Horizontal swipe - seek
                    this.seek(deltaX > 0 ? 10 : -10);
                } else if (Math.abs(deltaY) > 50 && Math.abs(deltaX) < 50) {
                    // Vertical swipe - volume
                    this.adjustVolume(deltaY > 0 ? -0.1 : 0.1);
                }
            }
            
            // Double tap to play/pause
            if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                this.togglePlayPause();
            }
        });
    }
    
    loadSettings() {
        const settings = localStorage.getItem('paixaoflix_player_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.currentVolume = parsed.volume || 1;
            this.isMuted = parsed.muted || false;
            this.currentSubtitleTrack = parsed.subtitleTrack || -1;
            
            this.player.volume = this.currentVolume;
            this.player.muted = this.isMuted;
        }
    }
    
    saveSettings() {
        const settings = {
            volume: this.currentVolume,
            muted: this.isMuted,
            subtitleTrack: this.currentSubtitleTrack
        };
        localStorage.setItem('paixaoflix_player_settings', JSON.stringify(settings));
    }
    
    play(src) {
        if (src) {
            this.player.src = src;
        }
        
        this.player.play().catch(error => {
            console.error('Erro ao reproduzir vídeo:', error);
            this.showError('Não foi possível reproduzir o vídeo');
        });
    }
    
    pause() {
        this.player.pause();
    }
    
    togglePlayPause() {
        if (this.player.paused) {
            this.play();
        } else {
            this.pause();
        }
    }
    
    seek(seconds) {
        this.player.currentTime = Math.max(0, Math.min(this.player.duration, this.player.currentTime + seconds));
    }
    
    seekTo(event) {
        if (!this.controls.progress) return;
        
        const rect = this.controls.progress.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        this.player.currentTime = percent * this.player.duration;
    }
    
    adjustVolume(delta) {
        this.currentVolume = Math.max(0, Math.min(1, this.currentVolume + delta));
        this.player.volume = this.currentVolume;
        this.isMuted = false;
        this.player.muted = false;
        this.updateVolumeButton();
        this.saveSettings();
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.player.muted = this.isMuted;
        this.updateVolumeButton();
        this.saveSettings();
    }
    
    toggleSubtitles() {
        const tracks = this.player.textTracks;
        if (tracks.length === 0) return;
        
        // Disable current track
        if (this.currentSubtitleTrack >= 0) {
            tracks[this.currentSubtitleTrack].mode = 'disabled';
        }
        
        // Enable next track
        this.currentSubtitleTrack = (this.currentSubtitleTrack + 1) % (tracks.length + 1);
        
        if (this.currentSubtitleTrack < tracks.length) {
            tracks[this.currentSubtitleTrack].mode = 'showing';
        }
        
        this.updateSubtitleButton();
        this.saveSettings();
    }
    
    async togglePiP() {
        try {
            if (this.isPiP) {
                await document.exitPictureInPicture();
            } else {
                await this.player.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Erro ao alternar PiP:', error);
            this.showError('Picture-in-Picture não suportado neste navegador');
        }
    }
    
    async toggleFullscreen() {
        try {
            if (this.isFullscreen) {
                await document.exitFullscreen();
            } else {
                await this.modal.requestFullscreen();
            }
        } catch (error) {
            console.error('Erro ao alternar tela cheia:', error);
        }
    }
    
    close() {
        this.player.pause();
        this.player.src = '';
        this.modal.classList.remove('active');
        
        // Reset PiP if active
        if (this.isPiP) {
            document.exitPictureInPicture();
        }
        
        // Reset fullscreen if active
        if (this.isFullscreen) {
            document.exitFullscreen();
        }
    }
    
    // Event handlers
    onPlay() {
        this.updatePlayPauseButton();
    }
    
    onPause() {
        this.updatePlayPauseButton();
    }
    
    onTimeUpdate() {
        if (this.controls.progressFill && this.player.duration) {
            const percent = (this.player.currentTime / this.player.duration) * 100;
            this.controls.progressFill.style.width = `${percent}%`;
        }
    }
    
    onLoadedMetadata() {
        // Load subtitle tracks
        this.subtitleTracks = Array.from(this.player.textTracks);
        this.updateSubtitleButton();
    }
    
    onEnded() {
        // Auto-play next content if available
        this.onVideoEnded();
    }
    
    onError(event) {
        console.error('Erro no player:', event);
        this.showError('Ocorreu um erro ao reproduzir o vídeo');
    }
    
    onVolumeChange() {
        this.currentVolume = this.player.volume;
        this.isMuted = this.player.muted;
        this.updateVolumeButton();
    }
    
    onVideoEnded() {
        // Trigger custom event for app to handle next content
        window.dispatchEvent(new CustomEvent('videoEnded', {
            detail: {
                currentTime: this.player.currentTime,
                duration: this.player.duration
            }
        }));
    }
    
    // UI update methods
    updatePlayPauseButton() {
        if (!this.controls.playPause) return;
        
        const icon = this.controls.playPause.querySelector('i');
        if (icon) {
            icon.className = this.player.paused ? 'fas fa-play' : 'fas fa-pause';
        }
    }
    
    updateVolumeButton() {
        if (!this.controls.volume) return;
        
        const icon = this.controls.volume.querySelector('i');
        if (icon) {
            if (this.isMuted || this.currentVolume === 0) {
                icon.className = 'fas fa-volume-mute';
            } else if (this.currentVolume < 0.5) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        }
    }
    
    updateSubtitleButton() {
        if (!this.controls.subtitle) return;
        
        const icon = this.controls.subtitle.querySelector('i');
        if (icon) {
            if (this.currentSubtitleTrack >= 0 && this.currentSubtitleTrack < this.subtitleTracks.length) {
                icon.className = 'fas fa-closed-captioning';
                this.controls.subtitle.style.color = '#e50914';
            } else {
                icon.className = 'fas fa-closed-captioning';
                this.controls.subtitle.style.color = '';
            }
        }
    }
    
    updatePiPButton() {
        if (!this.controls.pip) return;
        
        const icon = this.controls.pip.querySelector('i');
        if (icon) {
            icon.className = this.isPiP ? 'fas fa-clone' : 'fas fa-clone';
            this.controls.pip.style.color = this.isPiP ? '#e50914' : '';
        }
    }
    
    updateFullscreenButton() {
        if (!this.controls.fullscreen) return;
        
        const icon = this.controls.fullscreen.querySelector('i');
        if (icon) {
            icon.className = this.isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
            this.controls.fullscreen.style.color = this.isFullscreen ? '#e50914' : '';
        }
    }
    
    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'player-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e50914;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 3000;
            font-size: 14px;
            font-weight: 500;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    // Public methods
    getCurrentTime() {
        return this.player.currentTime;
    }
    
    getDuration() {
        return this.player.duration;
    }
    
    getVolume() {
        return this.currentVolume;
    }
    
    isPlaying() {
        return !this.player.paused;
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayer = new VideoPlayer();
});

// Handle video ended event
window.addEventListener('videoEnded', (e) => {
    // Notify app about video completion
    if (window.app) {
        const progress = (e.detail.currentTime / e.detail.duration) * 100;
        window.app.saveWatchProgress(window.currentContentId, progress);
    }
});
