import { atom } from 'jotai';

export interface User {
  id: string;
  name: string;
  is_admin: boolean;
}

export interface Household {
  id: string;
  name: string;
  code: string;
}

export const currentUserAtom = atom<User | null>({
  id: 'demo-user',
  name: 'Demo User',
  is_admin: true,
});

export const currentHouseholdAtom = atom<Household | null>({
  id: 'demo-household',
  name: 'Mitt Hushåll',
  code: 'ABC123',
});