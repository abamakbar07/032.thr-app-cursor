import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '../ui/Button';

interface WheelSection {
  id: string;
  label: string;
  color: string;
  probability: number;
  value: string;
}

interface GachaWheelProps {
  sections: WheelSection[];
  onSpinEnd?: (section: WheelSection) => void;
  className?: string;
  disabled?: boolean;
}

export const GachaWheel: React.FC<GachaWheelProps> = ({
  sections,
  onSpinEnd,
  className,
  disabled = false,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelSection | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const totalProbability = sections.reduce((sum, section) => sum + section.probability, 0);
  
  // Normalize probabilities
  const normalizedSections = sections.map(section => ({
    ...section,
    probability: section.probability / totalProbability,
  }));

  // Calculate section angles
  const sectionAngles = normalizedSections.map((section, index) => {
    const startAngle = normalizedSections
      .slice(0, index)
      .reduce((sum, s) => sum + (s.probability * 360), 0);
    const endAngle = startAngle + (section.probability * 360);
    return {
      ...section,
      startAngle,
      endAngle,
    };
  });

  const spinWheel = () => {
    if (isSpinning || disabled) return;
    
    setIsSpinning(true);
    setWinner(null);

    // Weighted random selection based on probabilities
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedSection: WheelSection | null = null;

    for (const section of normalizedSections) {
      cumulativeProbability += section.probability;
      if (random <= cumulativeProbability) {
        selectedSection = section;
        break;
      }
    }

    if (!selectedSection) {
      selectedSection = normalizedSections[normalizedSections.length - 1];
    }

    // Find the section's position on the wheel
    const sectionIndex = normalizedSections.findIndex(s => s.id === selectedSection?.id);
    const sectionData = sectionAngles[sectionIndex];
    
    // Calculate middle of the section
    const middleAngle = (sectionData.startAngle + sectionData.endAngle) / 2;
    
    // Calculate rotation to stop at the pointer (at top of wheel, which is 0 degrees)
    // We want the selected section to stop at the top, so we rotate to 360 - middleAngle
    // Add a number of full rotations (e.g., 5 * 360) to make the spin look good
    const spinDegrees = 360 - middleAngle + (5 * 360);
    
    // Apply the rotation
    setRotation(prevRotation => prevRotation + spinDegrees);
    
    // Set the winner after the spin animation completes
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(selectedSection);
      if (onSpinEnd && selectedSection) {
        onSpinEnd(selectedSection);
      }
    }, 5000); // This should match the CSS transition duration
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="relative w-full h-full rounded-full overflow-hidden transition-transform duration-5000 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {sectionAngles.map((section, index) => {
            const angle = section.probability * 360;
            const skewY = 90 - angle; // Calculate skew for the section
            const rotate = section.startAngle; // Rotation based on section position
            
            return (
              <div
                key={section.id}
                className="absolute top-0 left-0 right-0 bottom-0 origin-bottom-left"
                style={{
                  transform: `rotate(${rotate}deg) skewY(${skewY}deg)`,
                  backgroundColor: section.color,
                  width: '50%',
                  height: '50%',
                  transformOrigin: 'bottom right',
                }}
              >
                <div 
                  className="absolute origin-top-right bottom-0 right-0 transform -translate-y-12 translate-x-6 rotate-45 text-white font-bold"
                  style={{ transform: `rotate(${90 - angle/2}deg)` }}
                >
                  {section.label}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pointer/Indicator */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0" style={{ zIndex: 10 }}>
          <div className="w-6 h-6 bg-red-600 rounded-full"></div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-transparent border-t-red-600"></div>
        </div>
      </div>
      
      <Button 
        onClick={spinWheel} 
        disabled={isSpinning || disabled}
        variant="primary"
        size="lg"
        isLoading={isSpinning}
      >
        {isSpinning ? 'Spinning...' : 'Spin!'}
      </Button>
      
      {winner && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">You won:</p>
          <p className="text-2xl font-bold text-blue-600">{winner.label}</p>
        </div>
      )}
    </div>
  );
}; 