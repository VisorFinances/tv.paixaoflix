import { Content, Quality, Subtitle } from '../types';

export class VideoPlayerService {
  private player: any = null;
  private currentContent: Content | null = null;
  private callbacks: Record<string, Function[]> = {};

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Setup global event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      window.addEventListener('beforeunload', () => this.cleanup());
    }
  }

  async initializePlayer(container: HTMLElement, content: Content): Promise<void> {
    try {
      this.currentContent = content;
      
      // Destroy existing player
      if (this.player) {
        this.player.dispose();
      }

      // Create new player instance
      this.player = await this.createPlayer(container, content);
      
      // Setup player events
      this.setupPlayerEvents();
      
      // Load content
      await this.loadContent(content);
      
      this.emit('player:ready', { player: this.player, content });
    } catch (error) {
      console.error('Failed to initialize player:', error);
      this.emit('player:error', { error });
    }
  }

  private async createPlayer(container: HTMLElement, content: Content): Promise<any> {
    // Dynamic import based on platform
    const VideoJS = await import('video.js');
    
    const player = VideoJS.default(container, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: 'metadata',
      poster: content.poster,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: this.getVideoSources(content),
      tracks: this.getSubtitleTracks(content),
      html5: {
        vhs: {
          overrideNative: true,
        },
      },
    });

    return player;
  }

  private getVideoSources(content: Content): any[] {
    const sources: any[] = [];
    
    // Add HLS source (primary)
    const hlsQuality = content.quality.find(q => q.format === 'hls');
    if (hlsQuality) {
      sources.push({
        src: hlsQuality.url,
        type: 'application/x-mpegURL',
        label: 'HLS',
      });
    }

    // Add DASH source (if available)
    const dashQuality = content.quality.find(q => q.format === 'dash');
    if (dashQuality) {
      sources.push({
        src: dashQuality.url,
        type: 'application/dash+xml',
        label: 'DASH',
      });
    }

    // Add MP4 fallback
    const mp4Quality = content.quality.find(q => q.format === 'mp4');
    if (mp4Quality) {
      sources.push({
        src: mp4Quality.url,
        type: 'video/mp4',
        label: 'MP4',
      });
    }

    return sources;
  }

  private getSubtitleTracks(content: Content): any[] {
    return content.subtitles.map(subtitle => ({
      kind: 'subtitles',
      srclang: subtitle.language,
      label: subtitle.label,
      src: subtitle.url,
    }));
  }

  private async loadContent(content: Content): Promise<void> {
    if (!this.player) return;

    // Set up quality levels
    this.setupQualityLevels(content.quality);
    
    // Set up subtitles
    this.setupSubtitles(content.subtitles);
    
    // Load video
    await this.player.ready();
    
    // Set initial settings
    this.applyInitialSettings();
  }

  private setupQualityLevels(qualities: Quality[]): void {
    if (!this.player) return;

    // Sort qualities by resolution
    const sortedQualities = qualities.sort((a, b) => b.height - a.height);
    
    // Set up quality selector
    this.player.qualityLevels = sortedQualities.map(q => ({
      label: q.label,
      value: q.height,
      selected: false,
    }));
  }

  private setupSubtitles(subtitles: Subtitle[]): void {
    if (!this.player) return;

    // Enable subtitle tracks
    subtitles.forEach((subtitle, index) => {
      this.player.addTextTrack('subtitles', subtitle.language, subtitle.label);
    });
  }

  private applyInitialSettings(): void {
    if (!this.player) return;

    // Set volume
    this.player.volume(0.8);
    
    // Enable subtitles by default if available
    const textTracks = this.player.textTracks();
    if (textTracks.length > 0) {
      textTracks[0].mode = 'showing';
    }
    
    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    if (!this.player) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'k':
          event.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.seekForward(10);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.seekBackward(10);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.increaseVolume(0.1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.decreaseVolume(0.1);
          break;
        case 'f':
          event.preventDefault();
          this.toggleFullscreen();
          break;
        case 'm':
          event.preventDefault();
          this.toggleMute();
          break;
        case 'c':
          event.preventDefault();
          this.toggleSubtitles();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
  }

  private setupPlayerEvents(): void {
    if (!this.player) return;

    // Playback events
    this.player.on('play', () => this.emit('player:play'));
    this.player.on('pause', () => this.emit('player:pause'));
    this.player.on('ended', () => this.emit('player:ended'));
    this.player.on('timeupdate', () => this.handleTimeUpdate());
    this.player.on('seeking', () => this.emit('player:seeking'));
    this.player.on('seeked', () => this.emit('player:seeked'));

    // Error events
    this.player.on('error', (error: any) => this.handlePlayerError(error));

    // Quality events
    this.player.on('qualitychange', () => this.handleQualityChange());

    // Network events
    this.player.on('networkstate', () => this.handleNetworkStateChange());
  }

  private handleTimeUpdate(): void {
    if (!this.player || !this.currentContent) return;

    const currentTime = this.player.currentTime();
    const duration = this.player.duration();
    const progress = (currentTime / duration) * 100;

    this.emit('player:timeupdate', {
      currentTime,
      duration,
      progress,
    });
  }

  private handlePlayerError(error: any): void {
    console.error('Player error:', error);
    this.emit('player:error', { error });
  }

  private handleQualityChange(): void {
    this.emit('player:qualitychange');
  }

  private handleNetworkStateChange(): void {
    this.emit('player:networkchange');
  }

  private handleNetworkChange(isOnline: boolean): void {
    this.emit('player:networkchange', { isOnline });
  }

  // Public API methods
  public play(): void {
    if (this.player) {
      this.player.play();
    }
  }

  public pause(): void {
    if (this.player) {
      this.player.pause();
    }
  }

  public togglePlay(): void {
    if (this.player) {
      if (this.player.paused()) {
        this.play();
      } else {
        this.pause();
      }
    }
  }

  public seek(time: number): void {
    if (this.player) {
      this.player.currentTime(time);
    }
  }

  public seekForward(seconds: number): void {
    if (this.player) {
      const currentTime = this.player.currentTime();
      this.seek(currentTime + seconds);
    }
  }

  public seekBackward(seconds: number): void {
    if (this.player) {
      const currentTime = this.player.currentTime();
      this.seek(Math.max(0, currentTime - seconds));
    }
  }

  public setVolume(volume: number): void {
    if (this.player) {
      this.player.volume(Math.max(0, Math.min(1, volume)));
    }
  }

  public increaseVolume(amount: number): void {
    if (this.player) {
      const currentVolume = this.player.volume();
      this.setVolume(currentVolume + amount);
    }
  }

  public decreaseVolume(amount: number): void {
    if (this.player) {
      const currentVolume = this.player.volume();
      this.setVolume(currentVolume - amount);
    }
  }

  public toggleMute(): void {
    if (this.player) {
      this.player.muted(!this.player.muted());
    }
  }

  public toggleFullscreen(): void {
    if (this.player) {
      if (this.player.isFullscreen()) {
        this.player.exitFullscreen();
      } else {
        this.player.requestFullscreen();
      }
    }
  }

  public toggleSubtitles(): void {
    if (!this.player) return;

    const textTracks = this.player.textTracks();
    let showingTrack = false;

    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      if (track.kind === 'subtitles') {
        if (track.mode === 'showing') {
          track.mode = 'hidden';
        } else {
          track.mode = 'showing';
          showingTrack = true;
        }
      }
    }

    this.emit('player:subtitlestoggle', { enabled: showingTrack });
  }

  public setQuality(height: number): void {
    if (!this.player) return;

    // Implementation depends on the player plugin
    this.emit('player:qualitychange', { height });
  }

  public getCurrentTime(): number {
    return this.player ? this.player.currentTime() : 0;
  }

  public getDuration(): number {
    return this.player ? this.player.duration() : 0;
  }

  public getProgress(): number {
    if (!this.player) return 0;
    
    const currentTime = this.getCurrentTime();
    const duration = this.getDuration();
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }

  public isPlaying(): boolean {
    return this.player ? !this.player.paused() : false;
  }

  public isFullscreen(): boolean {
    return this.player ? this.player.isFullscreen() : false;
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  public off(event: string, callback: Function): void {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  public cleanup(): void {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    
    this.currentContent = null;
    this.callbacks = {};
  }
}
