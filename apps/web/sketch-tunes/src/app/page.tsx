"use client";

import { useEffect, useState } from "react";
import {
  TrackCard,
  TrackData,
  sampleTracks,
} from "@/components/track/TrackCard";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [tracks, setTracks] = useState<TrackData[]>([]);
  // const { data: session, status } = useSession();
  const currentUser = true; // session?.user;

  useEffect(() => {
    // Simulate loading data from an API
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setTracks(sampleTracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Home Feed</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-16" />
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {currentUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h2 className="text-xl font-medium text-gray-700">
                Welcome to SketchTunes!
              </h2>
              <p className="mt-2 text-gray-500">
                Sign in to see personalized tracks and discover new music.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
