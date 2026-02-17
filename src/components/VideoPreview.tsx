import React from 'react';

interface VideoPreviewProps {
  previewUrl?: string;
  thumbnail: string;
  title: string;
  isPlaying: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  previewUrl, 
  thumbnail, 
  title, 
  isPlaying 
}) => {
  return (
    <div className="relative aspect-video">
      {isPlaying && previewUrl ? (
        <video
          src={previewUrl}
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default VideoPreview;
