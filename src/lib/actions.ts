'use server';

import { connectToDatabase } from './db';
import User from '@/models/User';
import GameRoom from '@/models/GameRoom';
import Question from '@/models/Question';
import SpinToken from '@/models/SpinToken';
import ThrSpin from '@/models/ThrSpin';
import CousinEntry from '@/models/CousinEntry';
import { generateRoomCode, generateEntryCode, generateQRCode, selectRandomRewardTier } from '@/utils/helpers';
import { 
  QuestionFormData, 
  GameRoomFormData, 
  CousinEntryFormData,
  CousinEntryWithQR,
  GachaResult
} from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// User actions
export async function createAdmin(name: string, email: string, password: string) {
  try {
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return { success: false, error: 'Admin already exists' };
    }
    
    // Create new admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });
    
    return { 
      success: true, 
      data: { 
        id: user._id.toString() // Convert ObjectId to string
      } 
    };
  } catch (error: any) {
    console.error('Create admin error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create admin' 
    };
  }
}

// Game Room actions
export async function createGameRoom(formData: GameRoomFormData, creatorId: string) {
  try {
    await connectToDatabase();
    
    const code = generateRoomCode();
    
    const gameRoom = await GameRoom.create({
      name: formData.name,
      code,
      createdBy: new mongoose.Types.ObjectId(creatorId),
      rewardTiers: formData.rewardTiers,
    });
    
    revalidatePath('/dashboard');
    return { success: true, data: gameRoom };
  } catch (error: any) {
    console.error('Create game room error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create game room' 
    };
  }
}

export async function getGameRooms(userId: string) {
  try {
    await connectToDatabase();
    
    const gameRooms = await GameRoom.find({ 
      createdBy: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });
    
    return { success: true, data: gameRooms };
  } catch (error: any) {
    console.error('Get game rooms error:', error);
    
    // Check for connection timeout errors
    if (error.name === 'MongooseServerSelectionError' || 
        error.message?.includes('ETIMEOUT') || 
        error.code === 'ETIMEOUT') {
      return { 
        success: false, 
        error: 'Database connection timeout. Please try again later.',
        connectionError: true
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to get game rooms' 
    };
  }
}

export async function getGameRoom(roomIdOrCode: string) {
  try {
    await connectToDatabase();
    
    let gameRoom;
    
    // Check if the input is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(roomIdOrCode);
    
    if (isValidObjectId) {
      // If it's a valid ObjectId, search by _id
      gameRoom = await GameRoom.findById(roomIdOrCode);
    } else {
      // If it's not a valid ObjectId, assume it's a room code
      gameRoom = await GameRoom.findOne({ code: roomIdOrCode });
    }
    
    if (!gameRoom) {
      return { success: false, error: 'Game room not found' };
    }
    
    return { success: true, data: gameRoom };
  } catch (error: any) {
    console.error('Get game room error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get game room' 
    };
  }
}

// Question actions
export async function createQuestion(roomId: string, formData: QuestionFormData) {
  try {
    await connectToDatabase();
    
    const question = await Question.create({
      roomId: new mongoose.Types.ObjectId(roomId),
      content: formData.content,
      options: formData.options,
      correctAnswer: formData.correctAnswer,
      difficulty: formData.difficulty,
    });
    
    revalidatePath(`/admin/rooms/${roomId}`);
    return { success: true, data: question };
  } catch (error: any) {
    console.error('Create question error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create question' 
    };
  }
}

export async function bulkCreateQuestions(roomId: string, questions: QuestionFormData[]) {
  try {
    await connectToDatabase();
    
    const questionDocs = questions.map(q => ({
      roomId: new mongoose.Types.ObjectId(roomId),
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
    }));
    
    const result = await Question.insertMany(questionDocs);
    
    revalidatePath(`/admin/rooms/${roomId}`);
    return { success: true, data: { count: result.length } };
  } catch (error: any) {
    console.error('Bulk create questions error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create questions' 
    };
  }
}

export async function getQuestions(roomId: string) {
  try {
    await connectToDatabase();
    
    const questions = await Question.find({ 
      roomId: new mongoose.Types.ObjectId(roomId) 
    }).sort({ difficulty: 1, createdAt: 1 });
    
    return { success: true, data: questions };
  } catch (error: any) {
    console.error('Get questions error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get questions' 
    };
  }
}

export async function getActiveQuestions(roomId: string, userId: string) {
  try {
    await connectToDatabase();
    
    // Get questions that are not solved or not solved by this user
    const questions = await Question.find({ 
      roomId: new mongoose.Types.ObjectId(roomId),
      $or: [
        { isSolved: false },
        { isSolved: true, solvedBy: { $ne: new mongoose.Types.ObjectId(userId) } }
      ]
    }).sort({ difficulty: 1, createdAt: 1 });
    
    return { success: true, data: questions };
  } catch (error: any) {
    console.error('Get active questions error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get active questions' 
    };
  }
}

export async function answerQuestion(questionId: string, userId: string, answerIndex: number) {
  try {
    await connectToDatabase();
    
    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return { success: false, error: 'Question not found' };
    }
    
    // Check if the question is already solved by this user
    if (question.solvedBy.includes(new mongoose.Types.ObjectId(userId))) {
      return { success: false, error: 'You have already answered this question' };
    }
    
    // Check if the answer is correct
    const isCorrect = question.correctAnswer === answerIndex;
    
    if (isCorrect) {
      // Mark question as solved and add user to solvedBy array
      question.isSolved = true;
      question.solvedBy.push(new mongoose.Types.ObjectId(userId));
      await question.save();
      
      // Award a spin token
      await updateSpinTokens(userId, question.roomId.toString(), 1);
      
      return { success: true, data: { isCorrect: true } };
    } else {
      // Add user to solvedBy array to prevent retries
      question.solvedBy.push(new mongoose.Types.ObjectId(userId));
      await question.save();
      
      return { success: true, data: { isCorrect: false } };
    }
  } catch (error: any) {
    console.error('Answer question error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to answer question' 
    };
  }
}

