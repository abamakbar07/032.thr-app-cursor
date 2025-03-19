'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useParams, useRouter } from 'next/navigation';
import { getGameRoom, updateGameRoom } from '@/lib/actions';
import Link from 'next/link';

interface RewardTier {
  name: string;
  count: number;
  thrAmount: number;
}

export default function EditRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Room data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  
  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      try {
        if (typeof roomId !== 'string') return;
        
        const result = await getGameRoom(roomId);
        if (result.success && result.data) {
          const room = result.data;
          setName(room.name);
          setDescription(room.description || '');
          setIsActive(room.isActive);
          setRewardTiers(room.rewardTiers || []);
        } else {
          setError(result.error || 'Failed to load room data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomData();
  }, [roomId]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (typeof roomId !== 'string') return;
      
      // Validate reward tiers
      let totalPercentage = 0;
      for (const tier of rewardTiers) {
        if (!tier.name.trim()) {
          setError('All reward tiers must have a name');
          setLoading(false);
          return;
        }
        if (tier.count < 0) {
          setError('Reward tier counts cannot be negative');
          setLoading(false);
          return;
        }
        if (tier.thrAmount < 0) {
          setError('THR amounts cannot be negative');
          setLoading(false);
          return;
        }
        totalPercentage += tier.count;
      }
      
      if (rewardTiers.length === 0) {
        setError('At least one reward tier is required');
        setLoading(false);
        return;
      }
      
      const result = await updateGameRoom(roomId, {
        name,
        description,
        isActive,
        rewardTiers
      });
      
      if (result.success) {
        setSuccess('Room updated successfully');
        setTimeout(() => {
          router.push('/dashboard/rooms');
        }, 1500);
      } else {
        setError(result.error || 'Failed to update room');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const addRewardTier = () => {
    setRewardTiers([
      ...rewardTiers,
      { name: '', count: 0, thrAmount: 0 }
    ]);
  };
  
  const updateRewardTier = (index: number, field: keyof RewardTier, value: string | number) => {
    const updatedTiers = [...rewardTiers];
    
    if (field === 'name') {
      updatedTiers[index].name = value as string;
    } else {
      // Convert string to number for count and thrAmount
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      updatedTiers[index][field] = isNaN(numValue) ? 0 : numValue;
    }
    
    setRewardTiers(updatedTiers);
  };
  
  const removeRewardTier = (index: number) => {
    setRewardTiers(rewardTiers.filter((_, i) => i !== index));
  };
  
  if (loading && error === null) {
    return <div className="p-8 text-center">Loading room data...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Game Room</h1>
        <Link href={`/dashboard/rooms`}>
          <Button variant="outline">Back to Rooms</Button>
        </Link>
      </div>
      
      {error && (
        <Card className="p-4 mb-6 bg-red-50 text-red-800">
          {error}
        </Card>
      )}
      
      {success && (
        <Card className="p-4 mb-6 bg-green-50 text-green-800">
          {success}
        </Card>
      )}
      
      <form onSubmit={handleSave}>
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Room Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium">
                Room Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter room name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block mb-2 font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter room description"
                className="w-full p-3 border rounded-md"
                rows={3}
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Room is active</span>
              </label>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Reward Tiers</h2>
            <Button type="button" variant="outline" onClick={addRewardTier}>
              Add Tier
            </Button>
          </div>
          
          {rewardTiers.length === 0 ? (
            <div className="text-center p-4 bg-yellow-50 rounded-md">
              No reward tiers defined. Please add at least one.
            </div>
          ) : (
            <div className="space-y-4">
              {rewardTiers.map((tier, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
                  <div className="flex-1">
                    <label className="block mb-1 text-sm">Tier Name</label>
                    <Input
                      value={tier.name}
                      onChange={(e) => updateRewardTier(index, 'name', e.target.value)}
                      placeholder="e.g. Gold"
                      required
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block mb-1 text-sm">Count</label>
                    <Input
                      type="number"
                      value={tier.count}
                      onChange={(e) => updateRewardTier(index, 'count', e.target.value)}
                      placeholder="Number of this tier"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block mb-1 text-sm">THR Amount (Rp)</label>
                    <Input
                      type="number"
                      value={tier.thrAmount}
                      onChange={(e) => updateRewardTier(index, 'thrAmount', e.target.value)}
                      placeholder="e.g. 50000"
                      min="0"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => removeRewardTier(index)}
                    className="mt-6"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/rooms">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 