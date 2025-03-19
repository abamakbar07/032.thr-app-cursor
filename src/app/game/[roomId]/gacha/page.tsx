import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getSpinTokens, spinGacha, getThrSpins } from '@/lib/actions';
import { ClientGachaPage } from '@/components/game/ClientGachaPage';

// Define the shape of GachaResult since the imported type appears to be different
interface GachaResultWithReward {
  tier: string;
  reward: string;
}

interface Spin {
  _id: string;
  tier: string;
  reward: string;
  createdAt: string;
}

export default async function GachaPage({ params }: { params: { roomId: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/signin');
  }

  const roomId = params.roomId;
  const userId = session.user.id as string;
  
  // Get user's token balance
  const tokensResponse = await getSpinTokens(userId, roomId);
  const tokenCount = tokensResponse.success ? tokensResponse.data.count : 0;
  
  // Get previous spins
  const spinsResponse = await getThrSpins(userId, roomId);
  const previousSpins = spinsResponse.success && spinsResponse.data ? 
    (spinsResponse.data.spins as Spin[] || []) : [];
  
  async function handleSpin() {
    'use server';
    
    const result = await spinGacha(userId, roomId);
    
    if (result.success && result.data) {
      // Cast the result to our local interface that matches the expected shape
      const gachaResult = result.data as unknown as GachaResultWithReward;
      return {
        tier: gachaResult.tier || 'Unknown',
        name: gachaResult.reward || 'Mystery Prize'
      };
    }
    
    // Default fallback if the spin fails
    return {
      tier: 'Error',
      name: 'Failed to spin'
    };
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50">
      <ClientGachaPage
        roomId={roomId}
        initialTokenCount={tokenCount}
        initialSpins={previousSpins}
        onSpin={handleSpin}
      />
    </div>
  );
} 