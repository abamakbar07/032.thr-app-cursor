import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getGameRooms, getCousinEntries, getQuestions } from "@/lib/actions";
import { auth } from "@/auth";
import { IGameRoom } from "@/models/GameRoom";
import { redirect } from "next/navigation";
import mongoose from "mongoose";

// This is a server component
export default async function RoomsPage() {
  const session = await auth();
  
  if (!session?.user) {
    return redirect('/signin');
  }
  
  const userId = session.user.id as string;
  let rooms: IGameRoom[] = [];
  let roomStats: { [key: string]: { participants: number; questions: number } } = {};
  let error = "";
  
  // Fetch game rooms
  const { data: gameRoomsData = [], error: roomsError } = await getGameRooms(userId) || { data: [] };
  if (roomsError) {
    error = `Error fetching game rooms: ${roomsError}`;
  } else {
    rooms = gameRoomsData;
    
    // Get additional stats for each room
    if (rooms.length > 0) {
      for (const room of rooms) {
        const roomId = (room._id as mongoose.Types.ObjectId).toString();
        
        // Get participants count
        const { data: participants = [] } = await getCousinEntries(roomId) || { data: [] };
        
        // Get questions count
        const { data: questions = [] } = await getQuestions(roomId) || { data: [] };
        
        // Store stats
        roomStats[roomId] = {
          participants: participants.length,
          questions: questions.length
        };
      }
    }
  }

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Game Rooms</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create and manage your THR game rooms.
          </p>
        </div>
        <Link href="/dashboard/rooms/new">
          <Button>Create New Room</Button>
        </Link>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </Card>
      )}

      {rooms.length === 0 && !error && (
        <Card className="p-4 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          You don't have any game rooms yet. Create your first room to get started.
        </Card>
      )}

      {/* Rooms List */}
      {rooms.length > 0 && (
        <div className="space-y-4">
          {rooms.map((room) => {
            const roomId = (room._id as mongoose.Types.ObjectId).toString();
            const stats = roomStats[roomId] || { participants: 0, questions: 0 };
            
            return (
              <Card key={roomId} className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {room.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
                          />
                        </svg>
                        Code: {room.code}
                      </span>
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                          />
                        </svg>
                        {stats.participants} {stats.participants === 1 ? 'Participant' : 'Participants'}
                      </span>
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                          />
                        </svg>
                        {stats.questions} {stats.questions === 1 ? 'Question' : 'Questions'}
                      </span>
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                          />
                        </svg>
                        Created: {formatDate(room.createdAt)}
                      </span>
                      <span className={`flex items-center ${room.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={room.isActive 
                              ? "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                              : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"}
                          />
                        </svg>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-wrap sm:flex-nowrap gap-2">
                    <Link href={`/dashboard/rooms/${roomId}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit Room
                      </Button>
                    </Link>
                    <Link href={`/dashboard/rooms/${roomId}/questions`}>
                      <Button variant="outline" size="sm">
                        Questions
                      </Button>
                    </Link>
                    <Link href={`/dashboard/rooms/${roomId}/participants`}>
                      <Button variant="outline" size="sm">
                        Participants
                      </Button>
                    </Link>
                    <Link href={`/game/join/${room.code}`}>
                      <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-800">
                        Join Link
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Reward Tiers Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Reward Tiers</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {room.rewardTiers.map((tier, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tier.name}: {tier.count}% chance
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 