export const AVATAR_KEYS = [
  'Fox',
  'Pig',
  'Frog',
  'Chicken',
  'Octopus',
  'Dolphin',
  'Owl',
  'Unicorn',
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];

export const AVATAR_EMOJI: Record<AvatarKey, string> = {
  Fox: '🦊',
  Pig: '🐷',
  Frog: '🐸',
  Chicken: '🐥',
  Octopus: '🐙',
  Dolphin: '🐬',
  Owl: '🦉',
  Unicorn: '🦄',
};

export const AVATAR_COLORS: Record<AvatarKey, string> = {
  Fox: '#E2701F',
  Pig: '#F597B0',
  Frog: '#67B430',
  Chicken: '#F8D12C',
  Octopus: '#9A4FB8',
  Dolphin: '#3AA7D0',
  Owl: '#8B6C3A',
  Unicorn: '#B387FF',
};

export function giveRandomAvatar(): AvatarKey {
  const i = Math.floor(Math.random() * AVATAR_KEYS.length);
  return AVATAR_KEYS[i];
}

export function getAvatarInfo(avatarKey: AvatarKey): { emoji: string; color: string } {
  return {
    emoji: AVATAR_EMOJI[avatarKey],
    color: AVATAR_COLORS[avatarKey],
  };
}
