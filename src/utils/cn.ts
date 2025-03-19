import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines class names with Tailwind CSS
 * Uses clsx and tailwind-merge to handle conditional classes and merge Tailwind classes properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 