import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { getGameRooms, getQuestions } from "@/lib/actions";
import { getServerSession } from "next-auth";
import { IQuestion } from "@/models/Question";
import { IGameRoom } from "@/models/GameRoom";
import { redirect } from "next/navigation";
import mongoose from "mongoose";

// Extended question interface to include room name
interface ExtendedQuestion extends IQuestion {
  roomName?: string;
}

// This is a server component
export default async function QuestionsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return redirect('/signin');
  }
  
  const userId = session.user.id as string;
  let allQuestions: ExtendedQuestion[] = [];
  let rooms: IGameRoom[] = [];
  let error = "";
  
  // Fetch game rooms
  const { data: gameRoomsData = [], error: roomsError } = await getGameRooms(userId) || { data: [] };
  if (roomsError) {
    error = `Error fetching game rooms: ${roomsError}`;
  } else {
    rooms = gameRoomsData;
    
    // Fetch questions for each room
    if (rooms.length > 0) {
      const fetchPromises = rooms.map(async (room) => {
        const roomId = (room._id as mongoose.Types.ObjectId).toString();
        const { data: roomQuestions = [] } = await getQuestions(roomId) || { data: [] };
        return roomQuestions.map((q: IQuestion) => ({
          ...q,
          roomName: room.name,
        }));
      });
      
      const questionsArrays = await Promise.all(fetchPromises);
      allQuestions = questionsArrays.flat() as ExtendedQuestion[];
    }
  }
  
  const difficultyLabels: { [key: string]: string } = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Questions</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage trivia questions for your game rooms.
          </p>
        </div>
        <div className="flex space-x-2">
          {rooms.length > 0 ? (
            <Link href={`/dashboard/rooms/${(rooms[0]._id as mongoose.Types.ObjectId).toString()}/questions/new`}>
              <Button>Add New Question</Button>
            </Link>
          ) : (
            <Link href="/dashboard/rooms/new">
              <Button>Create Game Room First</Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </Card>
      )}

      {rooms.length === 0 && !error && (
        <Card className="p-4 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          You need to create a game room before adding questions.
        </Card>
      )}

      {/* Questions List */}
      {allQuestions.length > 0 ? (
        <div className="space-y-4">
          {allQuestions.map((q) => (
            <Card key={(q._id as mongoose.Types.ObjectId).toString()} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {q.content}
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      (Room: {q.roomName})
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {q.options.map((option, idx) => (
                      <div key={idx} className={`p-2 rounded-md text-sm ${idx === q.correctAnswer ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {idx === q.correctAnswer && (
                          <span className="mr-2 font-bold">✓</span>
                        )}
                        {option}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
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
                          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                        />
                      </svg>
                      {difficultyLabels[q.difficulty] || q.difficulty}
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
                          d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                        />
                      </svg>
                      {q.isSolved ? "Solved" : "Active"}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/rooms/${(q.roomId as mongoose.Types.ObjectId).toString()}/questions/${(q._id as mongoose.Types.ObjectId).toString()}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        rooms.length > 0 && (
          <Card className="p-4 text-center text-slate-500 dark:text-slate-400">
            No questions found. Add your first question to get started.
          </Card>
        )
      )}
    </div>
  );
} 