import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './firebase';

// Global auth state
let currentUser: User | null = null;
let authStateInitialized = false;
let authStatePromise: Promise<User | null> | null = null;

// Initialize auth state listener
function initializeAuthState(): Promise<User | null> {
  if (authStatePromise) {
    return authStatePromise;
  }

  authStatePromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser = user;
      authStateInitialized = true;
      resolve(user);
      unsubscribe(); // Only need to resolve once for initialization
    });
  });

  return authStatePromise;
}

// Get current user ID - now uses real Firebase auth
export function getCurrentUserId(): string {
  if (!authStateInitialized) {
    // Fallback for server-side or before auth initialization
    const stored = localStorage.getItem('tasker_user_id');
    if (stored) return stored;
    return 'demo-user'; // Fallback for development
  }
  
  if (currentUser) {
    // Store in localStorage for persistence across page reloads
    localStorage.setItem('tasker_user_id', currentUser.uid);
    return currentUser.uid;
  }
  
  // Clear localStorage if no user
  localStorage.removeItem('tasker_user_id');
  return 'demo-user'; // Fallback for development
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (!authStateInitialized) {
    // Check localStorage as fallback before Firebase initializes
    return Boolean(localStorage.getItem('tasker_user_id'));
  }
  
  return currentUser !== null;
}

// Get current user object
export function getCurrentUser(): User | null {
  return currentUser;
}

// Initialize auth state and return promise
export async function initAuth(): Promise<User | null> {
  return await initializeAuthState();
}

// Sign out user
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    localStorage.removeItem('tasker_user_id');
    currentUser = null;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authStateInitialized = true;
    
    if (user) {
      localStorage.setItem('tasker_user_id', user.uid);
    } else {
      localStorage.removeItem('tasker_user_id');
    }
    
    callback(user);
  });
}

// Get user display name
export function getUserDisplayName(): string {
  if (currentUser?.displayName) {
    return currentUser.displayName;
  }
  if (currentUser?.email) {
    return currentUser.email.split('@')[0]; // Use email prefix as fallback
  }
  return 'User';
}

// Get user email
export function getUserEmail(): string | null {
  return currentUser?.email || null;
}

// Check if user email is verified
export function isEmailVerified(): boolean {
  return currentUser?.emailVerified || false;
}
