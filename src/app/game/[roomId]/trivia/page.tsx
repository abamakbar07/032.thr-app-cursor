import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getActiveQuestions, answerQuestion, getSpinTokens } from '@/lib/actions';
import { ClientTriviaPage } from '@/components/game/ClientTriviaPage';

export default async function TriviaPage({ params }: { params: { roomId: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/signin');
  }

  const roomId = params.roomId;
  const userId = session.user.id as string;
  
  // Get active questions for the user in this room
  const questionsResponse = await getActiveQuestions(roomId, userId);
  
  if (!questionsResponse.success) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
          <p className="mb-6">
            {questionsResponse.error || "There are no questions available for you right now."}
          </p>
        </div>
      </div>
    );
  }

  const questions = questionsResponse.data || [];
  
  // Get user's current token balance
  const tokensResponse = await getSpinTokens(userId, roomId);
  const tokenCount = tokensResponse.success ? tokensResponse.data.count : 0;
  
  // Server action for answering questions
  async function handleAnswerQuestion(questionId: string, answerIndex: number) {
    'use server';
    
    const result = await answerQuestion(questionId, userId, answerIndex);
    return { success: result.success };
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50">
      <ClientTriviaPage
        roomId={roomId}
        questions={questions}
        initialTokenCount={tokenCount}
        onAnswerQuestion={handleAnswerQuestion}
      />
    </div>
  );
} 