import React, { useState } from "react";
import { User, Clock, MessageSquare, ThumbsUp, Flag } from "lucide-react";
import { formatRelativeTime } from "@/utils/formaters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp?: number; // In seconds, for timestamp comments
  createdAt: string;
  likes: number;
  type: "technical" | "feedback" | "appreciation" | "general";
}

interface CommentSectionProps {
  trackId: string;
  comments: Comment[];
  currentUserId?: string;
  currentTime?: number;
  onAddComment: (comment: Omit<Comment, "id" | "createdAt" | "likes">) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  //   trackId,
  comments,
  currentUserId,
  currentTime,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<Comment["type"]>("general");
  const [isAddingTimestampComment, setIsAddingTimestampComment] =
    useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !currentUserId) return;

    onAddComment({
      userId: currentUserId,
      userName: "You", // This would be replaced with actual user name in a real app
      content: newComment,
      timestamp: isAddingTimestampComment ? currentTime : undefined,
      type: commentType,
    });

    setNewComment("");
    setIsAddingTimestampComment(false);
  };

  const sortedComments = [...comments].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const commentTypeLabels = {
    technical: "Technical Question",
    feedback: "Feedback",
    appreciation: "Appreciation",
    general: "General",
  };

  const commentTypeStyles = {
    technical: "bg-blue-100 text-blue-800",
    feedback: "bg-amber-100 text-amber-800",
    appreciation: "bg-green-100 text-green-800",
    general: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start space-x-3">
            <Avatar
            //   src={undefined}
            //   alt="Your avatar"
            //   size="sm"
            //   fallback={<User size={24} />}
            >
              <AvatarImage src={undefined} alt="Your avatar" />
              <AvatarFallback>
                <User size={24} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={3}
              />

              <div className="flex flex-wrap items-center justify-between mt-2">
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  <select
                    value={commentType}
                    onChange={(e) =>
                      setCommentType(e.target.value as Comment["type"])
                    }
                    className="text-sm border border-gray-300 rounded-md p-1"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="appreciation">Appreciation</option>
                  </select>

                  {currentTime !== undefined && (
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={isAddingTimestampComment}
                        onChange={() =>
                          setIsAddingTimestampComment(!isAddingTimestampComment)
                        }
                        className="mr-1"
                      />
                      Add timestamp ({formatTime(currentTime)})
                    </label>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  //   icon={<MessageSquare size={16} />}
                  disabled={!newComment.trim()}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {sortedComments.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="flex space-x-3 border-b border-gray-100 pb-4"
            >
              <Avatar
              //   src={comment.userAvatar}
              //   alt={`${comment.userName}'s avatar`}
              //   size="sm"
              //   fallback={<User size={24} />}
              >
                <AvatarImage src={comment.userAvatar} alt="Your avatar" />
                <AvatarFallback>
                  <User size={24} />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-2">
                      {comment.userName}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        commentTypeStyles[comment.type]
                      }`}
                    >
                      {commentTypeLabels[comment.type]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>

                {comment.timestamp !== undefined && (
                  <div className="text-xs text-indigo-600 mb-1 hover:underline cursor-pointer">
                    at {formatTime(comment.timestamp)}
                  </div>
                )}

                <p className="text-gray-700 whitespace-pre-line">
                  {comment.content}
                </p>

                <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                  <button className="flex items-center hover:text-gray-700">
                    <ThumbsUp size={14} className="mr-1" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="flex items-center hover:text-gray-700">
                    <MessageSquare size={14} className="mr-1" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center hover:text-red-600">
                    <Flag size={14} className="mr-1" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
