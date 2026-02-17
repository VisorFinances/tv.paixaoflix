import React, { useEffect, useRef, useState } from 'react';
import { Episode } from '../lib/api';
import { Play, Pause, Volume2, Maximize, SkipBack, SkipForward } from 'lucide-react';

interface PlayerProps {
  episode: Episode;
}

const Player: React.FC<PlayerProps> = ({ episode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadVideo = async () => {
      try {
        setIsLoading(true);
        
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = episode.url;
        } else {
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(episode.url);
            hls.attachMedia(video);
          }
        }
      } catch (error) {
        console.error('Error loading video:', error);
        setIsLoading(false);
      }
    };

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [episode.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    let timeout: number;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        onClick={togglePlay}
        onMouseMove={() => setShowControls(true)}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseMove={() => setShowControls(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => skip(-10)}
            className="text-white hover:text-red-500 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlay}
            className="text-white hover:text-red-500 transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <button
            onClick={() => skip(10)}
            className="text-white hover:text-red-500 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={toggleMute}
              className="text-white hover:text-red-500 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-red-600"
            />
          </div>

          <button className="text-white hover:text-red-500 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white text-sm">
            {formatTime(currentTime)}
          </span>
          
          <input
            type="range"
            min="0"
            max={duration}
            step="1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-red-600"
          />
          
          <span className="text-white text-sm">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="absolute top-4 left-4 right-4">
        <h2 className="text-white text-xl font-bold mb-2">{episode.title}</h2>
        <p className="text-gray-300 text-sm">Episódio {episode.number}</p>
      </div>
    </div>
  );
};

export default Player;
