import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase-config';

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

export interface ChoreCompletion {
  id: string;
  chore_id: string;
  household_id: string;
  done_by_user_id: string;
  done_at: Date;
}

export interface ChoreWithStatus extends Chore {
  days_since_last: number;
  is_overdue: boolean;
  last_completed_at?: Date;
  last_completed_by?: string;
}

export type ChoreCreate = Omit<Chore, 'id' | 'created_at' | 'updated_at'>;
export type ChoreUpdate = Partial<ChoreCreate>;

// Query Keys för React Query cache management
export const choreKeys = {
  all: ['chores'] as const,
  lists: () => [...choreKeys.all, 'list'] as const,
  list: (householdId: string) => [...choreKeys.lists(), householdId] as const,
  details: () => [...choreKeys.all, 'detail'] as const,
  detail: (id: string) => [...choreKeys.details(), id] as const,
};

export async function getChores(householdId: string): Promise<Chore[]> {
  try {
    const choresRef = collection(db, 'chores');
    const q = query(choresRef, where('household_id', '==', householdId));
    const snapshot = await getDocs(q);
    const chores = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      created_at: docSnap.data().created_at?.toDate(),
      updated_at: docSnap.data().updated_at?.toDate(),
    })) as Chore[];
    
    // Sortera efter created_at
    chores.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    
    return chores;
  } catch (error) {
    console.error('Error in getChores:', error);
    throw new Error('Failed to fetch chores', { cause: error });
  }
}

export async function getChoresWithStatus(householdId: string): Promise<ChoreWithStatus[]> {
  try {
    const chores = await getChores(householdId);
    const completionsRef = collection(db, 'chore_completion');
    
    // Hämta ALLA completions för hushållet
    const q = query(
      completionsRef,
      where('household_id', '==', householdId)
    );
    const snapshot = await getDocs(q);
    
    // Gruppera completions per chore_id
    const completionsByChore: { [choreId: string]: any[] } = {};
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (!completionsByChore[data.chore_id]) {
        completionsByChore[data.chore_id] = [];
      }
      completionsByChore[data.chore_id].push({
        ...data,
        done_at: data.done_at?.toDate(),
      });
    });
    
    // Beräkna status för varje syssla
    const choresWithStatus: ChoreWithStatus[] = chores.map((chore) => {
      const choreCompletions = completionsByChore[chore.id] || [];
      
      let lastCompletedAt: Date | undefined = undefined;
      let lastCompletedBy: string | undefined = undefined;
      let daysSinceLast: number;
      
      if (choreCompletions.length > 0) {
        // Sortera för att hitta senaste
        choreCompletions.sort((a, b) => {
          const dateA = a.done_at ? a.done_at.getTime() : 0;
          const dateB = b.done_at ? b.done_at.getTime() : 0;
          return dateB - dateA;
        });
        
        const lastCompletion = choreCompletions[0];
        if (lastCompletion?.done_at) {
          lastCompletedAt = lastCompletion.done_at;
          lastCompletedBy = lastCompletion.done_by_user_id;
          daysSinceLast = Math.floor((Date.now() - lastCompletion.done_at.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        } else {
          // Om done_at saknas, använd created_at
          daysSinceLast = Math.floor((Date.now() - chore.created_at.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }
      } else {
        // Om ingen completion finns, räkna från created_at, börja från dag 1
        daysSinceLast = Math.floor((Date.now() - chore.created_at.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
   
      const isOverdue = daysSinceLast > chore.frequency;
      
      return {
        ...chore,
        days_since_last: daysSinceLast,
        is_overdue: isOverdue,
        last_completed_at: lastCompletedAt,
        last_completed_by: lastCompletedBy,
      };
    });
    
    return choresWithStatus;
  } catch (error) {
    console.error('Error in getChoresWithStatus:', error);
    throw new Error('Failed to fetch chores with status', { cause: error });
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
    console.error('Error creating chore:', error);
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
    console.error('Error updating chore:', error);
    throw new Error('Failed to update chore', { cause: error });
  }
}

export async function deleteChore(id: string): Promise<void> {
  try {
    const choreRef = doc(db, 'chores', id);
    await deleteDoc(choreRef);
  } catch (error) {
    console.error('Error deleting chore:', error);
    throw new Error('Failed to delete chore', { cause: error });
  }
}