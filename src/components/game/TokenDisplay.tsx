'use client';

import React, { useEffect } from 'react';
import { useGameContext } from '@/hooks/useGameContext';

interface TokenDisplayProps {
  roomId: string;
  initialCount?: number;
}

export function TokenDisplay({ roomId, initialCount = 0 }: TokenDisplayProps) {
  const { tokenCount, setCurrentRoomId, refreshTokens } = useGameContext();
  
  // Set the room ID in the context and initialize with the initial count if provided
  useEffect(() => {
    setCurrentRoomId(roomId);
    
    // If we have an initial count from server-side props, we can skip initial fetching
    if (initialCount === 0) {
      refreshTokens();
    }
    
    // Poll for updates every 30 seconds
    const intervalId = setInterval(() => {
      refreshTokens();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [roomId, initialCount, setCurrentRoomId, refreshTokens]);
  
  // Use the token count from context, but fall back to initial count if context hasn't loaded yet
  const displayedCount = tokenCount > 0 ? tokenCount : initialCount;

  return (
    <div className="bg-yellow-100 px-4 py-2 rounded-full flex items-center">
      <span className="text-yellow-800 font-medium">Tokens: {displayedCount}</span>
    </div>
  );
} 