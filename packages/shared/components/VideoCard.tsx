import React from 'react';
import { Content } from '../types';

interface VideoCardProps {
  content: Content;
  onClick?: (content: Content) => void;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  content,
  onClick,
  size = 'medium',
  showProgress = false,
  progress = 0,
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-32 h-48',
    medium: 'w-48 h-72',
    large: 'w-64 h-96',
  };

  const handleClick = () => {
    if (onClick) {
      onClick(content);
    }
  };

  return (
    <div
      className={`video-card ${sizeClasses[size]} ${className} cursor-pointer group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:z-10`}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-full">
        <img
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Badge */}
        {content.isPremium && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
            PREMIUM
          </div>
        )}
        
        {/* Live Badge */}
        {content.isLive && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            AO VIVO
          </div>
        )}
        
        {/* Rating */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded">
          ⭐ {content.rating.toFixed(1)}
        </div>
      </div>
      
      {/* Content Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
          {content.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span>{content.releaseDate.getFullYear()}</span>
          {content.duration && (
            <>
              <span>•</span>
              <span>{Math.floor(content.duration / 60)}min</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