// Spin Token actions
export async function getSpinTokens(userId: string, roomId: string) {
  try {
    await connectToDatabase();
    
    let spinToken = await SpinToken.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: new mongoose.Types.ObjectId(roomId),
    });
    
    if (!spinToken) {
      spinToken = await SpinToken.create({
        userId: new mongoose.Types.ObjectId(userId),
        roomId: new mongoose.Types.ObjectId(roomId),
        tokenCount: 0,
      });
    }
    
    return { success: true, data: spinToken };
  } catch (error: any) {
    console.error('Get spin tokens error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get spin tokens' 
    };
  }
}

export async function updateSpinTokens(userId: string, roomId: string, amount: number) {
  try {
    await connectToDatabase();
    
    // Find or create the spin token document
    let spinToken = await SpinToken.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: new mongoose.Types.ObjectId(roomId),
    });
    
    if (!spinToken) {
      spinToken = new SpinToken({
        userId: new mongoose.Types.ObjectId(userId),
        roomId: new mongoose.Types.ObjectId(roomId),
        tokenCount: 0,
      });
    }
    
    // Update token count
    spinToken.tokenCount += amount;
    if (spinToken.tokenCount < 0) {
      spinToken.tokenCount = 0; // Prevent negative tokens
    }
    
    await spinToken.save();
    
    revalidatePath(`/game/${roomId}`);
    return { success: true, data: spinToken };
  } catch (error: any) {
    console.error('Update spin tokens error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update spin tokens' 
    };
  }
}

// THR Spin actions
export async function spinGacha(userId: string, roomId: string): Promise<{ success: boolean, data?: GachaResult, error?: string }> {
  try {
    await connectToDatabase();
    
    // Check if user has tokens
    const spinTokenResult = await getSpinTokens(userId, roomId);
    if (!spinTokenResult.success || !spinTokenResult.data) {
      return { success: false, error: 'Failed to get spin tokens' };
    }
    
    const spinToken = spinTokenResult.data;
    if (spinToken.tokenCount <= 0) {
      return { success: false, error: 'No spin tokens available' };
    }
    
    // Get game room for reward tiers
    const gameRoomResult = await getGameRoom(roomId);
    if (!gameRoomResult.success || !gameRoomResult.data) {
      return { success: false, error: 'Failed to get game room' };
    }
    
    const gameRoom = gameRoomResult.data;
    
    // Select a random reward tier
    const selectedTier = selectRandomRewardTier(gameRoom.rewardTiers);
    if (!selectedTier) {
      return { success: false, error: 'No reward tiers available' };
    }
    
    // Record the spin result
    await ThrSpin.create({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: new mongoose.Types.ObjectId(roomId),
      tierName: selectedTier.name,
      thrAmount: selectedTier.thrAmount,
    });
    
    // Deduct a token
    await updateSpinTokens(userId, roomId, -1);
    
    return { 
      success: true, 
      data: {
        tierName: selectedTier.name,
        thrAmount: selectedTier.thrAmount,
      }
    };
  } catch (error: any) {
    console.error('Spin gacha error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to spin gacha' 
    };
  }
}

