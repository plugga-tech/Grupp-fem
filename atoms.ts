import { atom } from 'jotai';
import { UserHousehold } from '@/api/user';

export interface User {
  id: string;
  name: string;
  is_admin: boolean;
}

export interface Household {
  id: string;
  name?: string;
  code?: string;
}

export const currentUserAtom = atom<User | null>({
  id: 'demo-user',
  name: 'Demo User',
  is_admin: true,
});

export const currentHouseholdAtom = atom<UserHousehold | null>(null);
