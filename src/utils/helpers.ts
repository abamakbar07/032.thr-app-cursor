import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { RewardTier } from '@/models/GameRoom';

/**
 * Generate a unique room code
 */
export function generateRoomCode(): string {
  // Generate a 6-character alphanumeric code
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Generate a unique entry code for cousins
 */
export function generateEntryCode(): string {
  // Generate a 6-character alphanumeric code with a prefix
  return `C-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/**
 * Generate a QR code as data URL
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(data);
    return url;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Validate that reward tier probabilities do not exceed 100%
 */
export function validateRewardTiers(tiers: RewardTier[]): boolean {
  const totalProbability = tiers.reduce((sum, tier) => sum + tier.probability, 0);
  return totalProbability <= 100;
}

/**
 * Perform a weighted random selection from reward tiers
 */
export function selectRandomRewardTier(tiers: RewardTier[]): RewardTier | null {
  // Validate tiers
  if (!tiers || tiers.length === 0) {
    return null;
  }

  // Get total probability (should not exceed 100)
  const totalProbability = tiers.reduce((sum, tier) => sum + tier.probability, 0);
  
  // Generate a random number between 0 and total probability
  const randomNum = Math.random() * totalProbability;
  
  // Find the selected tier based on probability ranges
  let accumulatedProbability = 0;
  
  for (const tier of tiers) {
    accumulatedProbability += tier.probability;
    if (randomNum <= accumulatedProbability) {
      return tier;
    }
  }
  
  // Fallback to the last tier (should not happen if probabilities sum to 100)
  return tiers[tiers.length - 1];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
} 