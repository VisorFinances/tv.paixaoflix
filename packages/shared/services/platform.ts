import { Platform, PlatformConfig } from '../types';

export class PlatformService {
  private platform: Platform;

  constructor() {
    this.platform = this.detectPlatform();
  }

  private detectPlatform(): Platform {
    if (typeof window === 'undefined') {
      return 'desktop';
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const url = window.location.href;

    // Detect Smart TVs
    if (userAgent.includes('tizen')) {
      return 'tizen';
    }
    if (userAgent.includes('webos')) {
      return 'webos';
    }
    if (userAgent.includes('roku')) {
      return 'roku';
    }
    if (userAgent.includes('apple tv')) {
      return 'apple-tv';
    }
    if (userAgent.includes('fire tv') || userAgent.includes('firetv')) {
      return 'fire-tv';
    }

    // Detect Android TV
    if (userAgent.includes('android') && userAgent.includes('tv')) {
      return 'tv';
    }

    // Detect Mobile
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'mobile';
    }

    // Default to web
    return 'web';
  }

  getPlatformConfig(): PlatformConfig {
    const configs: Record<Platform, PlatformConfig> = {
      web: {
        name: 'Web',
        version: '1.0.0',
        platform: 'web',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: true },
          { name: 'subtitles', supported: true },
          { name: 'picture-in-picture', supported: true },
          { name: 'chromecast', supported: true },
          { name: 'airplay', supported: true },
          { name: 'offline', supported: true },
          { name: '4k', supported: true },
        ],
        limitations: [],
      },
      mobile: {
        name: 'Mobile',
        version: '1.0.0',
        platform: 'mobile',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: true },
          { name: 'subtitles', supported: true },
          { name: 'picture-in-picture', supported: true },
          { name: 'chromecast', supported: true },
          { name: 'offline', supported: true },
          { name: '4k', supported: false },
        ],
        limitations: [
          { name: '4k_video', description: '4K not supported on mobile', impact: 'low' },
        ],
      },
      tv: {
        name: 'Android TV',
        version: '1.0.0',
        platform: 'tv',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: true },
          { name: 'subtitles', supported: true },
          { name: '4k', supported: true },
          { name: 'voice_search', supported: true },
        ],
        limitations: [
          { name: 'picture-in-picture', description: 'PiP not available on TV', impact: 'low' },
        ],
      },
      tizen: {
        name: 'Samsung Tizen',
        version: '1.0.0',
        platform: 'tizen',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: false },
          { name: 'subtitles', supported: true },
          { name: '4k', supported: true },
        ],
        limitations: [
          { name: 'dash', description: 'DASH not supported on Tizen', impact: 'medium' },
          { name: 'chromecast', description: 'Chromecast not available', impact: 'low' },
        ],
      },
      webos: {
        name: 'LG webOS',
        version: '1.0.0',
        platform: 'webos',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: false },
          { name: 'subtitles', supported: true },
          { name: '4k', supported: true },
        ],
        limitations: [
          { name: 'dash', description: 'DASH not supported on webOS', impact: 'medium' },
          { name: 'chromecast', description: 'Chromecast not available', impact: 'low' },
        ],
      },
      roku: {
        name: 'Roku',
        version: '1.0.0',
        platform: 'roku',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: false },
          { name: 'subtitles', supported: true },
          { name: '4k', supported: true },
        ],
        limitations: [
          { name: 'dash', description: 'DASH not supported on Roku', impact: 'medium' },
          { name: 'offline', description: 'Offline downloads not available', impact: 'high' },
        ],
      },
      'apple-tv': {
        name: 'Apple TV',
        version: '1.0.0',
        platform: 'apple-tv',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: true },
          { name: 'subtitles', supported: true },
          { name: '4k', supported: true },
          { name: 'airplay', supported: true },
        ],
        limitations: [
          { name: 'chromecast', description: 'Chromecast not available on Apple TV', impact: 'low' },
        ],
      },
      'fire-tv': {
        name: 'Amazon Fire TV',
        version: '1.0.0',
        platform: 'fire-tv',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: true },
          { name: 'subtitles', supported: true },
          { name: '4k', supported: true },
        ],
        limitations: [
          { name: 'airplay', description: 'AirPlay not available on Fire TV', impact: 'low' },
        ],
      },
      desktop: {
        name: 'Desktop',
        version: '1.0.0',
        platform: 'desktop',
        features: [
          { name: 'hls', supported: true },
          { name: 'dash', supported: true },
          { name: 'subtitles', supported: true },
          { name: 'picture-in-picture', supported: true },
          { name: 'chromecast', supported: true },
          { name: 'airplay', supported: true },
          { name: 'offline', supported: true },
          { name: '4k', supported: true },
        ],
        limitations: [],
      },
    };

    return configs[this.platform];
  }

  getPlatform(): Platform {
    return this.platform;
  }

  isTV(): boolean {
    return ['tv', 'tizen', 'webos', 'roku', 'apple-tv', 'fire-tv'].includes(this.platform);
  }

  isMobile(): boolean {
    return this.platform === 'mobile';
  }

  isDesktop(): boolean {
    return this.platform === 'desktop' || this.platform === 'web';
  }

  supportsFeature(feature: string): boolean {
    const config = this.getPlatformConfig();
    const platformFeature = config.features.find(f => f.name === feature);
    return platformFeature?.supported || false;
  }

  getOptimalVideoQuality(): string {
    if (this.isTV()) {
      return '4k';
    }
    if (this.isMobile()) {
      return '1080p';
    }
    return 'auto';
  }

  getOptimalPlayerConfig() {
    return {
      autoplay: !this.isTV(), // Auto-play disabled on TV for better UX
      quality: this.getOptimalVideoQuality(),
      subtitles: true,
      volume: this.isTV() ? 1.0 : 0.8,
      playbackRate: 1.0,
      theaterMode: !this.isTV(),
      pictureInPicture: this.supportsFeature('picture-in-picture'),
    };
  }
}
