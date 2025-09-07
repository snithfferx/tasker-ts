import type { User } from 'firebase/auth';

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  timezone: string;
  weeklyGoal: number; // in hours
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseUser extends User { }

export type Users = User[];
