import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { db, type Task, type TimeEntry } from './firebase';

// Collection path helpers (scoped per user)
const tasksCol = (uid: string) => collection(db, 'users', uid, 'tasks');
const taskDoc = (uid: string, id: string) => doc(db, 'users', uid, 'tasks', id);

const timeEntriesCol = (uid: string) => collection(db, 'users', uid, 'timeEntries');

const categoriesCol = (uid: string) => collection(db, 'users', uid, 'categories');
const categoryDoc = (uid: string, id: string) => doc(db, 'users', uid, 'categories', id);

// Tasks
export async function createTask(uid: string, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
  const now = new Date().toISOString();
  const payload: Task = {
    userId: uid,
    title: data.title,
    description: data.description || '',
    project: data.project || '',
    priority: data.priority || 'medium',
    dueDate: data.dueDate,
    completed: data.completed ?? false,
    timeSpent: data.timeSpent ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(tasksCol(uid), payload);
  return { id: ref.id, ...payload };
}

export async function updateTask(uid: string, id: string, data: Partial<Task>) {
  const payload = { ...data, updatedAt: new Date().toISOString() };
  await updateDoc(taskDoc(uid, id), payload as any);
}

export async function setTask(uid: string, id: string, data: Task) {
  await setDoc(taskDoc(uid, id), data);
}

export async function deleteTask(uid: string, id: string) {
  await deleteDoc(taskDoc(uid, id));
}

export function onTasksSnapshot(
  uid: string,
  cb: (tasks: (Task & { id: string })[]) => void
) {
  const q = query(tasksCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Task) }));
    cb(items);
  });
}

// Time entries
export async function createTimeEntry(uid: string, data: Omit<TimeEntry, 'id'>) {
  const ref = await addDoc(timeEntriesCol(uid), data);
  return { id: ref.id, ...data };
}

export function onTimeEntriesSnapshot(
  uid: string,
  cb: (entries: (TimeEntry & { id: string })[]) => void
) {
  const q = query(timeEntriesCol(uid), orderBy('startedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as TimeEntry) }));
    cb(items);
  });
}

// Categories
export interface Category { id?: string; name: string; createdAt: string }

export async function createCategory(uid: string, name: string) {
  const payload: Category = { name, createdAt: new Date().toISOString() };
  const ref = await addDoc(categoriesCol(uid), payload);
  return { id: ref.id, ...payload };
}

export async function deleteCategory(uid: string, id: string) {
  await deleteDoc(categoryDoc(uid, id));
}

export function onCategoriesSnapshot(
  uid: string,
  cb: (categories: Category[]) => void
) {
  const q = query(categoriesCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Category) }));
    cb(items);
  });
}
