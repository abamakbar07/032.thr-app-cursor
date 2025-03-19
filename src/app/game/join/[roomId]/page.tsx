import React from 'react';
import { redirect } from 'next/navigation';
import { CousinEntryValidator } from '@/components/CousinEntryValidator';
import { getGameRoom } from '@/lib/actions';

export default async function JoinGamePage({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  
  // Get the game room details
  const roomResponse = await getGameRoom(roomId);
  
  if (!roomResponse.success || !roomResponse.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Game Room Not Found</h1>
          <p className="mb-6">
            {roomResponse.error || "The game room you're looking for doesn't exist or has been closed."}
          </p>
        </div>
      </div>
    );
  }
  
  const room = roomResponse.data;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-lg text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
        <p className="text-gray-600 mb-6">{room.description}</p>
        
        <div className="flex justify-center items-center mb-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-flex items-center">
            <span className="font-medium">Room Code: {room.code}</span>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-md">
        <CousinEntryValidator 
          roomId={roomId} 
          onSuccess={(name) => {
            // This is a client component callback, so we'll handle navigation in the component
          }}
        />
      </div>
      
      <div className="mt-8 w-full max-w-md p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-bold mb-2">How to Play:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Enter your entry code provided by the admin</li>
          <li>Complete the registration with your name</li>
          <li>Answer trivia questions to earn tokens</li>
          <li>Use tokens to spin the gacha wheel for rewards</li>
          <li>Collect your prizes from the admin</li>
        </ol>
      </div>
    </div>
  );
} 