import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '@/utils/cn';

interface GameRoomCardProps {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'finished' | 'pending';
  playerCount: number;
  questionsCount: number;
  createdAt: string; // ISO string
  onActivate?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const GameRoomCard: React.FC<GameRoomCardProps> = ({
  id,
  name,
  code,
  status,
  playerCount,
  questionsCount,
  createdAt,
  onActivate,
  onDelete,
  className,
}) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    finished: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  };

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{name}</CardTitle>
          <span 
            className={cn(
              'text-xs font-medium px-2.5 py-0.5 rounded-full', 
              statusColors[status]
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Room Code:</span>
            <span className="text-sm font-medium">{code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Players:</span>
            <span className="text-sm font-medium">{playerCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Questions:</span>
            <span className="text-sm font-medium">{questionsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Link href={`/admin/game-rooms/${id}`} passHref>
          <Button fullWidth variant="secondary">
            Manage
          </Button>
        </Link>
        {status === 'pending' ? (
          <Button 
            fullWidth 
            variant="primary" 
            onClick={() => onActivate && onActivate(id)}
          >
            Activate
          </Button>
        ) : (
          <Button 
            fullWidth 
            variant="outline" 
            onClick={() => onDelete && onDelete(id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}; 