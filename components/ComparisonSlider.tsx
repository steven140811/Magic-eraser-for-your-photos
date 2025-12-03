import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleTouchStart = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleMove(e.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        handleMove(e.touches[0].clientX);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMove]);

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-3xl shadow-2xl bg-white border border-gray-100 relative select-none group">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] md:aspect-video cursor-ew-resize"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background Image (After - Processed) */}
        <img 
          src={afterImage} 
          alt="After" 
          className="absolute top-0 left-0 w-full h-full object-cover" 
          draggable={false}
        />

        {/* Foreground Image (Before - Original) */}
        <div 
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={beforeImage} 
            alt="Before" 
            className="absolute top-0 left-0 max-w-none h-full object-cover"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
            draggable={false}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_20px_rgba(0,0,0,0.3)] z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-gray-600 transition-transform group-hover:scale-110">
            <ChevronsLeftRight size={20} />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
          Clean
        </div>
      </div>
    </div>
  );
};
