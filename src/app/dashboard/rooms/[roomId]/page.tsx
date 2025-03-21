'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  getRoomStatistics,
  getQuestionStatistics, 
  getParticipantStats,
  getRewardDistribution
} from '@/lib/actions';
import Link from 'next/link';

interface RoomStats {
  totalEntries: number;
  activeParticipants: number;
  questionStats: {
    bronze: { total: number; solved: number };
    silver: { total: number; solved: number };
    gold: { total: number; solved: number };
  };
  totalQuestions: number;
  solvedQuestions: number;
  totalTokensAwarded: number;
  totalTokensUsed: number;
  totalThrAwarded: number;
  rewardDistribution: {
    name: string;
    count: number;
    awarded: number;
    remaining: number;
    thrAmount: number;
  }[];
}

interface QuestionStat {
  id: string;
  content: string;
  difficulty: string;
  isSolved: boolean;
  solvedBy: {
    userId: string;
    userName: string;
    solvedAt: Date;
  }[];
  solvedAt: Date;
}

interface ParticipantStat {
  id: string;
  name: string;
  solvedQuestions: number;
  tokensEarned: number;
  tokensRemaining: number;
  spins: any[];
  totalEarnings: number;
}

interface RewardTierStat {
  name: string;
  thrAmount: number;
  defined: number;
  awarded: number;
  remaining: number;
  totalAmount: number;
  spins: {
    id: string;
    userId: string;
    userName: string;
    thrAmount: number;
    createdAt: Date;
  }[];
}

interface RewardDistribution {
  tiers: RewardTierStat[];
  totalDefined: number;
  totalAwarded: number;
  totalRemaining: number;
  totalThrAmount: number;
}

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
  const [participantStats, setParticipantStats] = useState<ParticipantStat[]>([]);
  const [rewardDistribution, setRewardDistribution] = useState<RewardDistribution | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (typeof roomId !== 'string') return;
        
        // Fetch room statistics
        const statsResult = await getRoomStatistics(roomId);
        if (!statsResult.success) {
          setError(statsResult.error || 'Failed to fetch room statistics');
          return;
        }
        if (statsResult.data) {
          setRoomStats(statsResult.data);
        }
        
        // Fetch question statistics
        const questionResult = await getQuestionStatistics(roomId);
        if (questionResult.success && questionResult.data) {
          setQuestionStats(questionResult.data);
        }
        
        // Fetch participant statistics
        const participantResult = await getParticipantStats(roomId);
        if (participantResult.success && participantResult.data) {
          setParticipantStats(participantResult.data);
        }
        
        // Fetch reward distribution
        const rewardResult = await getRewardDistribution(roomId);
        if (rewardResult.success && rewardResult.data) {
          setRewardDistribution(rewardResult.data);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [roomId]);
  
  if (loading) {
    return <div className="p-8 text-center">Loading room statistics...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  
  if (!roomStats) {
    return <div className="p-8 text-center">No room data found</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Statistics</h1>
        <div className="flex space-x-2">
          <Link 
            href={`/dashboard/rooms/${roomId}/questions`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Manage Questions
          </Link>
          <Link 
            href={`/dashboard/rooms/${roomId}/entries`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Manage Participants
          </Link>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-2 px-1 ${activeTab === 'questions' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`pb-2 px-1 ${activeTab === 'participants' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Participants
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`pb-2 px-1 ${activeTab === 'rewards' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Rewards
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <h3 className="text-sm uppercase text-gray-500">Participants</h3>
                <p className="text-2xl font-bold">{roomStats.activeParticipants} / {roomStats.totalEntries}</p>
                <p className="text-sm text-gray-500">Active / Total</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg shadow">
                <h3 className="text-sm uppercase text-gray-500">Questions</h3>
                <p className="text-2xl font-bold">{roomStats.solvedQuestions} / {roomStats.totalQuestions}</p>
                <p className="text-sm text-gray-500">Solved / Total</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg shadow">
                <h3 className="text-sm uppercase text-gray-500">Total THR Awarded</h3>
                <p className="text-2xl font-bold">Rp {roomStats.totalThrAwarded.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{roomStats.totalTokensUsed} Spins Used</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Question Completion by Difficulty</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg shadow">
                  <h4 className="font-medium">Bronze</h4>
                  <p className="text-xl">{roomStats.questionStats.bronze.solved} / {roomStats.questionStats.bronze.total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-yellow-400 h-2.5 rounded-full" 
                      style={{ width: `${roomStats.questionStats.bronze.total ? (roomStats.questionStats.bronze.solved / roomStats.questionStats.bronze.total * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                  <h4 className="font-medium">Silver</h4>
                  <p className="text-xl">{roomStats.questionStats.silver.solved} / {roomStats.questionStats.silver.total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-gray-400 h-2.5 rounded-full" 
                      style={{ width: `${roomStats.questionStats.silver.total ? (roomStats.questionStats.silver.solved / roomStats.questionStats.silver.total * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-yellow-100 p-4 rounded-lg shadow">
                  <h4 className="font-medium">Gold</h4>
                  <p className="text-xl">{roomStats.questionStats.gold.solved} / {roomStats.questionStats.gold.total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${roomStats.questionStats.gold.total ? (roomStats.questionStats.gold.solved / roomStats.questionStats.gold.total * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Reward Distribution</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Awarded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roomStats.rewardDistribution.map((tier, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{tier.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Rp {tier.thrAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tier.awarded}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tier.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'questions' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Question Status</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solved By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questionStats.map((question) => (
                    <tr key={question.id}>
                      <td className="px-6 py-4">{question.content}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{question.difficulty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {question.isSolved ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Solved
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Unsolved
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {question.solvedBy.length > 0 ? (
                          <div>
                            {question.solvedBy.map((solver, i) => (
                              <div key={i} className="text-sm">
                                {solver.userName}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'participants' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Participant Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions Solved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Earned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Remaining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total THR</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participantStats.map((participant) => (
                    <tr key={participant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{participant.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{participant.solvedQuestions}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{participant.tokensEarned}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{participant.tokensRemaining}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Rp {participant.totalEarnings.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'rewards' && rewardDistribution && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Reward Distribution</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Defined</p>
                  <p className="text-xl font-semibold">{rewardDistribution.totalDefined}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Awarded</p>
                  <p className="text-xl font-semibold">{rewardDistribution.totalAwarded}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total THR Amount</p>
                  <p className="text-xl font-semibold">Rp {rewardDistribution.totalThrAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {rewardDistribution.tiers.map((tier, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{tier.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Rp {tier.thrAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex text-sm text-gray-500 mt-1 space-x-4">
                      <span>Defined: {tier.defined}</span>
                      <span>Awarded: {tier.awarded}</span>
                      <span>Remaining: {tier.remaining}</span>
                    </div>
                  </div>
                  
                  {tier.spins.length > 0 && (
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-2">Award History</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tier.spins.map((spin, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{spin.userName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">Rp {spin.thrAmount.toLocaleString()}</td>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 