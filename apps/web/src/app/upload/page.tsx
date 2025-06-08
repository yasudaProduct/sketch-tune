"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload as UploadIcon, Music, Clock, Tag, PenTool } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export const Upload: React.FC = () => {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [daw, setDaw] = useState("");
  const [productionStage, setProductionStage] = useState("Sketch");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [errors, setErrors] = useState<{
    title?: string;
    genre?: string;
    daw?: string;
    file?: string;
  }>({});

  const productionStages = [
    "Sketch",
    "Demo",
    "Work in Progress",
    "Beta",
    "Finished",
  ];
  const genreOptions = [
    "Ambient",
    "Chillwave",
    "Drum & Bass",
    "Future Garage",
    "House",
    "Lofi Hip-Hop",
    "Synthwave",
    "Techno",
    "Trance",
    "Other",
  ];
  const dawOptions = [
    "Ableton Live",
    "FL Studio",
    "Logic Pro",
    "Cubase",
    "Pro Tools",
    "Reaper",
    "Studio One",
    "Bitwig Studio",
    "Reason",
    "GarageBand",
    "Other",
  ];

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: "File size must be less than 50MB",
      }));
      return;
    }

    // Check file type
    const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
    if (!validTypes.includes(selectedFile.type)) {
      setErrors((prev) => ({
        ...prev,
        file: "Only MP3, WAV, and OGG files are supported",
      }));
      return;
    }

    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      addToast("Image must be less than 2MB", "warning");
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      addToast("Only JPG, PNG, GIF, and WEBP images are supported", "warning");
      return;
    }

    setCoverImage(selectedFile);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!genre) newErrors.genre = "Genre is required";
    if (!daw) newErrors.daw = "DAW is required";
    if (!file) newErrors.file = "Audio file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      addToast("You must be logged in to upload tracks", "error");
      router.push("/login");
      return;
    }

    if (!validateForm()) return;

    setIsUploading(true);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(i);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      addToast("Track uploaded successfully!", "success");
      router.push("/");
    } catch {
      addToast("Failed to upload track. Please try again.", "error");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Upload Your Track
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {file ? (
                <div className="flex flex-col items-center justify-center">
                  <Music size={48} className="text-indigo-600 mb-2" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {(file.size / (1024 * 1024)).toFixed(2)}MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <UploadIcon size={48} className="text-indigo-600 mb-2" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Drag and drop your audio file here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse (MP3, WAV, OGG - max 50MB)
                    </p>
                    <Button variant="outline" size="sm">
                      Select File
                    </Button>
                  </div>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/ogg"
                    onChange={handleAudioFileChange}
                    className="hidden"
                  />
                </label>
              )}
              {errors.file && (
                <p className="mt-2 text-sm text-red-600">{errors.file}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome track"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Production Stage
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Clock size={18} />
                </div>
                <select
                  value={productionStage}
                  onChange={(e) => setProductionStage(e.target.value)}
                  className="block rounded-md shadow-sm border-gray-300 border p-2 pl-10 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                >
                  {productionStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Tag size={18} />
                </div>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="block rounded-md shadow-sm border-gray-300 border p-2 pl-10 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                  required
                >
                  <option value="">Select a genre</option>
                  {genreOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {errors.genre && (
                <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DAW Used
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <PenTool size={18} />
                </div>
                <select
                  value={daw}
                  onChange={(e) => setDaw(e.target.value)}
                  className="block rounded-md shadow-sm border-gray-300 border p-2 pl-10 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                  required
                >
                  <option value="">Select your DAW</option>
                  {dawOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {errors.daw && (
                <p className="mt-1 text-sm text-red-600">{errors.daw}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Production Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-md shadow-sm border-gray-300 border p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Share your thoughts, process, or questions about this track..."
              rows={4}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image (optional)
            </label>
            <div className="flex items-center space-x-4">
              {coverImage ? (
                <div className="relative w-20 h-20 rounded-md overflow-hidden">
                  <Image
                    src={URL.createObjectURL(coverImage)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                  <Music size={24} className="text-gray-400" />
                </div>
              )}

              <label className="flex-1">
                <div className="relative">
                  <Button variant="outline" size="sm">
                    {coverImage ? "Change Image" : "Select Image"}
                  </Button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG, GIF, or WEBP. Max 2MB.
                </p>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="is-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is-public"
                className="ml-2 block text-sm text-gray-700"
              >
                Make this track public
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              If unchecked, only you and people with the link can view this
              track
            </p>
          </div>

          {isUploading && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isUploading}>
              Upload Track
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
