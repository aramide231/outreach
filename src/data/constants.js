export const GOAL_PER_PERSON = 100;
export const WEEKLY_TARGET = 7;
/** @deprecated use GOAL_PER_PERSON — kept for older imports */
export const GOAL_TOTAL = GOAL_PER_PERSON;

export const PROFILE_COLORS = [
  '#0f766e',
  '#b45309',
  '#1d4ed8',
  '#be123c',
  '#15803d',
  '#7c3aed',
  '#0e7490',
  '#c2410c',
  '#4338ca',
  '#a16207',
];

export const DEFAULT_TEAM = [
  { id: 'afolabi', name: 'Bro Afolabi', initials: 'AF', color: '#0f766e' },
  { id: 'teju', name: 'Sis Teju', initials: 'TJ', color: '#b45309' },
  { id: 'damilare', name: 'Bro Damilare', initials: 'DM', color: '#1d4ed8' },
  { id: 'simisola', name: 'Sis Simisola', initials: 'SM', color: '#be123c' },
  { id: 'aramide', name: 'Bro Aramide', initials: 'AR', color: '#15803d' },
];

/** @deprecated use DEFAULT_TEAM / dynamic team from hook */
export const TEAM = DEFAULT_TEAM;

export const STORAGE_KEY = 'outreach-souls-v1';
export const TEAM_STORAGE_KEY = 'outreach-team-v1';

export function makeInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function makeProfileId(name) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return `${base || 'member'}-${Date.now().toString(36)}`;
}
