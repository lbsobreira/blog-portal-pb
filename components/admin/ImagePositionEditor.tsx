"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ImagePositionEditorProps {
  imageUrl: string;
  zoom: number;
  positionX: number;
  positionY: number;
  onZoomChange: (zoom: number) => void;
  onPositionChange: (x: number, y: number) => void;
}

export default function ImagePositionEditor({
  imageUrl,
  zoom,
  positionX,
  positionY,
  onZoomChange,
  onPositionChange,
}: ImagePositionEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle mouse/touch down
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - positionX,
      y: e.clientY - positionY,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [positionX, positionY]);

  // Handle mouse/touch move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Limit the drag range based on zoom
    const maxOffset = 50 * (zoom / 100);
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, newY));

    onPositionChange(clampedX, clampedY);
  }, [isDragging, dragStart, zoom, onPositionChange]);

  // Handle mouse/touch up
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Reset position when zoom changes significantly
  useEffect(() => {
    const maxOffset = 50 * (zoom / 100);
    if (Math.abs(positionX) > maxOffset || Math.abs(positionY) > maxOffset) {
      onPositionChange(
        Math.max(-maxOffset, Math.min(maxOffset, positionX)),
        Math.max(-maxOffset, Math.min(maxOffset, positionY))
      );
    }
  }, [zoom, positionX, positionY, onPositionChange]);

  if (!imageUrl) {
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        Enter an image URL above to preview and adjust
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Drag the image to position it, use the slider to zoom
      </p>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className={`
            relative w-32 h-32 rounded-full overflow-hidden
            border-4 border-white dark:border-gray-700 shadow-lg
            bg-gray-200 dark:bg-gray-600
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          {!imageError ? (
            <img
              src={imageUrl}
              alt="Profile preview"
              className="absolute w-full h-full object-cover select-none pointer-events-none"
              style={{
                transform: `scale(${zoom / 100}) translate(${positionX / (zoom / 100)}px, ${positionY / (zoom / 100)}px)`,
                transformOrigin: 'center center',
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              draggable={false}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-red-500 text-xs text-center p-2">
              Failed to load image
            </div>
          )}

          {/* Drag indicator overlay */}
          {imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
              <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Zoom</label>
          <span className="text-sm text-gray-500 dark:text-gray-400">{zoom}%</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <input
            type="range"
            min="100"
            max="200"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            onZoomChange(100);
            onPositionChange(0, 0);
          }}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}
