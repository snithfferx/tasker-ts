import { FirebaseError } from 'firebase/app';

// Common Firebase error codes
export enum FirebaseErrorCodes {
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_WRONG_PASSWORD = 'auth/wrong-password',
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
  AUTH_USER_DISABLED = 'auth/user-disabled',
  AUTH_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  AUTH_WEAK_PASSWORD = 'auth/weak-password',
  AUTH_TOO_MANY_REQUESTS = 'auth/too-many-requests',
  AUTH_NETWORK_REQUEST_FAILED = 'auth/network-request-failed',
  AUTH_REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',
  
  FIRESTORE_PERMISSION_DENIED = 'permission-denied',
  FIRESTORE_NOT_FOUND = 'not-found',
  FIRESTORE_ALREADY_EXISTS = 'already-exists',
  FIRESTORE_RESOURCE_EXHAUSTED = 'resource-exhausted',
  FIRESTORE_FAILED_PRECONDITION = 'failed-precondition',
  FIRESTORE_ABORTED = 'aborted',
  FIRESTORE_OUT_OF_RANGE = 'out-of-range',
  FIRESTORE_UNIMPLEMENTED = 'unimplemented',
  FIRESTORE_INTERNAL = 'internal',
  FIRESTORE_UNAVAILABLE = 'unavailable',
  FIRESTORE_DATA_LOSS = 'data-loss'
}

// User-friendly error messages
const errorMessages: Record<string, string> = {
  // Authentication errors
  [FirebaseErrorCodes.AUTH_USER_NOT_FOUND]: 'No account found with this email address.',
  [FirebaseErrorCodes.AUTH_WRONG_PASSWORD]: 'Incorrect password. Please try again.',
  [FirebaseErrorCodes.AUTH_INVALID_EMAIL]: 'Please enter a valid email address.',
  [FirebaseErrorCodes.AUTH_USER_DISABLED]: 'This account has been disabled. Please contact support.',
  [FirebaseErrorCodes.AUTH_EMAIL_ALREADY_IN_USE]: 'An account with this email already exists.',
  [FirebaseErrorCodes.AUTH_WEAK_PASSWORD]: 'Password is too weak. Please choose a stronger password.',
  [FirebaseErrorCodes.AUTH_TOO_MANY_REQUESTS]: 'Too many failed attempts. Please try again later.',
  [FirebaseErrorCodes.AUTH_NETWORK_REQUEST_FAILED]: 'Network error. Please check your connection and try again.',
  [FirebaseErrorCodes.AUTH_REQUIRES_RECENT_LOGIN]: 'Please log in again to continue.',

  // Firestore errors
  [FirebaseErrorCodes.FIRESTORE_PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
  [FirebaseErrorCodes.FIRESTORE_NOT_FOUND]: 'The requested data was not found.',
  [FirebaseErrorCodes.FIRESTORE_ALREADY_EXISTS]: 'This item already exists.',
  [FirebaseErrorCodes.FIRESTORE_RESOURCE_EXHAUSTED]: 'Service is temporarily overloaded. Please try again later.',
  [FirebaseErrorCodes.FIRESTORE_FAILED_PRECONDITION]: 'Operation failed due to a conflict. Please refresh and try again.',
  [FirebaseErrorCodes.FIRESTORE_ABORTED]: 'Operation was cancelled. Please try again.',
  [FirebaseErrorCodes.FIRESTORE_OUT_OF_RANGE]: 'Invalid data provided.',
  [FirebaseErrorCodes.FIRESTORE_UNIMPLEMENTED]: 'This feature is not yet available.',
  [FirebaseErrorCodes.FIRESTORE_INTERNAL]: 'An internal error occurred. Please try again.',
  [FirebaseErrorCodes.FIRESTORE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [FirebaseErrorCodes.FIRESTORE_DATA_LOSS]: 'Data corruption detected. Please contact support.'
};

// Get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return errorMessages[error.code] || `Firebase error: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Error types for different contexts
export interface AppError {
  message: string;
  code?: string;
  context?: string;
  timestamp?: Date;
  userId?: string;
}

// Create structured error
export const createAppError = (
  message: string,
  code?: string,
  context?: string,
  userId?: string
): AppError => ({
  message,
  code,
  context,
  timestamp: new Date(),
  userId
});

// Log error for debugging (you might want to send to a logging service)
export const logError = (error: AppError): void => {
  console.error('App Error:', {
    message: error.message,
    code: error.code,
    context: error.context,
    timestamp: error.timestamp,
    userId: error.userId
  });

  // In production, you might want to send this to a logging service
  // like Sentry, LogRocket, or Firebase Analytics
};

// Handle async operations with error catching
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  context?: string,
  userId?: string
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = createAppError(
      getErrorMessage(error),
      error instanceof FirebaseError ? error.code : undefined,
      context,
      userId
    );
    
    logError(appError);
    return { error: appError };
  }
};

// Retry logic for transient errors
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error instanceof FirebaseError) {
        const nonRetryableErrors = [
          FirebaseErrorCodes.AUTH_USER_NOT_FOUND,
          FirebaseErrorCodes.AUTH_WRONG_PASSWORD,
          FirebaseErrorCodes.AUTH_INVALID_EMAIL,
          FirebaseErrorCodes.FIRESTORE_PERMISSION_DENIED,
          FirebaseErrorCodes.FIRESTORE_NOT_FOUND
        ];
        
        if (nonRetryableErrors.includes(error.code as FirebaseErrorCodes)) {
          throw error;
        }
      }

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Validation error class
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Network error detection
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return error.code === FirebaseErrorCodes.AUTH_NETWORK_REQUEST_FAILED ||
           error.code === FirebaseErrorCodes.FIRESTORE_UNAVAILABLE;
  }
  
  return false;
};

// Check if error is retryable
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    const retryableErrors = [
      FirebaseErrorCodes.AUTH_NETWORK_REQUEST_FAILED,
      FirebaseErrorCodes.AUTH_TOO_MANY_REQUESTS,
      FirebaseErrorCodes.FIRESTORE_UNAVAILABLE,
      FirebaseErrorCodes.FIRESTORE_INTERNAL,
      FirebaseErrorCodes.FIRESTORE_RESOURCE_EXHAUSTED,
      FirebaseErrorCodes.FIRESTORE_ABORTED
    ];
    
    return retryableErrors.includes(error.code as FirebaseErrorCodes);
  }
  
  return false;
};

// Global error boundary helper
export const handleGlobalError = (error: Error, errorInfo?: any): void => {
  const appError = createAppError(
    error.message,
    'REACT_ERROR',
    'Global Error Boundary'
  );
  
  logError(appError);
  
  // You might want to show a user-friendly error message
  // or redirect to an error page
};