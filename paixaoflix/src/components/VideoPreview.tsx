import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { VideoPreviewProps } from '../types';

const VideoPreview: React.FC<VideoPreviewProps> = ({ movie, onPlay }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const DWELL_TIME = 1500; // 1.5 seconds

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
    
    // Start dwell timer
    hoverTimeoutRef.current = window.setTimeout(() => {
      if (isHovering) {
        loadAndPlayTrailer();
      }
    }, DWELL_TIME);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowVideo(false);
    
    // Clear dwell timer
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const loadAndPlayTrailer = async () => {
    if (trailerUrl) {
      setShowVideo(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // TMDB API integration for trailers
      const apiKey = (window as any).REACT_APP_TMDB_API_KEY || 'demo_key';
      const response = await fetch(
        `https://api.themoviedb.org/3/search/${movie.type}?api_key=${apiKey}&query=${encodeURIComponent(movie.title)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const results = data.results;
        
        if (results && results.length > 0) {
          const firstResult = results[0];
          
          // Get videos for this movie/series
          const videosResponse = await fetch(
            `https://api.themoviedb.org/3/${movie.type}/${firstResult.id}/videos?api_key=${apiKey}`
          );
          
          if (videosResponse.ok) {
            const videosData = await videosResponse.json();
            const trailer = videosData.results.find(
              (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
            );
            
            if (trailer) {
              // Convert YouTube trailer to embed URL
              const embedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}`;
              setTrailerUrl(embedUrl);
              setShowVideo(true);
              return;
            }
          }
        }
      }
      
      // Fallback to placeholder if no trailer found
      const placeholderTrailer = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      setTrailerUrl(placeholderTrailer);
      setShowVideo(true);
    } catch (error) {
      console.error('Error loading trailer:', error);
      // Fallback on error
      const placeholderTrailer = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      setTrailerUrl(placeholderTrailer);
      setShowVideo(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (movie.type === 'series') {
      // For series, we might want to show the series detail modal
      // For now, just play the first episode if available
      const firstEpisode = movie.seasons?.[0]?.episodes?.[0];
      if (firstEpisode) {
        onPlay(movie, firstEpisode);
      }
    } else {
      onPlay(movie);
    }
  };

  return (
    <motion.div
      className="relative cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative overflow-hidden rounded-lg">
        {/* Static Thumbnail */}
        <motion.img
          src={movie.thumbnail}
          alt={movie.title}
          className="w-full h-full object-cover transition-opacity duration-300"
          animate={{ opacity: showVideo ? 0 : 1 }}
        />
        
        {/* Video Preview */}
        {showVideo && trailerUrl && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {trailerUrl.includes('youtube') ? (
              <iframe
                src={trailerUrl}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`${movie.title} Trailer`}
              />
            ) : (
              <video
                src={trailerUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
          </motion.div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </motion.div>
        </div>
        
        {/* Movie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-gray-300 text-xs md:text-sm">
              {movie.year}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPreview;
