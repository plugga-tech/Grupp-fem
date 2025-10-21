import { db } from '../firebase-config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';

export interface Chore {
  id: string;
  household_id: string;
  name: string;
  description: string;
  frequency: number;
  weight: number;
  created_at: Date;
  updated_at: Date;
}

export type ChoreCreate = Omit<Chore, 'id' | 'created_at' | 'updated_at'>;
export type ChoreUpdate = Partial<ChoreCreate>;

export async function getChores(householdId: string): Promise<Chore[]> {
  try {
    const choresRef = collection(db, 'chores');
    const q = query(choresRef, where('household_id', '==', householdId));
    const snapshot = await getDocs(q);
    const chores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
    })) as Chore[];
    return chores;
  } catch (error) {
    throw new Error('Failed to fetch chores', { cause: error });
  }
}

export async function createChore(chore: ChoreCreate): Promise<Chore> {
  try {
    const now = Timestamp.now();
    const choresRef = collection(db, 'chores');
    const docRef = await addDoc(choresRef, {
      ...chore,
      created_at: now,
      updated_at: now,
    });
    return {
      id: docRef.id,
      ...chore,
      created_at: now.toDate(),
      updated_at: now.toDate(),
    };
  } catch (error) {
    throw new Error('Failed to create chore', { cause: error });
  }
}

export async function updateChore(id: string, updates: ChoreUpdate): Promise<void> {
  try {
    const choreRef = doc(db, 'chores', id);
    await updateDoc(choreRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });
  } catch (error) {
    throw new Error('Failed to update chore', { cause: error });
  }
}

export async function deleteChore(id: string): Promise<void> {
  try {
    const choreRef = doc(db, 'chores', id);
    await deleteDoc(choreRef);
  } catch (error) {
    throw new Error('Failed to delete chore', { cause: error });
  }
}