export async function getThrSpins(userId: string, roomId: string) {
  try {
    await connectToDatabase();
    
    const spins = await ThrSpin.find({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: new mongoose.Types.ObjectId(roomId),
    }).sort({ createdAt: -1 });
    
    // Calculate total earnings
    const totalEarnings = spins.reduce((sum: number, spin: any) => sum + spin.thrAmount, 0);
    
    return { 
      success: true, 
      data: { 
        spins,
        totalEarnings,
      }
    };
  } catch (error: any) {
    console.error('Get THR spins error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get THR spins' 
    };
  }
}

// Cousin Entry actions
export async function createCousinEntries(roomId: string, formData: CousinEntryFormData): Promise<{ success: boolean, data?: CousinEntryWithQR[], error?: string }> {
  try {
    await connectToDatabase();
    
    const entries: CousinEntryWithQR[] = [];
    
    // Create the specified number of entries
    for (let i = 0; i < formData.count; i++) {
      const code = generateEntryCode();
      
      const entry = await CousinEntry.create({
        roomId: new mongoose.Types.ObjectId(roomId),
        code,
        name: `${formData.name} ${i + 1}`,
        isActive: true,
        hasEntered: false,
      });
      
      // Generate QR code
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const entryUrl = `${appUrl}/game/${roomId}?code=${code}`;
      const qrCodeUrl = await generateQRCode(entryUrl);
      
      entries.push({
        ...entry.toObject(),
        qrCodeUrl,
      });
    }
    
    revalidatePath(`/admin/rooms/${roomId}/entries`);
    return { success: true, data: entries };
  } catch (error: any) {
    console.error('Create cousin entries error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create cousin entries' 
    };
  }
}

export async function getCousinEntries(roomId: string) {
  try {
    await connectToDatabase();
    
    const entries = await CousinEntry.find({
      roomId: new mongoose.Types.ObjectId(roomId),
    }).sort({ createdAt: -1 });
    
    return { success: true, data: entries };
  } catch (error: any) {
    console.error('Get cousin entries error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get cousin entries' 
    };
  }
}

export async function validateCousinEntry(roomId: string, code: string) {
  try {
    await connectToDatabase();
    
    const entry = await CousinEntry.findOne({
      roomId: new mongoose.Types.ObjectId(roomId),
      code,
      isActive: true,
    });
    
    if (!entry) {
      return { success: false, error: 'Invalid entry code' };
    }
    
    // If entry already used, check if there's a user associated
    if (entry.hasEntered && entry.userId) {
      const user = await User.findById(entry.userId);
      if (user) {
        return { 
          success: true, 
          data: { 
            entry,
            existingUser: { 
              id: user._id.toString(), 
              name: user.name 
            }
          }
        };
      }
    }
    
    return { success: true, data: { entry } };
  } catch (error: any) {
    console.error('Validate cousin entry error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to validate entry' 
    };
  }
}

export async function activateCousinEntry(roomId: string, code: string, userName: string) {
  try {
    await connectToDatabase();
    
    // Find the entry
    const entry = await CousinEntry.findOne({
      roomId: new mongoose.Types.ObjectId(roomId),
      code,
      isActive: true,
    });
    
    if (!entry) {
      return { success: false, error: 'Invalid entry code' };
    }
    
    if (entry.hasEntered && entry.userId) {
      // Entry already activated, return the existing user
      const user = await User.findById(entry.userId);
      if (user) {
        return { 
          success: true, 
          data: { 
            userId: user._id.toString() 
          } 
        };
      }
    }
    
    // Create a new cousin user
    const password = uuidv4(); // Generate a random password
    const user = await User.create({
      name: userName || entry.name,
      email: `${code}@example.com`, // Use code as part of the email
      password,
      role: 'cousin',
      roomId,
    });
    
    // Update the entry
    entry.hasEntered = true;
    entry.userId = user._id;
    await entry.save();
    
    return { 
      success: true, 
      data: { 
        userId: user._id.toString() 
      } 
    };
  } catch (error: any) {
    console.error('Activate cousin entry error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to activate entry' 
    };
  }
}

