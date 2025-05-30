'use client';

import React, { useState } from 'react';
import { validateCousinEntry, activateCousinEntry } from '@/lib/actions';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useRouter } from 'next/navigation';

interface EntryData {
  name?: string;
  isActive: boolean;
}

interface CousinEntryValidatorProps {
  roomId: string;
  onSuccess?: (userName: string) => void;
}

export function CousinEntryValidator({ roomId, onSuccess }: CousinEntryValidatorProps) {
  const router = useRouter();
  const [entryCode, setEntryCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryFound, setEntryFound] = useState(false);
  const [entryData, setEntryData] = useState<EntryData | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleValidateCode(e: React.FormEvent) {
    e.preventDefault();
    if (!entryCode.trim()) {
      setError('Please enter your entry code');
      return;
    }

    setIsValidating(true);
    setError(null);
    setEntryFound(false);
    setEntryData(null);
    
    try {
      const result = await validateCousinEntry(roomId, entryCode);
      
      if (result.success && result.data) {
        setEntryFound(true);
        
        // Transform the API response to match our EntryData type
        const entryInfo: EntryData = {
          isActive: result.data.entry?.isActive || false,
          // Use the name from existingUser if available, otherwise try the entry name
          name: result.data.existingUser?.name || result.data.entry?.name
        };
        setEntryData(entryInfo);
        
        // Pre-fill name if available
        if (entryInfo.name) {
          setUserName(entryInfo.name);
        }
        
        // If user already exists, we can navigate directly to the game
        if (result.data.existingUser) {
          navigateToGame();
        }
      } else {
        setError(result.error || 'Failed to validate entry code');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  }

  function navigateToGame() {
    try {
      setIsRedirecting(true);
      // Construct the game URL
      const gameUrl = `/game/${roomId}?code=${entryCode}`;
      // Navigate to the game page
      router.push(gameUrl);
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Failed to navigate to the game. Please try again.');
      setIsRedirecting(false);
    }
  }

  async function handleActivateEntry(e: React.FormEvent) {
    e.preventDefault();
    
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsActivating(true);
    setError(null);
    
    try {
      const result = await activateCousinEntry(roomId, entryCode, userName);
      
      if (result.success) {
        setSuccessMessage('Entry activated successfully!');
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(userName);
        }
        
        // Navigate to the game page after a short delay
        setTimeout(() => {
          navigateToGame();
        }, 1500); // Small delay to show success message
      } else {
        setError(result.error || 'Failed to activate entry');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsActivating(false);
    }
  }

  return (
    <Card className="p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Enter Game Room</h2>
      
      {successMessage ? (
        <div className="text-center">
          <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
            {successMessage}
          </div>
          <p className="mb-4">Welcome, {userName}! You are now ready to play.</p>
          <p className="text-sm text-gray-500">
            {isRedirecting ? 'Redirecting to game...' : 'Preparing game...'}
          </p>
        </div>
      ) : entryFound && entryData ? (
        <>
          {entryData.isActive ? (
            <div>
              <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
                This entry code is already active. If this is you, you can continue playing.
              </div>
              <Button 
                onClick={navigateToGame}
                className="w-full"
                disabled={isRedirecting}
              >
                {isRedirecting ? 'Redirecting...' : 'Continue to Game'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleActivateEntry}>
              <div className="mb-4">
                <label htmlFor="userName" className="block mb-2 font-medium">
                  Your Name
                </label>
                <Input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isActivating || isRedirecting}
              >
                {isActivating ? 'Activating...' : 'Activate Entry'}
              </Button>
            </form>
          )}
        </>
      ) : (
        <form onSubmit={handleValidateCode}>
          <div className="mb-4">
            <label htmlFor="entryCode" className="block mb-2 font-medium">
              Entry Code
            </label>
            <Input
              id="entryCode"
              type="text"
              value={entryCode}
              onChange={(e) => setEntryCode(e.target.value.toUpperCase())}
              placeholder="Enter your code"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate Code'}
          </Button>
        </form>
      )}
    </Card>
  );
} 