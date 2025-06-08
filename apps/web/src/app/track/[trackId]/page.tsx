"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Tag,
  PenTool,
  User,
  Heart,
  Download,
  Share2,
  Flag,
} from "lucide-react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { CommentSection, Comment } from "@/components/track/CommentSection";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";
import { formatRelativeTime } from "@/utils/formaters";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrackData } from "@/components/track/TrackCard";

export const TrackDetail: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [track, setTrack] = useState<TrackData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  // Sample track data for demonstration
  const sampleTracks: TrackData[] = [
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
  ];

  // Sample comments for demonstration
  const sampleComments: Comment[] = [
    {
      id: "comment1",
      userId: "user2",
      userName: "LoFi Producer",
      userAvatar:
        "https://images.pexels.com/photos/4048277/pexels-photo-4048277.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "Love the chord progression around 0:45! What chord is that?",
      timestamp: 45,
      createdAt: "2024-06-16T14:23:00Z",
      likes: 5,
      type: "technical",
    },
    {
      id: "comment2",
      userId: "user3",
      userName: "SynthWave",
      userAvatar:
        "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=150",
      content:
        "This has a great vibe! I think the bass could be a bit louder in the mix though.",
      createdAt: "2024-06-15T18:45:00Z",
      likes: 3,
      type: "feedback",
    },
    {
      id: "comment3",
      userId: "user4",
      userName: "AmbientMind",
      userAvatar:
        "https://images.pexels.com/photos/1870163/pexels-photo-1870163.jpeg?auto=compress&cs=tinysrgb&w=150",
      content:
        "This track is amazing! Can't wait to hear the finished version.",
      createdAt: "2024-06-15T16:30:00Z",
      likes: 8,
      type: "appreciation",
    },
  ];

  // Generate random waveform data for visualization
  const generateWaveformData = (length: number): number[] => {
    const data: number[] = [];
    for (let i = 0; i < length; i++) {
      // Create a more natural looking waveform with some patterns
      const value =
        0.2 +
        // Base amplitude
        0.3 * Math.random() +
        // Add some peaks
        0.4 * Math.sin(i / 20) * Math.sin(i / 7);
      data.push(Math.max(0.1, Math.min(0.9, value)));
    }
    return data;
  };

  useEffect(() => {
    if (!trackId) return;

    const fetchTrackData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Find track with matching ID
        const trackData = sampleTracks.find((t) => t.id === trackId);

        if (trackData) {
          setTrack(trackData);
          setComments(sampleComments);
          setIsLiked(Math.random() > 0.5); // Random for demo purposes
        } else {
          addToast("Track not found", "error");
        }
      } catch (error) {
        console.error("Error fetching track data:", error);
        addToast("Failed to load track", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackData();
  }, [trackId, addToast]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (track) {
      setTrack({
        ...track,
        likes: isLiked ? track.likes - 1 : track.likes + 1,
      });
    }
  };

  const handleAddComment = (
    newComment: Omit<Comment, "id" | "createdAt" | "likes">
  ) => {
    const comment: Comment = {
      id: `comment${Date.now()}`,
      ...newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setComments([comment, ...comments]);
    if (track) {
      setTrack({
        ...track,
        comments: track.comments + 1,
      });
    }

    addToast("Comment added successfully!", "success");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-full mr-4" />
            <div className="h-5 bg-gray-200 rounded w-32" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="h-24 bg-gray-200 rounded mb-3" />
            <div className="h-6 bg-gray-200 rounded w-full mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          Track not found
        </h2>
        <p className="text-gray-500">
          The track you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{track.title}</h1>
        <div className="flex items-center mb-6">
          <Link
            href={`/profile/${track.artist.id}`}
            className="flex items-center group"
          >
            <Avatar
              //   src={track.artist.avatar}
              //   alt={track.artist.name}
              //   size="md"
              className="mr-3"
            >
              <AvatarImage src={track.artist.avatar} alt={track.artist.name} />
              <AvatarFallback>
                <User size={24} />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
              {track.artist.name}
            </span>
          </Link>
          <span className="ml-4 text-sm text-gray-500">
            {formatRelativeTime(track.createdAt)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <AudioPlayer
              trackId={track.id}
              url={track.url}
              title={track.title}
              artist={track.artist.name}
              waveformData={generateWaveformData(100)}
              onTimeUpdate={setCurrentTime}
              className="mb-6"
            />

            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Tag size={14} className="mr-1" />
                  {track.genre}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <PenTool size={14} className="mr-1" />
                  {track.daw}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  <Clock size={14} className="mr-1" />
                  {track.productionStage}
                </span>
              </div>

              <div className="flex flex-wrap justify-between items-center mb-4">
                <div className="flex space-x-4 mb-2 md:mb-0">
                  <button
                    className={`flex items-center space-x-1 ${
                      isLiked
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                    onClick={handleLike}
                  >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    <span>{track.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button
                    className="flex items-center space-x-1 text-gray-500 hover:text-indigo-500"
                    onClick={() => {
                      addToast("Track shared to clipboard!", "success");
                    }}
                  >
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>

                  <button
                    className="flex items-center space-x-1 text-gray-500 hover:text-indigo-500"
                    onClick={() => {
                      addToast("Download feature coming soon!", "info");
                    }}
                  >
                    <Download size={20} />
                    <span>Download</span>
                  </button>
                </div>

                <button
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                  onClick={() => {
                    addToast(
                      "Report submitted. Our team will review it.",
                      "info"
                    );
                  }}
                >
                  <Flag size={18} />
                  <span>Report</span>
                </button>
              </div>

              {track.artist.id === session?.user?.id && (
                <div className="flex justify-end space-x-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addToast("Edit feature coming soon!", "info")
                    }
                  >
                    Edit Track
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      addToast("Delete feature coming soon!", "info")
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}

              <div className="prose max-w-none">
                <p>
                  This is where the track description would go. The artist can
                  share their thoughts on the production process, ask for
                  feedback, or provide context about the track.
                </p>
                <p>
                  For this demonstration, we&apos;re showing a placeholder
                  description. In a real implementation, this would come from
                  the track data.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <CommentSection
              trackId={track.id}
              comments={comments}
              currentUserId={session?.user?.id}
              currentTime={currentTime}
              onAddComment={handleAddComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDetail;
