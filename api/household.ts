import { db } from '@/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Query Keys för React Query cache management
export const householdKeys = {
  all: ['households'] as const,
  lists: () => [...householdKeys.all, 'list'] as const,
  list: (userId: string) => [...householdKeys.lists(), userId] as const,
  details: () => [...householdKeys.all, 'detail'] as const,
  detail: (id: string) => [...householdKeys.details(), id] as const,
};

export async function getHouseholds(userId: string) {
  const ref = collection(db, 'member');
  const q = query(ref, where('user_id', '==', userId));
  const snapshot = await getDocs(q);

  const householdIds = snapshot.docs.map((d) => d.data().household_id);
  if (!householdIds.length) return [];

  const q2 = query(collection(db, 'household'), where('__name__', 'in', householdIds));
  const snap2 = await getDocs(q2);

  return snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
}
