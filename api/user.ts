import { db } from '@/firebase-config';
import { AvatarKey } from '@/utils/avatar';
import { updateProfile, User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';

export interface UserHousehold {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  currentUserMember: {
    userId: string;
    name: string | null;
    isAdmin: boolean;
    avatar: AvatarKey | null;
  } | null;
}

/**
 * Gets all households that the user belongs to
 * @param userId - User's ID
 * @returns Promise<UserHousehold[]>
 */
export async function getUserHouseholds(userId: string): Promise<UserHousehold[]> {
  try {
    // Find all user's memberships
    const memberQuery = query(collection(db, 'member'), where('user_id', '==', userId));
    const memberSnapshot = await getDocs(memberQuery);

    if (memberSnapshot.empty) {
      return [];
    }

    const households: UserHousehold[] = [];

    for (const memberDoc of memberSnapshot.docs) {
      const memberData = memberDoc.data();

      // Get household data
      const householdRef = doc(db, 'household', memberData.household_id);
      const householdDoc = await getDoc(householdRef);

      if (householdDoc.exists()) {
        const householdData = householdDoc.data();

        households.push({
          id: householdDoc.id,
          name: householdData.name,
          code: householdData.code,
          ownerId: householdData.owner_id,
          currentUserMember: {
            userId: memberData.user_id,
            name: memberData.name || null,
            isAdmin: memberData.is_admin === true || memberData.is_admin === 'true',
            avatar: memberData.avatar || null,
          },
        });
      }
    }

    // Sort by creation date (newest first)
    return households.sort((a, b) => {
      // If we don't have creation dates, just return as is
      return 0;
    });
  } catch (error) {
    console.error('Error getting user households:', error);
    throw new Error('Failed to get user households');
  }
}

/**
 * Gets the household that the user belongs to (backwards compatibility)
 * @param userId - User's ID
 * @returns Promise<UserHousehold | null>
 */
export async function getUserHousehold(userId: string): Promise<UserHousehold | null> {
  const households = await getUserHouseholds(userId);
  return households.length > 0 ? households[0] : null;
}

/**
 * Updates user's display name in Firebase Auth and all household memberships
 * @param user - Firebase Auth user object
 * @param newName - New display name
 * @returns Promise<void>
 */
export async function updateUserDisplayName(user: User, newName: string): Promise<void> {
  try {
    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: newName.trim(),
    });

    // Update name in all household memberships
    const memberQuery = query(collection(db, 'member'), where('user_id', '==', user.uid));
    const memberSnapshot = await getDocs(memberQuery);

    // Update each membership document
    const updatePromises = memberSnapshot.docs.map((memberDoc) =>
      updateDoc(memberDoc.ref, {
        name: newName.trim(),
      }),
    );

    await Promise.all(updatePromises);

    console.log('User display name updated successfully');
  } catch (error) {
    console.error('Error updating user display name:', error);
    throw new Error('Failed to update display name');
  }
}
