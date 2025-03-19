import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getGameRooms, getThrSpins } from "@/lib/actions";
import { auth } from "@/auth";
import { IGameRoom, RewardTier } from "@/models/GameRoom";
import { IThrSpin } from "@/models/ThrSpin";
import { redirect } from "next/navigation";
import mongoose from "mongoose";

interface RoomWithRewards {
  room: IGameRoom;
  spinCount: number;
  totalReward: number;
}

// This is a server component
export default async function RewardsPage() {
  const session = await auth();
  
  if (!session?.user) {
    return redirect('/signin');
  }
  
  const userId = session.user.id as string;
  let roomsWithRewards: RoomWithRewards[] = [];
  let error = "";
  
  // Fetch game rooms
  const { data: gameRoomsData = [], error: roomsError } = await getGameRooms(userId) || { data: [] };
  if (roomsError) {
    error = `Error fetching game rooms: ${roomsError}`;
  } else {
    const rooms = gameRoomsData;
    
    // Get spin data for each room
    if (rooms.length > 0) {
      const rewardsPromises = rooms.map(async (room) => {
        const roomId = (room._id as mongoose.Types.ObjectId).toString();
        const { data: spinsData = { spins: [], totalEarnings: 0 } } = await getThrSpins(userId, roomId) || { data: { spins: [], totalEarnings: 0 } };
        
        return {
          room,
          spinCount: spinsData.spins.length,
          totalReward: spinsData.totalEarnings
        };
      });
      
      roomsWithRewards = await Promise.all(rewardsPromises);
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">THR Rewards</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage reward tiers and track THR distribution.
          </p>
        </div>
        <div className="flex space-x-2">
          {roomsWithRewards.length > 0 ? (
            <Link href={`/dashboard/rooms/${(roomsWithRewards[0].room._id as mongoose.Types.ObjectId).toString()}/edit`}>
              <Button>Edit Reward Tiers</Button>
            </Link>
          ) : (
            <Link href="/dashboard/rooms/new">
              <Button>Create Game Room</Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </Card>
      )}

      {roomsWithRewards.length === 0 && !error && (
        <Card className="p-4 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          You need to create a game room with reward tiers first.
        </Card>
      )}

      {/* Room Rewards Summary */}
      {roomsWithRewards.length > 0 && (
        <div className="space-y-6">
          {roomsWithRewards.map(({ room, spinCount, totalReward }) => (
            <Card key={(room._id as mongoose.Types.ObjectId).toString()} className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {room.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
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
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                      />
                    </svg>
                    Wheel Spins: {spinCount}
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
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-2.171-1.879-5.721-1.879-7.892 0L2.25 13.5V3h1.5v10.5z"
                      />
                    </svg>
                    Total THR: {formatCurrency(totalReward)}
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
                        d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
                      />
                    </svg>
                    Access Code: {room.code}
                  </span>
                </div>
              </div>

              {/* Reward Tiers */}
              <div className="mt-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Reward Tiers</h4>
                <div className="space-y-2">
                  {room.rewardTiers.map((tier, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {tier.name}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(tier.thrAmount)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${tier.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {tier.probability}% chance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <Link href={`/dashboard/rooms/${(room._id as mongoose.Types.ObjectId).toString()}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Edit Tiers
                  </Button>
                </Link>
                <Link href={`/dashboard/rooms/${(room._id as mongoose.Types.ObjectId).toString()}/spins`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Spins
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 