'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from 'next/navigation';

export default function JoinGamePage() {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    // Navigate to the room join page
    router.push(`/game/join/${roomCode}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1">Join Game Room</h1>
          <p className="text-gray-600">Enter the room code provided by the game host</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
              Room Code
            </label>
            <Input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full"
              autoComplete="off"
              maxLength={6}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Joining...' : 'Join Game'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You'll be asked to provide your name after entering the room code.
          </p>
        </div>
      </Card>
      
      <div className="mt-8 w-full max-w-md p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-bold mb-2">How to Play:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Enter the room code provided by the game host</li>
          <li>Complete the registration with your name</li>
          <li>Answer trivia questions to earn tokens</li>
          <li>Use tokens to spin the gacha wheel for rewards</li>
          <li>Collect your prizes from the admin</li>
        </ol>
      </div>
    </div>
  );
} 