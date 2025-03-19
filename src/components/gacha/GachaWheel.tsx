'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface GachaWheelProps {
  rewards: {
    tier: string;
    name: string;
    color: string;
  }[];
  onSpin: () => Promise<{ tier: string; name: string }>;
  tokenCount: number;
}

export const GachaWheel: React.FC<GachaWheelProps> = ({ rewards, onSpin, tokenCount }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ tier: string; name: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = async () => {
    if (isSpinning || tokenCount <= 0) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    
    // Start animation
    const spinDuration = 5000; // 5 seconds
    const spinRotation = 1800 + Math.random() * 360; // Multiple full rotations plus random
    
    // Animate the wheel
    setRotation(rotation + spinRotation);
    
    // Get the actual result from the server
    const spinResult = await onSpin();
    
    // Show result after spin animation completes
    setTimeout(() => {
      setResult(spinResult);
      setShowResult(true);
      setIsSpinning(false);
    }, spinDuration);
  };
  
  // Calculate wheel segments
  const segmentAngle = 360 / rewards.length;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold mb-2">Gacha Wheel</h3>
        <p className="text-gray-600">You have {tokenCount} spin tokens</p>
      </div>
      
      <div className="relative w-72 h-72 mb-8">
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="absolute inset-0 rounded-full overflow-hidden transform transition-transform duration-5000 ease-out"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '5s' : '0s',
          }}
        >
          {rewards.map((reward, index) => {
            const startAngle = index * segmentAngle;
            return (
              <div 
                key={index}
                className="absolute top-0 left-0 w-full h-full origin-center"
                style={{ 
                  transform: `rotate(${startAngle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%, 50% 50%)`,
                  backgroundColor: reward.color
                }}
              >
                <div 
                  className="absolute top-[20%] left-[50%] transform -translate-x-1/2 text-white font-bold text-xs whitespace-nowrap"
                  style={{ transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)` }}
                >
                  {reward.name}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center spinner */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-4 border-gray-800 z-10"></div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-red-600 z-20 triangle-down"></div>
      </div>
      
      <Button
        onClick={spinWheel}
        disabled={isSpinning || tokenCount <= 0}
        className="px-8 py-3 text-lg disabled:opacity-50"
      >
        {isSpinning ? 'Spinning...' : 'Spin!'}
      </Button>
      
      {/* Result modal */}
      {showResult && result && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-xl mb-4">
              You won a <span className="font-bold text-blue-600">{result.tier}</span> reward:
            </p>
            <div className="text-3xl font-bold mb-6 text-yellow-600">
              {result.name}
            </div>
            <Button
              onClick={() => setShowResult(false)}
              className="px-6 py-2"
            >
              Claim Reward
            </Button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .triangle-down {
          clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
      `}</style>
    </div>
  );
}; 