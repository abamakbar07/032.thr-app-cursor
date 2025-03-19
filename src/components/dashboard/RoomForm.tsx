'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createGameRoom } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { IGameRoom, RewardTier } from '@/models/GameRoom';
import { Card } from '@/components/ui/Card';

interface RoomFormProps {
  userId: string;
  roomData?: IGameRoom;
  isEdit?: boolean;
}

export default function RoomForm({ userId, roomData, isEdit = false }: RoomFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(roomData?.name || '');
  
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>(
    roomData?.rewardTiers || [
      { name: 'Bronze', count: 70, thrAmount: 50000 },
      { name: 'Silver', count: 25, thrAmount: 100000 },
      { name: 'Gold', count: 5, thrAmount: 200000 },
    ]
  );
  
  const totalCount = rewardTiers.reduce((sum, tier) => sum + tier.count, 0);
  
  const addRewardTier = () => {
    setRewardTiers([...rewardTiers, { name: '', count: 0, thrAmount: 0 }]);
  };
  
  const removeRewardTier = (index: number) => {
    setRewardTiers(rewardTiers.filter((_, i) => i !== index));
  };
  
  const updateTier = (index: number, field: keyof RewardTier, value: string | number) => {
    const updatedTiers = [...rewardTiers];
    
    if (field === 'count' || field === 'thrAmount') {
      updatedTiers[index][field] = Number(value);
    } else {
      updatedTiers[index][field] = value as string;
    }
    
    setRewardTiers(updatedTiers);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }
    
    // Validate each tier
    for (const tier of rewardTiers) {
      if (!tier.name.trim()) {
        setError('All tier names are required');
        return;
      }
      
      if (tier.count < 0) {
        setError('Count cannot be negative');
        return;
      }
      
      if (tier.thrAmount < 0) {
        setError('THR amounts cannot be negative');
        return;
      }
    }
    
    if (totalCount <= 0) {
      setError('Total count must be greater than 0');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      if (isEdit && roomData?._id) {
        // We're skipping update functionality for now
        // In a real app, you'd implement the updateGameRoom action
        setError('Update functionality is not implemented yet');
        setIsSubmitting(false);
        return;
      } else {
        const result = await createGameRoom({ name, rewardTiers }, userId);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to create room');
        }
      }
      
      router.push('/dashboard/rooms');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Room Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Family Eid Celebration 2024"
          className="mt-1"
          required
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Reward Tiers
          </label>
          <Button 
            type="button" 
            onClick={addRewardTier}
            size="sm"
            variant="outline"
          >
            Add Tier
          </Button>
        </div>
        
        <div className="space-y-3">
          {rewardTiers.map((tier, index) => (
            <Card key={index} className="p-4 relative">
              <button
                type="button"
                onClick={() => removeRewardTier(index)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                disabled={rewardTiers.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Tier Name
                  </label>
                  <Input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(index, 'name', e.target.value)}
                    placeholder="Bronze, Silver, Gold, etc."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Count
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={tier.count}
                    onChange={(e) => updateTier(index, 'count', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    THR Amount (IDR)
                  </label>
                  <Input
                    type="text"
                    value={tier.thrAmount.toString()}
                    onChange={(e) => {
                      // Remove non-numeric characters and convert to number
                      const value = e.target.value.replace(/[^\d]/g, '');
                      updateTier(index, 'thrAmount', value ? parseInt(value, 10) : 0);
                    }}
                    placeholder="50000"
                    required
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-3 p-3 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          Total count: {totalCount}
        </div>
      </div>
      
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="submit"
          disabled={isSubmitting || totalCount <= 0}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Game Room' : 'Create Game Room'}
        </Button>
      </div>
    </form>
  );
} 