'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  validateCousinEntry, 
  activateCousinEntry, 
  getActiveQuestions, 
  answerQuestion,
  getSpinTokens,
  spinGacha,
  getThrSpins
} from '@/lib/actions';
import Link from 'next/link';
import Confetti from 'react-confetti';

interface Question {
  id: string;
  content: string;
  options: string[];
  difficulty: string;
  isSolved: boolean;
}

interface GachaResult {
  tierName: string;
  thrAmount: number;
}

interface SpinData {
  tierName: string;
  thrAmount: number;
  createdAt: Date;
}

export default function GameRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomId = params?.roomId as string;
  const code = searchParams?.get('code');
  
  const [step, setStep] = useState<'validation' | 'name' | 'questions' | 'gacha'>('validation');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  const [spinTokens, setSpinTokens] = useState(0);
  const [spins, setSpins] = useState<SpinData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Validate the entry code
    const validateEntry = async () => {
      // Wait for params to be available
      if (!roomId || !code) {
        setLoading(false);
        setError('Invalid room or entry code');
        return;
      }
      
      setLoading(true);
      try {
        const result = await validateCousinEntry(roomId, code);
        
        if (!result.success || !result.data) {
          setError(result.error || 'Invalid entry code');
          return;
        }
        
        // If the user has already entered with a userId, go to questions
        if (result.data.entry && result.data.entry.hasEntered && result.data.entry.userId) {
          // Check if we have the user info
          if (result.data.existingUser) {
            setUserName(result.data.existingUser.name);
            setUserId(result.data.existingUser.id);
          } else if (result.data.entry) {
            setUserName(result.data.entry.name);
            setUserId(result.data.entry.userId.toString());
          }
          
          setStep('questions');
          
          // Load questions and spin tokens
          const userIdToUse = result.data.existingUser ? 
            result.data.existingUser.id : 
            result.data.entry.userId.toString();
            
          await loadQuestions(userIdToUse);
          await loadTokensAndSpins(userIdToUse);
        } else if (result.data.entry) {
          // If not entered yet, prompt for name
          setUserName(result.data.entry.name || '');
          setStep('name');
        } else {
          throw new Error('Invalid entry data');
        }
      } catch (err: any) {
        console.error('Validation error:', err);
        setError(err.message || 'An error occurred during validation');
      } finally {
        setLoading(false);
      }
    };
    
    validateEntry();
  }, [roomId, code]);
  
  const activateEntry = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    try {
      const result = await activateCousinEntry(roomId, code as string, userName);
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to activate entry');
        return;
      }
      
      setUserId(result.data.userId);
      setStep('questions');
      
      // Load questions
      await loadQuestions(result.data.userId);
    } catch (err: any) {
      console.error('Activation error:', err);
      setError(err.message || 'An error occurred during activation');
    } finally {
      setLoading(false);
    }
  };
  
  const loadQuestions = async (userId: string) => {
    try {
      const result = await getActiveQuestions(roomId, userId);
      
      if (result.success && result.data) {
        setQuestions(result.data);
        
        // Initialize selected answers
        const answers: Record<string, number | null> = {};
        const answered: Record<string, boolean> = {};
        
        result.data.forEach(q => {
          answers[q.id] = null;
          answered[q.id] = q.isSolved;
        });
        
        setSelectedAnswers(answers);
        setAnsweredQuestions(answered);
      } else {
        console.warn('No questions available or error loading questions');
      }
    } catch (err: any) {
      console.error('Error loading questions:', err);
    }
  };
  
  const loadTokensAndSpins = async (userId: string) => {
    try {
      // Get spin tokens
      const tokenResult = await getSpinTokens(userId, roomId);
      if (tokenResult.success && tokenResult.data) {
        setSpinTokens(tokenResult.data.tokenCount);
      }
      
      // Get spins history
      const spinsResult = await getThrSpins(userId, roomId);
      if (spinsResult.success && spinsResult.data) {
        setSpins(spinsResult.data.spins);
        setTotalEarnings(spinsResult.data.totalEarnings);
      }
    } catch (err: any) {
      console.error('Error loading tokens and spins:', err);
    }
  };
  
  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };
  
  const submitAnswer = async (questionId: string) => {
    const selectedAnswer = selectedAnswers[questionId];
    
    if (selectedAnswer === null) {
      setError('Please select an answer');
      return;
    }
    
    setLoading(true);
    try {
      const result = await answerQuestion(questionId, userId as string, selectedAnswer);
      
      if (result.success && result.data) {
        setAnsweredQuestions(prev => ({
          ...prev,
          [questionId]: true
        }));
        
        // If answer is correct, increment tokens
        if (result.data.isCorrect) {
          setSpinTokens(prev => prev + 1);
        }
        
        // Refresh questions
        await loadQuestions(userId as string);
      } else {
        setError(result.error || 'Failed to submit answer');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSpin = async () => {
    if (spinTokens <= 0) {
      setError('No spin tokens available');
      return;
    }
    
    setIsSpinning(true);
    setLoading(true);
    try {
      const result = await spinGacha(userId as string, roomId);
      
      if (result.success && result.data) {
        // Decrement tokens
        setSpinTokens(prev => prev - 1);
        
        // Show result
        setGachaResult(result.data);
        setShowConfetti(true);
        
        // Update total earnings and spins
        const thrAmount = result.data.thrAmount;
        setTotalEarnings(prev => prev + thrAmount);
        
        const newSpin = {
          tierName: result.data.tierName,
          thrAmount: thrAmount,
          createdAt: new Date()
        };
        
        setSpins(prev => [newSpin, ...prev]);
        
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } else {
        setError(result.error || 'Failed to spin gacha');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setIsSpinning(false);
    }
  };
  
  if (loading && step === 'validation') {
    return <div className="p-8 text-center">Validating your entry...</div>;
  }
  
  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error}</div>
        <Link href="/game/join" className="text-blue-500 hover:underline">
          Return to Join Page
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {showConfetti && <Confetti />}
      
      {step === 'name' && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome to the Family THR Trivia!</h1>
          <p className="mb-4 text-center">Please enter your name to participate:</p>
          
          <div className="mb-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-3 border rounded"
            />
          </div>
          
          <button
            onClick={activateEntry}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded font-medium hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Submitting...' : 'Join Game'}
          </button>
        </div>
      )}
      
      {(step === 'questions' || step === 'gacha') && (
        <div>
          <div className="bg-blue-50 p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Family THR Trivia</h1>
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  <span className="font-bold">{spinTokens}</span> Spin Tokens
                </span>
                <button
                  onClick={() => setStep(step === 'questions' ? 'gacha' : 'questions')}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  {step === 'questions' ? 'Go to Gacha' : 'Answer Questions'}
                </button>
              </div>
            </div>
            <p className="text-sm mt-2">Welcome, {userName}!</p>
          </div>
          
          {step === 'questions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Answer questions to earn Spin Tokens</h2>
              
              {questions.length === 0 ? (
                <div className="bg-yellow-50 p-4 rounded-lg shadow">
                  <p className="text-center">No questions available at the moment.</p>
                </div>
              ) : (
                questions.map((question) => (
                  <div 
                    key={question.id} 
                    className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${
                      answeredQuestions[question.id] 
                        ? 'border-green-500 opacity-60' 
                        : question.difficulty === 'bronze' 
                          ? 'border-yellow-400' 
                          : question.difficulty === 'silver' 
                            ? 'border-gray-400' 
                            : 'border-yellow-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium pr-8">{question.content}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize
                        ${question.difficulty === 'bronze' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : question.difficulty === 'silver' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-yellow-200 text-yellow-900'}
                      `}>
                        {question.difficulty}
                      </span>
                    </div>
                    
                    {answeredQuestions[question.id] ? (
                      <div className="bg-green-50 text-green-700 p-3 rounded">
                        You've already answered this question correctly!
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 mb-4">
                          {question.options.map((option, index) => (
                            <div 
                              key={index}
                              onClick={() => handleSelectAnswer(question.id, index)}
                              className={`p-3 border rounded cursor-pointer transition-colors
                                ${selectedAnswers[question.id] === index 
                                  ? 'bg-blue-50 border-blue-300' 
                                  : 'hover:bg-gray-50'}
                              `}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => submitAnswer(question.id)}
                          disabled={selectedAnswers[question.id] === null || loading}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Submit Answer
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          
          {step === 'gacha' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Gacha Wheel - Spin for THR!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Spin Tokens</p>
                    <p className="text-3xl font-bold">{spinTokens}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total THR Earned</p>
                    <p className="text-3xl font-bold">Rp {totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning || spinTokens <= 0 || loading}
                    className={`px-8 py-4 rounded-full text-lg font-bold transition-transform ${
                      isSpinning 
                        ? 'animate-pulse bg-purple-500 text-white'
                        : spinTokens > 0
                          ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
                  </button>
                </div>
                
                {gachaResult && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg text-center mb-6 animate-bounce">
                    <p className="text-lg">Congratulations! You won:</p>
                    <p className="text-3xl font-bold text-green-600 my-2">
                      Rp {gachaResult.thrAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Tier: {gachaResult.tierName}</p>
                  </div>
                )}
                
                {/* History of spins */}
                {spins.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Your Spin History</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {spins.map((spin, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap">{spin.tierName}</td>
                              <td className="px-4 py-2 whitespace-nowrap">Rp {spin.thrAmount.toLocaleString()}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {new Date(spin.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 