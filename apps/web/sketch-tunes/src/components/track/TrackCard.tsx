import React from "react";
// import { Link } from "react-router-dom";
import { Play, MessageSquare, Heart, Clock } from "lucide-react";
import { formatRelativeTime } from "@/utils/formaters";
// import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/utils/cn";

export interface TrackData {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    avatar: string;
  };
  coverImage?: string;
  url: string;
  genre: string;
  daw: string;
  productionStage: string;
  duration: number;
  createdAt: string;
  plays: number;
  comments: number;
  likes: number;
}

interface TrackCardProps {
  track: TrackData;
  variant?: "default" | "compact";
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  variant = "default",
  className,
}) => {
  //   const { currentTrack, setCurrentTrack } = usePlayer();
  //   const isPlaying = currentTrack?.id === track.id && currentTrack?.isPlaying;
  const isPlaying = true;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // if (currentTrack?.id === track.id) {
    //   setCurrentTrack({
    //     id: track.id,
    //     isPlaying: !currentTrack.isPlaying,
    //   });
    // } else {
    //   setCurrentTrack({
    //     id: track.id,
    //     isPlaying: true,
    //   });
    // }
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors",
          className
        )}
      >
        <div
          className="relative w-10 h-10 mr-3 flex-shrink-0 bg-gray-100 rounded overflow-hidden"
          onClick={handlePlayToggle}
        >
          {track.coverImage ? (
            <img
              src={track.coverImage}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-500 text-xs">
                {track.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <Play size={16} className="text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* <Link to={`/track/${track.id}`} className="block">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {track.title}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {track.artist.name}
            </p>
          </Link> */}
        </div>

        <div className="ml-2 flex items-center text-xs text-gray-500">
          <Clock size={12} className="mr-1" />
          <span>{formatRelativeTime(track.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="relative">
        <div className="pt-[56.25%] bg-gray-100 relative">
          {track.coverImage ? (
            <img
              src={track.coverImage}
              alt={track.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <span className="text-indigo-500 text-2xl font-medium">
                {track.title.charAt(0)}
              </span>
            </div>
          )}

          <button
            className={cn(
              "absolute bottom-3 right-3 p-3 rounded-full transition-colors",
              isPlaying
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600"
            )}
            onClick={handlePlayToggle}
          >
            <Play size={20} fill={isPlaying ? "white" : "currentColor"} />
          </button>

          <div className="absolute top-3 left-3 px-2 py-1 bg-white bg-opacity-90 rounded-full text-xs font-medium text-gray-700">
            {track.productionStage}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            {/* <Link to={`/track/${track.id}`} className="block">
              <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                {track.title}
              </h3>
            </Link>
            <Link
              to={`/profile/${track.artist.id}`}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {track.artist.name}
            </Link> */}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(track.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-600 space-x-4">
          <div className="flex items-center">
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              {track.daw}
            </span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              {track.genre}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-gray-500 text-sm">
            <div className="flex items-center">
              <MessageSquare size={16} className="mr-1" />
              <span>{track.comments}</span>
            </div>
            <div className="flex items-center">
              <Heart size={16} className="mr-1" />
              <span>{track.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const sampleTracks: TrackData[] = [
  {
    id: "track1",
    title: "Midnight Groove (WIP)",
    artist: {
      id: "user1",
      name: "Demo User",
      avatar:
        "https://images.pexels.com/photos/1056553/pexels-photo-1056553.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    coverImage:
      "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=600",
    url: "https://cdn.freesound.org/previews/476/476580_6142149-lq.mp3",
    genre: "Lofi Hip-Hop",
    daw: "Ableton Live",
    productionStage: "Sketch",
    duration: 185,
    createdAt: "2024-06-15T12:00:00Z",
    plays: 78,
    comments: 12,
    likes: 34,
  },
  {
    id: "track2",
    title: "Sunset Chillwave",
    artist: {
      id: "user2",
      name: "LoFi Producer",
      avatar:
        "https://images.pexels.com/photos/4048277/pexels-photo-4048277.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    coverImage:
      "https://images.pexels.com/photos/2118563/pexels-photo-2118563.jpeg?auto=compress&cs=tinysrgb&w=600",
    url: "https://cdn.freesound.org/previews/439/439085_9158243-lq.mp3",
    genre: "Chillwave",
    daw: "FL Studio",
    productionStage: "Demo",
    duration: 147,
    createdAt: "2024-06-10T18:30:00Z",
    plays: 42,
    comments: 8,
    likes: 16,
  },
  {
    id: "track3",
    title: "Electronic Dreams",
    artist: {
      id: "user3",
      name: "SynthWave",
      avatar:
        "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    coverImage:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600",
    url: "https://cdn.freesound.org/previews/514/514847_11421361-lq.mp3",
    genre: "Synthwave",
    daw: "Logic Pro",
    productionStage: "Work in Progress",
    duration: 215,
    createdAt: "2024-06-05T09:15:00Z",
    plays: 128,
    comments: 24,
    likes: 56,
  },
];
