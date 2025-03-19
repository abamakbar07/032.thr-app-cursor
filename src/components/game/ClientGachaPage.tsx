'use client';

import React, { useEffect } from 'react';
import { useGameContext } from '@/hooks/useGameContext';
import { GachaWheel } from '@/components/gacha/GachaWheel';
import { Card } from '@/components/ui/Card';
import { TokenDisplay } from './TokenDisplay';
import Link from 'next/link';

interface ClientGachaPageProps {
  roomId: string;
  initialTokenCount: number;
  initialSpins: any[];
  onSpin: () => Promise<{ tier: string; name: string }>;
}

export function ClientGachaPage({ 
  roomId, 
  initialTokenCount, 
  initialSpins,
  onSpin 
}: ClientGachaPageProps) {
  const { spins, refreshSpins, refreshTokens } = useGameContext();
  
  // Define reward tiers for the wheel
  const rewardTiers = [
    { tier: 'S', name: 'Gold Prize', color: '#FFD700' },
    { tier: 'A', name: 'Silver Prize', color: '#C0C0C0' },
    { tier: 'B', name: 'Bronze Prize', color: '#CD7F32' },
    { tier: 'C', name: 'Small Gift', color: '#4CAF50' },
    { tier: 'D', name: 'Mini Gift', color: '#2196F3' },
    { tier: 'E', name: 'Tiny Gift', color: '#9C27B0' }
  ];
  
  // Handle spin and update data
  const handleSpin = async () => {
    const result = await onSpin();
    
    // After spinning, refresh both tokens and spins
    await Promise.all([refreshTokens(), refreshSpins()]);
    
    return result;
  };
  
  // Use context data if available, otherwise use initial data
  const displayedSpins = spins.length > 0 ? spins : initialSpins;
  
  return (
    <div className="w-full max-w-4xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">THR Gacha Wheel</h1>
        <div className="flex space-x-4 items-center">
          <TokenDisplay roomId={roomId} initialCount={initialTokenCount} />
          <Link 
            href={`/game/${roomId}/trivia`} 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Trivia
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <GachaWheel 
          rewards={rewardTiers}
          onSpin={handleSpin}
          tokenCount={initialTokenCount}
        />
      </div>
      
      {displayedSpins.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Your Previous Rewards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedSpins.map((spin) => (
              <div 
                key={spin._id} 
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Tier {spin.tier}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(spin.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-lg font-bold">{spin.reward}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 