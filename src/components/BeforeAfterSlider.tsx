import React, { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext.js';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  title: string;
  subtitle: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  title,
  subtitle,
}) => {
  const { t } = useLanguage();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden select-none cursor-ew-resize group bg-[#2e231c]"
    >
      {/* After Image (Full background) */}
      <img
        src={afterImage}
        alt={`Nachher: ${title}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Clipped on top) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={`Vorher: ${title}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{
            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
          }}
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[#fbf8f2] shadow-[0_0_8px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle Knob */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#fbf8f2] border-2 border-[#2e231c] shadow-md flex items-center justify-center text-[#2e231c]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
          </svg>
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-[#2e231c]/70 backdrop-blur-xs text-[#f4efe6] text-[10px] uppercase font-typewriter tracking-widest rounded-md">
        {t.gallery.before}
      </div>
      <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-[#c96442]/85 backdrop-blur-xs text-white text-[10px] uppercase font-typewriter tracking-widest rounded-md">
        {t.gallery.after}
      </div>

      {/* Caption Scrim */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#2e231c]/80 via-[#2e231c]/40 to-transparent z-10">
        <h4 className="font-serif text-sm font-semibold text-[#f4efe6]">{title}</h4>
        <p className="text-xs text-[#f4efe6]/80">{subtitle}</p>
      </div>
    </div>
  );
};
