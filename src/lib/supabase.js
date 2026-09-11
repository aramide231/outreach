import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;

export function mapSoulFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    reacherId: row.reacher_id,
    saved: Boolean(row.saved),
    filled: Boolean(row.filled),
    healed: Boolean(row.healed),
    notes: row.notes || '',
    date: row.date,
    createdAt: row.created_at,
  };
}

export function mapSoulToDb(soul) {
  return {
    name: soul.name,
    reacher_id: soul.reacherId,
    saved: Boolean(soul.saved),
    filled: Boolean(soul.filled),
    healed: Boolean(soul.healed),
    notes: soul.notes || '',
    date: soul.date,
  };
}

export function mapProfileFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    color: row.color,
  };
}

export function mapProfileToDb(profile) {
  return {
    id: profile.id,
    name: profile.name,
    initials: profile.initials,
    color: profile.color,
  };
}
