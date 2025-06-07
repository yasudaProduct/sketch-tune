import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "@/utils/formaters";
import { cn } from "@/utils/cn";
import { WaveformVisualizer } from "@/components/audio/WaveformVisualizer";
import { usePlayer } from "@/contexts/PlayerContext";

interface AudioPlayerProps {
  trackId: string;
  url: string;
  title: string;
  artist: string;
  waveformData?: number[];
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  trackId,
  url,
  title,
  artist,
  waveformData = [],
  onTimeUpdate,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const { currentTrack, setCurrentTrack } = usePlayer();

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
        if (onTimeUpdate) onTimeUpdate(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [onTimeUpdate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (currentTrack?.id === trackId && currentTrack?.isPlaying !== isPlaying) {
      setIsPlaying(currentTrack.isPlaying);
      if (currentTrack.isPlaying) {
        audioRef.current?.play();
      } else {
        audioRef.current?.pause();
      }
    }
  }, [currentTrack, trackId, isPlaying]);

  const togglePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (newPlayingState) {
      audioRef.current?.play();
      setCurrentTrack({ id: trackId, isPlaying: true });
    } else {
      audioRef.current?.pause();
      setCurrentTrack({ id: trackId, isPlaying: false });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4", className)}>
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex flex-col mb-3">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{artist}</p>
      </div>

      <div className="mb-4">
        <WaveformVisualizer
          data={waveformData}
          currentTime={currentTime}
          duration={duration}
          onClick={(percent) => {
            if (audioRef.current) {
              const newTime = duration * percent;
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mx-3 accent-indigo-600"
        />
        <span className="text-sm text-gray-600">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="text-gray-700 hover:text-indigo-600 transition-colors"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, currentTime - 10);
              }
            }}
          >
            <SkipBack size={24} />
          </button>

          <button
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            className="text-gray-700 hover:text-indigo-600 transition-colors"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.min(
                  duration,
                  currentTime + 10
                );
              }
            }}
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="text-gray-700 hover:text-indigo-600 transition-colors"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-indigo-600"
          />
        </div>
      </div>
    </div>
  );
};