// Room Statistics actions
export async function getRoomStatistics(roomId: string) {
  try {
    await connectToDatabase();
    
    // Convert string ID to ObjectId
    const roomObjId = new mongoose.Types.ObjectId(roomId);
    
    // Get game room data
    const gameRoom = await GameRoom.findById(roomObjId);
    if (!gameRoom) {
      return { success: false, error: 'Game room not found' };
    }
    
    // Get all questions for this room
    const questions = await Question.find({ roomId: roomObjId });
    
    // Get all cousin entries for this room
    const entries = await CousinEntry.find({ roomId: roomObjId });
    const activeEntries = entries.filter(entry => entry.hasEntered);
    
    // Get all spin tokens for this room
    const spinTokens = await SpinToken.aggregate([
      { $match: { roomId: roomObjId } },
      { $group: { _id: null, totalTokens: { $sum: "$tokenCount" } } }
    ]);
    
    // Get all THR spins for this room
    const thrSpins = await ThrSpin.find({ roomId: roomObjId });
    
    // Calculate statistics
    const totalTokensAwarded = spinTokens.length > 0 ? spinTokens[0].totalTokens : 0;
    const totalTokensUsed = thrSpins.length;
    const totalThrAwarded = thrSpins.reduce((sum, spin) => sum + spin.thrAmount, 0);
    
    // Question completion statistics by difficulty
    const questionStats = {
      bronze: { total: 0, solved: 0 },
      silver: { total: 0, solved: 0 },
      gold: { total: 0, solved: 0 }
    };
    
    questions.forEach(q => {
      questionStats[q.difficulty as keyof typeof questionStats].total += 1;
      if (q.isSolved) questionStats[q.difficulty as keyof typeof questionStats].solved += 1;
    });
    
    // Reward tier distribution
    const rewardDistribution = gameRoom.rewardTiers.map((tier: { name: string, count: number, thrAmount: number }) => {
      const tiersAwarded = thrSpins.filter(spin => spin.tierName === tier.name).length;
      return {
        name: tier.name,
        count: tier.count,
        awarded: tiersAwarded,
        remaining: tier.count - tiersAwarded,
        thrAmount: tier.thrAmount
      };
    });
    
    return { 
      success: true, 
      data: {
        totalEntries: entries.length,
        activeParticipants: activeEntries.length,
        questionStats,
        totalQuestions: questions.length,
        solvedQuestions: questions.filter(q => q.isSolved).length,
        totalTokensAwarded,
        totalTokensUsed,
        totalThrAwarded,
        rewardDistribution
      } 
    };
  } catch (error: any) {
    console.error('Get room statistics error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get room statistics' 
    };
  }
}

// Get detailed question statistics with participant information
export async function getQuestionStatistics(roomId: string) {
  try {
    await connectToDatabase();
    
    const roomObjId = new mongoose.Types.ObjectId(roomId);
    
    // Get all questions for this room with detailed solve information
    const questions = await Question.find({ roomId: roomObjId })
      .sort({ difficulty: 1, createdAt: 1 });
    
    // Get all users who participated in this room
    const entryDetails = await CousinEntry.find({ 
      roomId: roomObjId,
      hasEntered: true
    });
    
    // Map user IDs to names for easier referencing
    const userMap: Record<string, string> = entryDetails.reduce((map: Record<string, string>, entry) => {
      if (entry.userId) {
        map[entry.userId.toString()] = entry.name;
      }
      return map;
    }, {});
    
    // Build detailed question statistics
    const questionStats = await Promise.all(questions.map(async (q) => {
      const solvedByDetails = await Promise.all(q.solvedBy.map(async (userId: mongoose.Types.ObjectId) => {
        const userName = userMap[userId.toString()] || 'Unknown';
        
        // Find when this user solved this question (the ThrSpin record)
        const timeStamp = q.updatedAt;
        
        return {
          userId: userId.toString(),
          userName,
          solvedAt: timeStamp
        };
      }));
      
      return {
        id: q._id.toString(),
        content: q.content,
        difficulty: q.difficulty,
        isSolved: q.isSolved,
        solvedBy: solvedByDetails,
        solvedAt: q.updatedAt
      };
    }));
    
    return { success: true, data: questionStats };
  } catch (error: any) {
    console.error('Get question statistics error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get question statistics' 
    };
  }
}

