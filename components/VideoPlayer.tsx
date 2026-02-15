import React, { useEffect, useRef } from 'react';
import Clappr from 'clappr-core';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, autoPlay = false }) => {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playerRef.current && url) {
      const player = new Clappr({
        source: url,
        parentId: '#player-container',
        autoPlay: autoPlay,
        controls: true,
        width: '100%',
        height: '100%',
        poster: 'https://via.placeholder.com/1920x1080/hsl(var(--muted))/000?text=Loading',
        plugins: [
          Clappr.MediaControl,
          Clappr.Playback,
          Clappr.LevelSelector,
        ],
        events: {
          onReady: () => {
            console.log('Player ready');
          },
          onError: (e) => {
            console.error('Player error:', e);
          },
          onPlay: () => {
            console.log('Playing:', url);
          },
          onPause: () => {
            console.log('Paused');
          },
        },
      });

      player.attachTo(playerRef.current);
    }

    return (
      <div ref={playerRef} className="w-full h-full bg-black rounded-lg overflow-hidden" />
  );
};

export default VideoPlayer;
