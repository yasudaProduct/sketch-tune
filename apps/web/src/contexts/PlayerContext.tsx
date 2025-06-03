"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CurrentTrack {
  id: string;
  isPlaying: boolean;
}

interface PlayerContextType {
  currentTrack: CurrentTrack | null;
  setCurrentTrack: (track: CurrentTrack | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);

  return (
    <PlayerContext.Provider value={{ currentTrack, setCurrentTrack }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
