import React, { useRef, useEffect } from "react";

interface WaveformVisualizerProps {
  data: number[];
  currentTime: number;
  duration: number;
  onClick?: (percent: number) => void;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  data,
  currentTime,
  duration,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const waveformData = data.length > 0 ? data : generateRandomData(100);

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const barWidth = rect.width / waveformData.length;
    const barGap = 1;
    const barWidthWithGap = barWidth - barGap;

    // Calculate progress position
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressX = progress * rect.width;

    // Draw waveform
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (rect.height * 0.7);
      const y = (rect.height - barHeight) / 2;

      // Determine if bar is before or after current play position
      const isPastCurrentTime = x <= progressX;

      // Draw bar
      ctx.fillStyle = isPastCurrentTime ? "#4f46e5" : "#d1d5db";
      ctx.fillRect(x, y, barWidthWithGap, barHeight);
    });

    // Draw progress line
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(progressX, 0, 2, rect.height);
  }, [data, currentTime, duration]);

  const generateRandomData = (count: number): number[] => {
    return Array.from({ length: count }, () => 0.1 + Math.random() * 0.8);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onClick) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;

    onClick(percent);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-24 bg-gray-50 rounded-md cursor-pointer"
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
