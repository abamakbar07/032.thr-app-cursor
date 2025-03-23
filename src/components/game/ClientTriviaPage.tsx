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
  difficulty: 'bronze' | 'silver' | 'gold';
}

interface GroupedQuestions {
  bronze: Question[];
  silver: Question[];
  gold: Question[];
}

interface ClientTriviaPageProps {
  roomId: string;
  questions: GroupedQuestions;
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
  const [selectedTier, setSelectedTier] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const totalQuestions = 
    questions.bronze.length + 
    questions.silver.length + 
    questions.gold.length;
  
  const handleSelectTier = (tier: 'bronze' | 'silver' | 'gold') => {
    setSelectedTier(tier);
    setCurrentQuestion(null);
  };
  
  const handleSelectQuestion = (question: Question) => {
    setCurrentQuestion(question);
  };
  
  const handleAnswer = async (questionId: string, answerIndex: number) => {
    setIsAnswering(true);
    setError(null);
    
    try {
      const result = await onAnswerQuestion(questionId, answerIndex);
      
      if (result.success) {
        // Reset current question after answering
        setCurrentQuestion(null);
        
        // Refresh to get the latest data
        router.refresh();
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

  // Render tier selection UI
  const renderTierSelection = () => {
    return (
      <div className="w-full p-6">
        <h3 className="text-xl font-bold mb-6 text-center">Choose a Question Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleSelectTier('bronze')}
            className="p-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 text-white font-bold transition-transform hover:scale-105 shadow-lg"
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="text-2xl mb-2">Bronze</div>
              <div className="text-sm">{questions.bronze.length} Questions</div>
            </div>
          </button>
          
          <button 
            onClick={() => handleSelectTier('silver')}
            className="p-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold transition-transform hover:scale-105 shadow-lg"
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="text-2xl mb-2">Silver</div>
              <div className="text-sm">{questions.silver.length} Questions</div>
            </div>
          </button>
          
          <button 
            onClick={() => handleSelectTier('gold')}
            className="p-8 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-600 text-white font-bold transition-transform hover:scale-105 shadow-lg"
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🥇</div>
              <div className="text-2xl mb-2">Gold</div>
              <div className="text-sm">{questions.gold.length} Questions</div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Render question selection UI for a specific tier
  const renderQuestionList = () => {
    if (!selectedTier) return null;
    
    const tierQuestions = questions[selectedTier];
    
    return (
      <div className="w-full">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setSelectedTier(null)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Categories
          </button>
        </div>
        
        <h3 className="text-xl font-bold mb-4">
          {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Questions
        </h3>
        
        {tierQuestions.length === 0 ? (
          <p className="text-center py-8">No questions available in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tierQuestions.map((question, index) => (
              <button
                key={question._id}
                onClick={() => handleSelectQuestion(question)}
                className="p-4 rounded-lg bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left shadow"
              >
                <div className="font-semibold mb-2">Question {index + 1}</div>
                <div className="text-gray-600 line-clamp-2">{question.question}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render a specific question to answer
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    return (
      <div className="w-full">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setCurrentQuestion(null)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Questions
          </button>
        </div>
        
        <Card className="w-full p-6 bg-white rounded-xl shadow-lg border-t-4 border-blue-500">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" 
                style={{
                  backgroundColor: 
                    currentQuestion.difficulty === 'bronze' ? '#cd7f32' : 
                    currentQuestion.difficulty === 'silver' ? '#C0C0C0' : 
                    '#FFD700',
                  color: 
                    currentQuestion.difficulty === 'bronze' ? 'white' : 
                    currentQuestion.difficulty === 'silver' ? 'white' : 
                    'black'
                }}>
                {currentQuestion.difficulty.toUpperCase()}
              </span>
            </div>
            <p className="text-2xl font-bold mb-6">{currentQuestion.question}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => !isAnswering && handleAnswer(currentQuestion._id, index)}
                  disabled={isAnswering}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 flex items-center"
                >
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-800">Trivia Challenge</h2>
        <div className="flex space-x-4 items-center">
          <TokenDisplay roomId={roomId} initialCount={initialTokenCount} />
          <Link 
            href={`/game/${roomId}/gacha`} 
            className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-colors shadow-md"
          >
            Go to Gacha
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {totalQuestions === 0 ? (
        <Card className="w-full p-6 text-center bg-white rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">All Done!</h3>
          <p className="mb-6">There are no questions available for you right now.</p>
          <p className="text-lg font-medium mb-4">You have {initialTokenCount} tokens available for spins!</p>
          <Link
            href={`/game/${roomId}/gacha`}
            className="inline-block px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-colors shadow-md"
          >
            Go to Gacha Wheel
          </Link>
        </Card>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Show question if selected */}
          {currentQuestion ? renderQuestion() : 
           /* Show questions list if tier selected */
           selectedTier ? renderQuestionList() :
           /* Show tier selection if nothing selected */
           renderTierSelection()}
        </div>
      )}
    </div>
  );
} 