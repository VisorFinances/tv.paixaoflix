import { Movie, Episode } from '../types';
import VideoPreview from './VideoPreview';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie, episode?: Episode) => void;
  onSeriesClick?: (series: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, onPlay }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-white mb-4 px-4">{title}</h2>
      
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-[200px] md:w-[250px] lg:w-[280px]"
            >
              <VideoPreview 
                movie={movie} 
                onPlay={onPlay}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieRow;