// Get participant performance in a room
export async function getParticipantStats(roomId: string) {
  try {
    await connectToDatabase();
    
    const roomObjId = new mongoose.Types.ObjectId(roomId);
    
    // Get all participants
    const participants = await CousinEntry.find({
      roomId: roomObjId,
      hasEntered: true
    });
    
    // Build detailed stats for each participant
    const participantStats = await Promise.all(participants.map(async (p) => {
      // Skip participants without user IDs
      if (!p.userId) {
        return {
          id: p._id.toString(),
          name: p.name,
          solvedQuestions: 0,
          tokensEarned: 0,
          tokensRemaining: 0,
          spins: [],
          totalEarnings: 0
        };
      }
      
      // Get questions solved by this participant
      const solvedQuestions = await Question.find({
        roomId: roomObjId,
        solvedBy: p.userId
      });
      
      // Get spin tokens for this participant
      const spinTokenResult = await getSpinTokens(p.userId.toString(), roomId);
      const tokensRemaining = spinTokenResult.success ? spinTokenResult.data.tokenCount : 0;
      
      // Get THR spins for this participant
      const thrSpinsResult = await getThrSpins(p.userId.toString(), roomId);
      const spins = thrSpinsResult.success && thrSpinsResult.data ? thrSpinsResult.data.spins : [];
      const totalEarnings = thrSpinsResult.success && thrSpinsResult.data ? thrSpinsResult.data.totalEarnings : 0;
      
      // Calculate tokens earned based on questions solved
      const tokensEarned = solvedQuestions.length;
      
      return {
        id: p._id.toString(),
        name: p.name,
        solvedQuestions: solvedQuestions.length,
        tokensEarned,
        tokensRemaining,
        spins,
        totalEarnings
      };
    }));
    
    return { success: true, data: participantStats };
  } catch (error: any) {
    console.error('Get participant stats error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get participant statistics' 
    };
  }
}

// Get reward distribution statistics
export async function getRewardDistribution(roomId: string) {
  try {
    await connectToDatabase();
    
    const roomObjId = new mongoose.Types.ObjectId(roomId);
    
    // Get game room details
    const gameRoom = await GameRoom.findById(roomObjId);
    if (!gameRoom) {
      return { success: false, error: 'Game room not found' };
    }
    
    // Get all THR spins for this room
    const thrSpins = await ThrSpin.find({ roomId: roomObjId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    // Group spins by tier
    const tierMap: Record<string, { name: string, spins: any[], count: number, total: number }> = {};
    
    thrSpins.forEach(spin => {
      if (!tierMap[spin.tierName]) {
        tierMap[spin.tierName] = {
          name: spin.tierName,
          spins: [],
          count: 0,
          total: 0
        };
      }
      
      tierMap[spin.tierName].spins.push({
        id: spin._id.toString(),
        userId: spin.userId.toString(),
        userName: (spin.userId as any).name || 'Unknown',
        thrAmount: spin.thrAmount,
        createdAt: spin.createdAt
      });
      
      tierMap[spin.tierName].count++;
      tierMap[spin.tierName].total += spin.thrAmount;
    });
    
    // Format the data with defined and awarded tiers
    const rewardDistribution = gameRoom.rewardTiers.map((tier: { name: string, count: number, thrAmount: number }) => {
      const tierData = tierMap[tier.name] || { name: tier.name, spins: [], count: 0, total: 0 };
      
      return {
        name: tier.name,
        thrAmount: tier.thrAmount,
        defined: tier.count,
        awarded: tierData.count,
        remaining: tier.count - tierData.count,
        spins: tierData.spins,
        totalAmount: tierData.total
      };
    });
    
    // Calculate overall statistics
    const totalDefined = gameRoom.rewardTiers.reduce((sum: number, tier: { name: string, count: number, thrAmount: number }) => sum + tier.count, 0);
    const totalAwarded = thrSpins.length;
    const totalThrAmount = thrSpins.reduce((sum, spin) => sum + spin.thrAmount, 0);
    
    return { 
      success: true, 
      data: {
        tiers: rewardDistribution,
        totalDefined,
        totalAwarded,
        totalRemaining: totalDefined - totalAwarded,
        totalThrAmount
      } 
    };
  } catch (error: any) {
    console.error('Get reward distribution error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get reward distribution' 
    };
  }
} 