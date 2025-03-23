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
        // Flatten the grouped questions for the main game room display
        const flattenedQuestions = [
          ...result.data.bronze,
          ...result.data.silver,
          ...result.data.gold
        ];
        
        setQuestions(flattenedQuestions);
        
        // Initialize selected answers
        const answers: Record<string, number | null> = {};
        const answered: Record<string, boolean> = {};
        
        flattenedQuestions.forEach(q => {
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
  
  // Render the questions UI
  const renderQuestionsUI = () => {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl p-4 mb-4 shadow-lg">
          <h1 className="text-2xl font-bold text-center text-white">Family Gacha THR</h1>
          <p className="text-center text-white opacity-90">Answer questions to earn tokens for prizes!</p>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mr-3">
              <span className="text-xl font-bold">🎮</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">Welcome, {userName}!</h2>
              <p className="text-sm text-blue-700">Have fun playing!</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="bg-white rounded-full px-4 py-2 shadow-md border border-blue-100 flex items-center">
              <span className="mr-2">🎖️</span>
              <span className="font-medium">{spinTokens} Tokens</span>
            </div>
            
            <button
              onClick={() => setStep('gacha')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-4 py-2 shadow-md transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">🎡</span>
              <span>Spin Wheel</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow mx-4">
            <p className="font-medium">Oops!</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {questions.map((question) => (
            <div 
              key={question.id} 
              className={`bg-white rounded-xl shadow-md overflow-hidden border-t-4 transition-transform hover:scale-102 ${
                answeredQuestions[question.id] 
                  ? 'border-green-500' 
                  : question.difficulty === 'bronze' 
                    ? 'border-amber-500' 
                    : question.difficulty === 'silver' 
                      ? 'border-gray-400'
                      : 'border-yellow-400'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <span 
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      question.difficulty === 'bronze' 
                        ? 'bg-amber-100 text-amber-800' 
                        : question.difficulty === 'silver' 
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {question.difficulty.toUpperCase()}
                  </span>
                  
                  {answeredQuestions[question.id] && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Answered
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-blue-900 mb-3 line-clamp-2">{question.content}</h3>
                
                {!answeredQuestions[question.id] && (
                  <div className="space-y-2 mt-4">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          selectedAnswers[question.id] === index
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-gray-50 border border-gray-200 hover:bg-blue-50'
                        }`}
                        onClick={() => handleSelectAnswer(question.id, index)}
                      >
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-500 text-white text-center text-sm mr-2">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => submitAnswer(question.id)}
                      disabled={selectedAnswers[question.id] === null || loading}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:from-blue-600 hover:to-blue-800"
                    >
                      {loading ? 'Submitting...' : 'Submit Answer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {questions.length === 0 && (
          <div className="text-center p-8 bg-white rounded-xl shadow-md m-4">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">All Questions Completed!</h3>
            <p className="text-gray-600 mb-6">You've answered all available questions.</p>
            <button
              onClick={() => setStep('gacha')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-colors shadow-md"
            >
              Go to Gacha Wheel
            </button>
          </div>
        )}
      </div>
    );
  };

  // Main render logic
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-blue-200 h-16 w-16 mb-4 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Loading...</h3>
            <p className="text-gray-600">Please wait while we prepare your game.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
          <div className="rounded-full bg-red-100 h-16 w-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Error</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate UI based on current step
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      {step === 'validation' && (
        <div className="flex items-center justify-center h-full">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-blue-200 h-16 w-16 mb-4 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Validating</h3>
              <p className="text-gray-600">Please wait while we validate your entry code.</p>
            </div>
          </div>
        </div>
      )}
      
      {step === 'name' && (
        <div className="flex items-center justify-center h-full">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-2xl font-bold text-center text-blue-900 mb-6">Welcome to Family Gacha!</h3>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="userName">
                What's your name?
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            <button
              onClick={activateEntry}
              disabled={loading || !userName.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Let\'s Start!'}
            </button>
          </div>
        </div>
      )}
      
      {step === 'questions' && renderQuestionsUI()}
      
      {step === 'gacha' && (
        <div className="max-w-4xl mx-auto p-4">
          {showConfetti && <Confetti />}
          
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
  );
} 