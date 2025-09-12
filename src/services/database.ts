// src/services/database.ts
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    DocumentSnapshot,
    QueryConstraint
  } from 'firebase/firestore';
  import { db } from '@Services/firebase';
  import type { User } from 'firebase/auth';
  
  // Types
  export interface Category {
    id: string;
    name: string;
    color?: string;
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    categoryId: string;
    userId: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface TimeEntry {
    id: string;
    taskId: string;
    userId: string;
    startTime: Timestamp;
    endTime?: Timestamp;
    duration: number; // in seconds
    isRunning: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  // Input types for creation
  export interface CreateCategoryInput {
    name: string;
    color?: string;
  }
  
  export interface CreateTaskInput {
    title: string;
    description?: string;
    categoryId: string;
  }
  
  export interface CreateTimeEntryInput {
    taskId: string;
    startTime?: Date;
  }
  
  // Update types
  export interface UpdateCategoryInput {
    name?: string;
    color?: string;
  }
  
  export interface UpdateTaskInput {
    title?: string;
    description?: string;
    categoryId?: string;
    isActive?: boolean;
  }
  
  export interface UpdateTimeEntryInput {
    endTime?: Date;
    duration?: number;
    isRunning?: boolean;
  }
  
  // ===================
  // CATEGORY SERVICES
  // ===================
  
  export class CategoryService {
    private static collectionName = 'categories';
  
    // Create a new category
    static async create(user: User, data: CreateCategoryInput): Promise<string> {
      try {
        const categoryData = {
          ...data,
          userId: user.uid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
  
        const docRef = await addDoc(collection(db, this.collectionName), categoryData);
        return docRef.id;
      } catch (error) {
        console.error('Error creating category:', error);
        throw new Error('Failed to create category');
      }
    }
  
    // Get all categories for a user
    static async getUserCategories(userId: string): Promise<Category[]> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Category));
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }
    }
  
    // Get category by ID
    static async getById(categoryId: string): Promise<Category | null> {
      try {
        const docRef = doc(db, this.collectionName, categoryId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Category;
        }
        return null;
      } catch (error) {
        console.error('Error fetching category:', error);
        throw new Error('Failed to fetch category');
      }
    }
  
    // Update category
    static async update(categoryId: string, data: UpdateCategoryInput): Promise<void> {
      try {
        const docRef = doc(db, this.collectionName, categoryId);
        const updateData = {
          ...data,
          updatedAt: Timestamp.now()
        };
        
        await updateDoc(docRef, updateData);
      } catch (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
      }
    }
  
    // Delete category (and optionally handle associated tasks)
    static async delete(categoryId: string, deleteAssociatedTasks: boolean = false): Promise<void> {
      try {
        if (deleteAssociatedTasks) {
          // Delete all tasks in this category
          const tasks = await TaskService.getTasksByCategory(categoryId);
          await Promise.all(tasks.map(task => TaskService.delete(task.id, true)));
        }
  
        const docRef = doc(db, this.collectionName, categoryId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
      }
    }
  }
  
  // ===================
  // TASK SERVICES
  // ===================
  
  export class TaskService {
    private static collectionName = 'tasks';
  
    // Create a new task
    static async create(user: User, data: CreateTaskInput): Promise<string> {
      try {
        const taskData = {
          ...data,
          userId: user.uid,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
  
        const docRef = await addDoc(collection(db, this.collectionName), taskData);
        return docRef.id;
      } catch (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
      }
    }
  
    // Get all tasks for a user
    static async getUserTasks(userId: string): Promise<Task[]> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Failed to fetch tasks');
      }
    }
  
    // Get tasks by category
    static async getTasksByCategory(categoryId: string): Promise<Task[]> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('categoryId', '==', categoryId),
          orderBy('createdAt', 'desc')
        );
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
      } catch (error) {
        console.error('Error fetching tasks by category:', error);
        throw new Error('Failed to fetch tasks');
      }
    }
  
    // Get active tasks for a user
    static async getActiveTasks(userId: string): Promise<Task[]> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
      } catch (error) {
        console.error('Error fetching active tasks:', error);
        throw new Error('Failed to fetch active tasks');
      }
    }
  
    // Get task by ID
    static async getById(taskId: string): Promise<Task | null> {
      try {
        const docRef = doc(db, this.collectionName, taskId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Task;
        }
        return null;
      } catch (error) {
        console.error('Error fetching task:', error);
        throw new Error('Failed to fetch task');
      }
    }
  
    // Update task
    static async update(taskId: string, data: UpdateTaskInput): Promise<void> {
      try {
        const docRef = doc(db, this.collectionName, taskId);
        const updateData = {
          ...data,
          updatedAt: Timestamp.now()
        };
        
        await updateDoc(docRef, updateData);
      } catch (error) {
        console.error('Error updating task:', error);
        throw new Error('Failed to update task');
      }
    }
  
    // Delete task
    static async delete(taskId: string, deleteTimeEntries: boolean = false): Promise<void> {
      try {
        if (deleteTimeEntries) {
          // Delete all time entries for this task
          const timeEntries = await TimeEntryService.getEntriesByTask(taskId);
          await Promise.all(timeEntries.map(entry => TimeEntryService.delete(entry.id)));
        }
  
        const docRef = doc(db, this.collectionName, taskId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
      }
    }
  }
  
  // ===================
  // TIME ENTRY SERVICES
  // ===================
  
  export class TimeEntryService {
    private static collectionName = 'timeEntries';
  
    // Start time tracking (create new entry)
    static async startTimer(user: User, taskId: string): Promise<string> {
      try {
        // First, stop any running timers for this user
        await this.stopAllRunningTimers(user.uid);
  
        const timeEntryData = {
          taskId,
          userId: user.uid,
          startTime: Timestamp.now(),
          duration: 0,
          isRunning: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
  
        const docRef = await addDoc(collection(db, this.collectionName), timeEntryData);
        return docRef.id;
      } catch (error) {
        console.error('Error starting timer:', error);
        throw new Error('Failed to start timer');
      }
    }
  
    // Stop timer and calculate duration
    static async stopTimer(entryId: string): Promise<void> {
      try {
        const docRef = doc(db, this.collectionName, entryId);
        const docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          throw new Error('Time entry not found');
        }
  
        const entry = docSnap.data();
        const endTime = Timestamp.now();
        const duration = endTime.seconds - entry.startTime.seconds;
  
        await updateDoc(docRef, {
          endTime,
          duration,
          isRunning: false,
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error stopping timer:', error);
        throw new Error('Failed to stop timer');
      }
    }
  
    // Stop all running timers for a user
    static async stopAllRunningTimers(userId: string): Promise<void> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          where('isRunning', '==', true)
        );
  
        const querySnapshot = await getDocs(q);
        const stopPromises = querySnapshot.docs.map(doc => this.stopTimer(doc.id));
        
        await Promise.all(stopPromises);
      } catch (error) {
        console.error('Error stopping running timers:', error);
        throw new Error('Failed to stop running timers');
      }
    }
  
    // Get currently running timer for a user
    static async getRunningTimer(userId: string): Promise<TimeEntry | null> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          where('isRunning', '==', true),
          limit(1)
        );
  
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          return null;
        }
  
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as TimeEntry;
      } catch (error) {
        console.error('Error fetching running timer:', error);
        throw new Error('Failed to fetch running timer');
      }
    }
  
    // Get time entries by task
    static async getEntriesByTask(taskId: string): Promise<TimeEntry[]> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('taskId', '==', taskId),
          orderBy('createdAt', 'desc')
        );
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TimeEntry));
      } catch (error) {
        console.error('Error fetching time entries by task:', error);
        throw new Error('Failed to fetch time entries');
      }
    }
  
    // Get user's time entries with pagination
    static async getUserTimeEntries(
      userId: string, 
      pageSize: number = 50,
      lastDoc?: DocumentSnapshot
    ): Promise<{ entries: TimeEntry[], lastDoc?: DocumentSnapshot }> {
      try {
        let q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
  
        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }
  
        const querySnapshot = await getDocs(q);
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TimeEntry));
  
        const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
  
        return {
          entries,
          lastDoc: lastDocument
        };
      } catch (error) {
        console.error('Error fetching user time entries:', error);
        throw new Error('Failed to fetch time entries');
      }
    }
  
    // Get time entries by date range
    static async getEntriesByDateRange(
      userId: string,
      startDate: Date,
      endDate: Date
    ): Promise<TimeEntry[]> {
      try {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          where('createdAt', '<=', Timestamp.fromDate(endDate)),
          orderBy('createdAt', 'desc')
        );
  
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TimeEntry));
      } catch (error) {
        console.error('Error fetching time entries by date range:', error);
        throw new Error('Failed to fetch time entries');
      }
    }
  
    // Update time entry
    static async update(entryId: string, data: UpdateTimeEntryInput): Promise<void> {
      try {
        const docRef = doc(db, this.collectionName, entryId);
        const updateData = {
          ...data,
          updatedAt: Timestamp.now()
        };
  
        if (data.endTime) {
          updateData.endTime = Timestamp.fromDate(data.endTime);
        }
        
        await updateDoc(docRef, updateData);
      } catch (error) {
        console.error('Error updating time entry:', error);
        throw new Error('Failed to update time entry');
      }
    }
  
    // Delete time entry
    static async delete(entryId: string): Promise<void> {
      try {
        const docRef = doc(db, this.collectionName, entryId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting time entry:', error);
        throw new Error('Failed to delete time entry');
      }
    }
  
    // Get total time spent on a task
    static async getTotalTimeForTask(taskId: string): Promise<number> {
      try {
        const entries = await this.getEntriesByTask(taskId);
        return entries.reduce((total, entry) => total + (entry.duration || 0), 0);
      } catch (error) {
        console.error('Error calculating total time for task:', error);
        throw new Error('Failed to calculate total time');
      }
    }
  
    // Get time summary for user by date range
    static async getTimeSummary(
      userId: string,
      startDate: Date,
      endDate: Date
    ): Promise<{ taskId: string, totalTime: number }[]> {
      try {
        const entries = await this.getEntriesByDateRange(userId, startDate, endDate);
        
        const summary = entries.reduce((acc, entry) => {
          if (!acc[entry.taskId]) {
            acc[entry.taskId] = 0;
          }
          acc[entry.taskId] += entry.duration || 0;
          return acc;
        }, {} as Record<string, number>);
  
        return Object.entries(summary).map(([taskId, totalTime]) => ({
          taskId,
          totalTime
        }));
      } catch (error) {
        console.error('Error generating time summary:', error);
        throw new Error('Failed to generate time summary');
      }
    }
  }