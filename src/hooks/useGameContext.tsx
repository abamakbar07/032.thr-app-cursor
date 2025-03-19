'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSpinTokens, getThrSpins } from '@/lib/actions';
import { useAuth } from './useAuth';

interface Spin {
  _id: string;
  tier: string;
  reward: string;
  createdAt: string;
}

interface GameContextType {
  roomId: string | null;
  tokenCount: number;
  spins: Spin[];
  isLoading: boolean;
  error: string | null;
  refreshTokens: () => Promise<void>;
  refreshSpins: () => Promise<void>;
  setCurrentRoomId: (roomId: string) => void;
}

const GameContext = createContext<GameContextType>({
  roomId: null,
  tokenCount: 0,
  spins: [],
  isLoading: false,
  error: null,
  refreshTokens: async () => {},
  refreshSpins: async () => {},
  setCurrentRoomId: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Update tokens when roomId or user changes
  useEffect(() => {
    if (roomId && user?.id) {
      refreshTokens();
      refreshSpins();
    }
  }, [roomId, user?.id]);

  const refreshTokens = async () => {
    if (!roomId || !user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getSpinTokens(user.id, roomId);
      
      if (result.success) {
        setTokenCount(result.data.count);
      } else {
        setError(result.error || 'Failed to fetch tokens');
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSpins = async () => {
    if (!roomId || !user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getThrSpins(user.id, roomId);
      
      if (result.success && result.data) {
        setSpins(result.data.spins as Spin[]);
      } else {
        setError(result.error || 'Failed to fetch spins');
      }
    } catch (err) {
      console.error('Error fetching spins:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentRoomId = (id: string) => {
    setRoomId(id);
  };

  return (
    <GameContext.Provider 
      value={{ 
        roomId, 
        tokenCount, 
        spins, 
        isLoading, 
        error, 
        refreshTokens, 
        refreshSpins, 
        setCurrentRoomId 
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
} 