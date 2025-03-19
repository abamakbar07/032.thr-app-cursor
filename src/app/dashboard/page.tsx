import { Card } from "@/components/ui/Card";
import { getGameRooms, getCousinEntries, getQuestions, getThrSpins } from "@/lib/actions";
import { getServerSession } from "next-auth";
import { IThrSpin } from "@/models/ThrSpin";
import { ICousinEntry } from "@/models/CousinEntry";
import { IQuestion } from "@/models/Question";
import { IGameRoom } from "@/models/GameRoom";
import mongoose from "mongoose";
import DashboardUI from "@/components/dashboard/DashboardUI";

// This is a server component
export default async function DashboardPage() {
  const session = await getServerSession();
  const userId = session?.user?.id as string;
  
  // Initialize counters
  let totalEvents = 0;
  let totalParticipants = 0;
  let totalQuestions = 0;
  let totalRewards = 0;
  let recentActivity: Array<{
    type: string;
    description: string;
    time: Date;
    icon: string;
  }> = [];
  
  let connectionError = false;
  let errorMessage = "";

  try {
    // Fetch all data needed for dashboard
    const { data: gameRooms = [], error, connectionError: isConnectionError } = (await getGameRooms(userId)) || { data: [], error: null };
    
    if (error) {
      console.error("Failed to fetch game rooms:", error);
      connectionError = true;
      errorMessage = error;
      
      // If it's specifically a connection error, provide a more helpful message
      if (isConnectionError) {
        errorMessage = "Database connection timeout. The server might be experiencing high load or maintenance. Please try again in a few minutes.";
      }
    } else {
      // Process each game room to get statistics
      await Promise.all(
        gameRooms.map(async (room: IGameRoom) => {
          totalEvents++;
          
          try {
            // Get participants for this room
            const roomId = (room._id as mongoose.Types.ObjectId).toString();
            const { data: participants = [] } = (await getCousinEntries(roomId)) || { data: [] };
            totalParticipants += participants.length;
            
            // Get questions for this room
            const { data: questions = [] } = (await getQuestions(roomId)) || { data: [] };
            totalQuestions += questions.length;
            
            // Get rewards (spins) for this room
            const { data: spinsData = { spins: [] } } = (await getThrSpins(userId, roomId)) || { data: { spins: [] } };
            totalRewards += spinsData.spins.length;
            
            // Add recent activity
            if (room.createdAt) {
              recentActivity.push({
                type: 'event',
                description: `Event "${room.name}" was created`,
                time: new Date(room.createdAt),
                icon: 'calendar',
              });
            }
            
            // Add most recent participants
            participants.slice(0, 3).forEach((participant: ICousinEntry) => {
              if (participant.createdAt) {
                recentActivity.push({
                  type: 'participant',
                  description: `${participant.name || 'A participant'} joined ${room.name}`,
                  time: new Date(participant.createdAt),
                  icon: 'user',
                });
              }
            });
            
            // Add most recent rewards
            spinsData.spins.slice(0, 3).forEach((spin: IThrSpin) => {
              if (spin.createdAt) {
                recentActivity.push({
                  type: 'reward',
                  description: `Someone won a ${spin.tierName || 'prize'} in ${room.name}`,
                  time: new Date(spin.createdAt),
                  icon: 'gift',
                });
              }
            });
          } catch (err) {
            console.error(`Error processing game room ${room._id}:`, err);
          }
        })
      );
      
      // Sort recent activity by time, most recent first
      recentActivity.sort((a, b) => b.time.getTime() - a.time.getTime());
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    connectionError = true;
    errorMessage = "An error occurred while loading the dashboard. Please try again later.";
  }

  return <DashboardUI 
    connectionError={connectionError} 
    errorMessage={errorMessage}
    totalEvents={totalEvents}
    totalParticipants={totalParticipants}
    totalQuestions={totalQuestions}
    totalRewards={totalRewards}
    recentActivity={recentActivity}
  />;
} 