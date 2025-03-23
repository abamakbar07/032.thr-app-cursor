import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import { auth } from '@/auth';

// GET /api/rooms/[roomId]/questions
// Get questions for a room, grouped by difficulty
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { roomId } = params;
    const userId = session.user.id as string;

    await connectToDatabase();

    // Get questions that are not solved or not solved by this user
    const questions = await Question.find({ 
      roomId: new mongoose.Types.ObjectId(roomId),
      $or: [
        { isSolved: false },
        { isSolved: true, solvedBy: { $ne: new mongoose.Types.ObjectId(userId) } }
      ]
    }).sort({ difficulty: 1, createdAt: 1 });
    
    // Group questions by difficulty tier
    const groupedQuestions = {
      bronze: questions.filter(q => q.difficulty === 'bronze'),
      silver: questions.filter(q => q.difficulty === 'silver'),
      gold: questions.filter(q => q.difficulty === 'gold')
    };

    return NextResponse.json(groupedQuestions);
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 