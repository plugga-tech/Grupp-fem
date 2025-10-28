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
export const currentUserAtom = atom<User | null>(null);
export const currentHouseholdAtom = atom<Household | null>(null);
