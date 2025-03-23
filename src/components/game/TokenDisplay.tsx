'use client';

import { useState, useEffect } from 'react';
import { getSpinTokens } from '@/lib/actions';

interface TokenDisplayProps {
  roomId: string;
  initialCount: number;
}

export function TokenDisplay({ roomId, initialCount }: TokenDisplayProps) {
  const [count, setCount] = useState(initialCount);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const refreshTokens = async () => {
    setIsUpdating(true);
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const result = await getSpinTokens(userId, roomId);
        if (result.success && result.data) {
          setCount(result.data.tokenCount);
        }
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={refreshTokens} 
        disabled={isUpdating}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full shadow-md hover:from-yellow-500 hover:to-amber-600 transition-colors disabled:opacity-70"
      >
        <span className="text-lg">🎮</span>
        <span className="font-bold">{count}</span>
        <span className="text-sm">Tokens</span>
        {isUpdating && (
          <svg className="animate-spin h-4 w-4 text-white ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </button>
    </div>
  );
} 