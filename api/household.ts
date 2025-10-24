import { AvatarKey, giveRandomAvatar } from '@/app/utils/avatar';
import { db } from '@/firebase-config';
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

export interface CreateHouseholdInput {
  name: string;
  ownerId: string;
}

export interface JoinHouseholdInput {
  code: string;
  userId: string;
}

// api/household.ts
export interface HouseholdMember {
  userId: string;
  name: string | null;
  isAdmin: boolean;
  avatar?: AvatarKey | null;
}

// Query Keys för React Query cache management
export const householdKeys = {
  all: ['households'] as const,
  lists: () => [...householdKeys.all, 'list'] as const,
  list: (userId: string) => [...householdKeys.lists(), userId] as const,
  details: () => [...householdKeys.all, 'detail'] as const,
  detail: (id: string) => [...householdKeys.details(), id] as const,
  members: (householdId: string) => [...householdKeys.detail(householdId)],
};

export async function updateHouseholdName(householdId: string, name: string) {
  const ref = doc(db, 'household', householdId);
  await updateDoc(ref, { name, updated_at: serverTimestamp() });
}

export async function getHouseholds(userId: string) {
  const ref = collection(db, 'member');
  const q = query(ref, where('user_id', '==', userId));
  const snapshot = await getDocs(q);

  const householdIds = snapshot.docs.map((d) => d.data().household_id);
  if (!householdIds.length) return [];

  const q2 = query(collection(db, 'household'), where('__name__', 'in', householdIds));
  const snap2 = await getDocs(q2);

  const membersCountByHousehold: Record<string, number> = {};
  for (const houseDoc of snap2.docs) {
    const countSnap = await getCountFromServer(
      query(collection(db, 'member'), where('household_id', '==', houseDoc.id)),
    );
    membersCountByHousehold[houseDoc.id] = countSnap.data().count;
  }

  const memberByHousehold = Object.fromEntries(
    snapshot.docs.map((memberDoc) => {
      const data = memberDoc.data();
      return [data.household_id as string, data.avatar];
    }),
  );

  return snap2.docs.map((houseDoc) => ({
    id: houseDoc.id,
    ...houseDoc.data(),
    avatar: memberByHousehold[houseDoc.id] ?? null,
    membersCount: membersCountByHousehold[houseDoc.id] ?? 0,
  }));
}

function generateCode(length = 8) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
    '',
  );
}

export async function createHousehold({ name, ownerId }: CreateHouseholdInput) {
  const batch = writeBatch(db);
  const householdRef = doc(collection(db, 'household'));
  const memberRef = doc(collection(db, 'member'));
  const now = serverTimestamp();
  const code = generateCode();

  batch.set(householdRef, {
    name,
    code,
    owner_id: ownerId,
    created_at: now,
    updated_at: now,
  });

  const avatar = giveRandomAvatar();

  batch.set(memberRef, {
    household_id: householdRef.id,
    user_id: ownerId,
    is_admin: 'true',
    created_at: now,
    avatar,
  });

  await batch.commit();

  return { id: householdRef.id, name, code };
}

export async function joinHouseholdByCode({ code, userId }: JoinHouseholdInput) {
  const normalizedCode = code.trim().toUpperCase();

  // 1. Leta upp hushållet på koden
  const householdQuery = query(collection(db, 'household'), where('code', '==', normalizedCode));
  const householdSnap = await getDocs(householdQuery);
  if (householdSnap.empty) {
    throw new Error('Hushållet hittades inte.');
  }
  const householdDoc = householdSnap.docs[0];
  const householdId = householdDoc.id;

  // 2. Kolla att användaren inte redan är medlem
  const membershipQuery = query(
    collection(db, 'member'),
    where('user_id', '==', userId),
    where('household_id', '==', householdId),
  );
  const membershipSnap = await getDocs(membershipQuery);
  if (!membershipSnap.empty) {
    throw new Error('Du är redan medlem i det här hushållet.');
  }

  const avatar = giveRandomAvatar();

  // 3. Lägg till medlemskap
  await addDoc(collection(db, 'member'), {
    household_id: householdId,
    user_id: userId,
    is_admin: false,
    created_at: serverTimestamp(),
    avatar,
  });

  return { id: householdId, ...householdDoc.data() };
}

//Members

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const membersSnap = await getDocs(
    query(collection(db, 'member'), where('household_id', '==', householdId)),
  );

  return membersSnap.docs.map((memberDoc) => {
    const data = memberDoc.data();
    return {
      userId: data.user_id as string,
      name: (data.name as string | undefined) ?? null,
      isAdmin: data.is_admin === true || data.is_admin === 'true',
      avatar: (data.avatar as AvatarKey | undefined) ?? null,
    };
  });
}
