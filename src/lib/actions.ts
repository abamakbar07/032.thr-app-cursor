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