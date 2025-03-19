'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TokenDisplay } from './TokenDisplay';
import Link from 'next/link';

interface Question {
  _id: string;
  questionNumber: number;
  question: string;
  options: string[];
}

interface ClientTriviaPageProps {
  roomId: string;
  questions: Question[];
  initialTokenCount: number;
  onAnswerQuestion: (questionId: string, answerIndex: number) => Promise<{ success: boolean }>;
}

export function ClientTriviaPage({ 
  roomId, 
  questions, 
  initialTokenCount,
  onAnswerQuestion 
}: ClientTriviaPageProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const handleAnswer = async (questionId: string, answerIndex: number) => {
    setIsAnswering(true);
    setError(null);
    
    try {
      const result = await onAnswerQuestion(questionId, answerIndex);
      
      if (result.success) {
        // If there are more questions, go to the next one
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          // No more questions, refresh the page to get server-side data
          router.refresh();
        }
      } else {
        setError('Failed to submit answer. Please try again.');
      }
    } catch (err) {
      console.error('Error answering question:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsAnswering(false);
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Trivia Challenge</h2>
        <div className="flex space-x-4 items-center">
          <TokenDisplay roomId={roomId} initialCount={initialTokenCount} />
          {questions.length > 0 && (
            <Link 
              href={`/game/${roomId}/gacha`} 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Gacha
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {questions.length > 0 && currentQuestion ? (
        <Card className="w-full p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Question {currentQuestion.questionNumber}</h3>
            <p className="text-2xl font-bold mb-6">{currentQuestion.question}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => !isAnswering && handleAnswer(currentQuestion._id, index)}
                  disabled={isAnswering}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                >
                  <span className="inline-block w-8 h-8 rounded-full bg-blue-100 text-blue-800 mr-3 text-center leading-8">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="w-full p-6 text-center">
          <h3 className="text-xl font-bold mb-4">All Done!</h3>
          <p className="mb-6">You've answered all available questions.</p>
          <p className="text-lg font-medium mb-4">You have {initialTokenCount} tokens available for spins!</p>
          <Link
            href={`/game/${roomId}/gacha`}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Gacha Wheel
          </Link>
        </Card>
      )}
    </div>
  );
} 