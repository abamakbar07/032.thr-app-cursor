/**
 * Error handling utility for the Family Gacha THR application
 * Provides consistent error handling across the application
 */

import { NextResponse } from 'next/server';

// Common error types
export type ErrorResponse = {
  success: false;
  error: string;
  details?: any;
};

export type SuccessResponse<T = any> = {
  success: true;
  data: T;
};

export type ApiResponse<T = any> = ErrorResponse | SuccessResponse<T>;

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(message: string, status = 500, details?: any): NextResponse {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}

/**
 * Create a standardized success response for API routes
 */
export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Global error handler for API routes
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage = 'An unexpected error occurred'
): Promise<ApiResponse<T>> {
  try {
    const result = await fn();
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Error: ${errorMessage}`, error);
    return {
      success: false,
      error: error.message || errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}

/**
 * Validate request parameters
 * @returns true if valid, error message if invalid
 */
export function validateParams(params: Record<string, any>, requiredParams: string[]): true | string {
  for (const param of requiredParams) {
    if (!params[param]) {
      return `Missing required parameter: ${param}`;
    }
  }
  return true;
}

/**
 * Handle MongoDB or database errors
 */
export function handleDbError(error: any): ErrorResponse {
  // Handle specific MongoDB errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return {
      success: false,
      error: 'Validation Error',
      details: errors
    };
  }
  
  if (error.code === 11000) {
    return {
      success: false,
      error: 'Duplicate Entry',
      details: 'An entry with these details already exists'
    };
  }
  
  // Generic DB error
  return {
    success: false,
    error: 'Database Error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
} 