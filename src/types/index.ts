import { IUser } from '@/models/User';
import { IGameRoom, RewardTier } from '@/models/GameRoom';
import { IQuestion } from '@/models/Question';
import { IThrSpin } from '@/models/ThrSpin';
import { ISpinToken } from '@/models/SpinToken';
import { ICousinEntry } from '@/models/CousinEntry';
import { Session } from 'next-auth';

// Extend Next-Auth types for better TypeScript support
declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Question types
export interface QuestionFormData {
  content: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'bronze' | 'silver' | 'gold';
}

export interface QuestionUpload {
  questions: QuestionFormData[];
}

// Gacha types
export interface GachaResult {
  tierName: string;
  thrAmount: number;
}

// Game Room types
export interface GameRoomFormData {
  name: string;
  rewardTiers: RewardTier[];
}

// Cousin Entry types
export interface CousinEntryFormData {
  name: string;
  count: number;
}

export interface CousinEntryWithQR extends ICousinEntry {
  qrCodeUrl: string;
}

// Re-export model interfaces for easier imports
export type {
  IUser,
  IGameRoom,
  RewardTier,
  IQuestion,
  IThrSpin,
  ISpinToken,
  ICousinEntry,
}; 