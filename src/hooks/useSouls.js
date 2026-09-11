import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_TEAM,
  GOAL_PER_PERSON,
  PROFILE_COLORS,
  STORAGE_KEY,
  TEAM_STORAGE_KEY,
  WEEKLY_TARGET,
  makeInitials,
  makeProfileId,
} from '../data/constants';
import {
  isSupabaseConfigured,
  mapProfileFromDb,
  mapProfileToDb,
  mapSoulFromDb,
  mapSoulToDb,
  supabase,
} from '../lib/supabase';

function loadLocalSouls() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((s) => ({ ...s, healed: Boolean(s.healed) }));
  } catch {
    return [];
  }
}

function loadLocalTeam() {
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return DEFAULT_TEAM;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_TEAM;
  } catch {
    return DEFAULT_TEAM;
  }
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekKey(date) {
  const start = startOfWeek(date);
  return start.toISOString().slice(0, 10);
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function useSouls() {
  const usingDb = isSupabaseConfigured;
  const [souls, setSouls] = useState(() => (usingDb ? [] : loadLocalSouls()));
  const [team, setTeam] = useState(loadLocalTeam);
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(usingDb);
  const [dbError, setDbError] = useState('');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    if (!usingDb) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(souls));
    }
  }, [souls, usingDb]);

  useEffect(() => {
    if (!usingDb || !supabase) return undefined;

    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setDbError('');

      const [soulsRes, profilesRes] = await Promise.all([
        supabase.from('souls').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      ]);

      if (cancelled) return;

      if (soulsRes.error) {
        setDbError(soulsRes.error.message);
        setDbReady(false);
        setLoading(false);
        return;
      }

      if (profilesRes.error) {
        // profiles table may not exist yet — keep local/default team
        setDbError(
          /schema cache|does not exist|Could not find the table/i.test(profilesRes.error.message)
            ? 'Run supabase/migrate-v2.sql in Supabase (adds Healed + profiles).'
            : profilesRes.error.message
        );
      } else if ((profilesRes.data || []).length > 0) {
        setTeam(profilesRes.data.map(mapProfileFromDb));
      } else {
        // Seed default team into shared DB once
        const seed = DEFAULT_TEAM.map(mapProfileToDb);
        const { error: seedError } = await supabase.from('profiles').insert(seed);
        if (!seedError && !cancelled) setTeam(DEFAULT_TEAM);
      }

      let mappedSouls = (soulsRes.data || []).map(mapSoulFromDb);
      // healed missing column → treat as false (older rows)
      mappedSouls = mappedSouls.map((s) => ({ ...s, healed: Boolean(s.healed) }));
      setSouls(mappedSouls);
      setDbReady(true);
      setLoading(false);

      try {
        const local = loadLocalSouls();
        if (local.length && mappedSouls.length === 0) {
          const rows = local.map(mapSoulToDb);
          const { error: migrateError } = await supabase.from('souls').insert(rows);
          if (!migrateError) {
            localStorage.removeItem(STORAGE_KEY);
            const refreshed = await supabase
              .from('souls')
              .select('*')
              .order('created_at', { ascending: false });
            if (!cancelled && refreshed.data) {
              setSouls(refreshed.data.map(mapSoulFromDb));
            }
          }
        }
      } catch {
        /* ignore */
      }
    }

    fetchAll();

    const channel = supabase
      .channel('outreach-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'souls' }, () => {
        fetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAll();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [usingDb]);

  const addProfile = useCallback(
    async (name) => {
      const trimmed = name.trim();
      if (!trimmed) return null;

      const profile = {
        id: makeProfileId(trimmed),
        name: trimmed,
        initials: makeInitials(trimmed),
        color: PROFILE_COLORS[team.length % PROFILE_COLORS.length],
      };

      setTeam((prev) => [...prev, profile]);
      setActiveMemberId(profile.id);

      if (usingDb && supabase) {
        const { error } = await supabase.from('profiles').insert(mapProfileToDb(profile));
        if (error) {
          setDbError(
            /schema cache|does not exist|Could not find the table/i.test(error.message)
              ? 'Run supabase/migrate-v2.sql in Supabase (adds Healed + profiles).'
              : error.message
          );
        }
      }

      return profile;
    },
    [team.length, usingDb]
  );

  const addSoul = useCallback(
    async (payload) => {
      const entry = {
        id: crypto.randomUUID(),
        name: payload.name.trim(),
        reacherId: payload.reacherId,
        saved: Boolean(payload.saved),
        filled: Boolean(payload.filled),
        healed: Boolean(payload.healed),
        notes: payload.notes?.trim() || '',
        date: payload.date || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };

      if (!usingDb || !supabase) {
        setSouls((prev) => [entry, ...prev]);
        return entry;
      }

      const { data, error } = await supabase
        .from('souls')
        .insert(mapSoulToDb(entry))
        .select('*')
        .single();

      if (error) {
        setDbError(
          /healed|schema cache/i.test(error.message)
            ? 'Run supabase/migrate-v2.sql in Supabase (adds Healed + profiles).'
            : error.message
        );
        throw error;
      }

      const mapped = mapSoulFromDb(data);
      setSouls((prev) => [mapped, ...prev.filter((s) => s.id !== mapped.id)]);
      return mapped;
    },
    [usingDb]
  );

  const updateSoul = useCallback(
    async (id, patch) => {
      setSouls((prev) =>
        prev.map((soul) => (soul.id === id ? { ...soul, ...patch } : soul))
      );

      if (!usingDb || !supabase) return;

      const dbPatch = {};
      if ('name' in patch) dbPatch.name = patch.name;
      if ('reacherId' in patch) dbPatch.reacher_id = patch.reacherId;
      if ('saved' in patch) dbPatch.saved = patch.saved;
      if ('filled' in patch) dbPatch.filled = patch.filled;
      if ('healed' in patch) dbPatch.healed = patch.healed;
      if ('notes' in patch) dbPatch.notes = patch.notes;
      if ('date' in patch) dbPatch.date = patch.date;

      const { error } = await supabase.from('souls').update(dbPatch).eq('id', id);
      if (error) {
        setDbError(
          /healed|schema cache/i.test(error.message)
            ? 'Run supabase/migrate-v2.sql in Supabase (adds Healed + profiles).'
            : error.message
        );
      }
    },
    [usingDb]
  );

  const toggleSaved = useCallback(
    async (id) => {
      const current = souls.find((s) => s.id === id);
      if (!current) return;
      await updateSoul(id, { saved: !current.saved });
    },
    [souls, updateSoul]
  );

  const toggleFilled = useCallback(
    async (id) => {
      const current = souls.find((s) => s.id === id);
      if (!current) return;
      await updateSoul(id, { filled: !current.filled });
    },
    [souls, updateSoul]
  );

  const toggleHealed = useCallback(
    async (id) => {
      const current = souls.find((s) => s.id === id);
      if (!current) return;
      await updateSoul(id, { healed: !current.healed });
    },
    [souls, updateSoul]
  );

  const deleteSoul = useCallback(
    async (id) => {
      setSouls((prev) => prev.filter((soul) => soul.id !== id));
      if (!usingDb || !supabase) return;
      const { error } = await supabase.from('souls').delete().eq('id', id);
      if (error) setDbError(error.message);
    },
    [usingDb]
  );

  const filteredSouls = useMemo(() => {
    return souls.filter((soul) => {
      const matchesMember =
        activeMemberId === 'all' || soul.reacherId === activeMemberId;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        soul.name.toLowerCase().includes(q) ||
        team.find((t) => t.id === soul.reacherId)?.name.toLowerCase().includes(q);
      return matchesMember && matchesSearch;
    });
  }, [souls, activeMemberId, search, team]);

  const stats = useMemo(() => {
    const scoped =
      activeMemberId === 'all'
        ? souls
        : souls.filter((s) => s.reacherId === activeMemberId);

    const total = scoped.length;
    const saved = scoped.filter((s) => s.saved).length;
    const filled = scoped.filter((s) => s.filled).length;
    const healed = scoped.filter((s) => s.healed).length;
    const pending = scoped.filter(
      (s) => !s.saved && !s.filled && !s.healed
    ).length;

    const thisWeekStart = startOfWeek(new Date());
    const thisWeek = scoped.filter(
      (s) => new Date(s.date) >= thisWeekStart
    ).length;

    const byMember = team.map((member) => {
      const list = souls.filter((s) => s.reacherId === member.id);
      const memberTotal = list.length;
      return {
        ...member,
        total: memberTotal,
        saved: list.filter((s) => s.saved).length,
        filled: list.filter((s) => s.filled).length,
        healed: list.filter((s) => s.healed).length,
        thisWeek: list.filter((s) => new Date(s.date) >= thisWeekStart).length,
        goal: GOAL_PER_PERSON,
        remaining: Math.max(0, GOAL_PER_PERSON - memberTotal),
        progressPct: Math.min(
          100,
          Math.round((memberTotal / GOAL_PER_PERSON) * 100)
        ),
      };
    });

    const memberCount = Math.max(1, team.length);
    const goal =
      activeMemberId === 'all'
        ? GOAL_PER_PERSON * memberCount
        : GOAL_PER_PERSON;
    const remaining =
      activeMemberId === 'all'
        ? byMember.reduce((sum, m) => sum + m.remaining, 0)
        : Math.max(0, GOAL_PER_PERSON - total);

    const weeksMap = new Map();
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = weekKey(d);
      weeksMap.set(key, {
        key,
        label: `W${getWeekNumber(d)}`,
        actual: 0,
        target: WEEKLY_TARGET,
      });
    }

    scoped.forEach((soul) => {
      const key = weekKey(new Date(soul.date));
      if (weeksMap.has(key)) {
        weeksMap.get(key).actual += 1;
      }
    });

    const weeklySeries = Array.from(weeksMap.values());
    const progressPct = Math.min(100, Math.round((total / goal) * 100));
    const weeksLeft = Math.max(
      1,
      Math.ceil((new Date(now.getFullYear(), 11, 31) - now) / (7 * 86400000))
    );
    const neededPerWeek = Math.ceil(remaining / weeksLeft);

    return {
      total,
      saved,
      filled,
      healed,
      pending,
      thisWeek,
      byMember,
      weeklySeries,
      progressPct,
      remaining,
      weeksLeft,
      neededPerWeek,
      goal,
      goalPerPerson: GOAL_PER_PERSON,
      weeklyTarget: WEEKLY_TARGET,
      isTeamView: activeMemberId === 'all',
    };
  }, [souls, activeMemberId, team]);

  const recentActivity = useMemo(() => {
    return [...souls]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((soul) => {
        const reacher = team.find((t) => t.id === soul.reacherId);
        return {
          id: soul.id,
          title: soul.name,
          detail: `${reacher?.name || 'Unknown'} recorded a soul`,
          date: soul.date,
          saved: soul.saved,
          filled: soul.filled,
          healed: soul.healed,
        };
      });
  }, [souls, team]);

  return {
    souls,
    team,
    filteredSouls,
    stats,
    recentActivity,
    activeMemberId,
    setActiveMemberId,
    search,
    setSearch,
    addSoul,
    addProfile,
    updateSoul,
    toggleSaved,
    toggleFilled,
    toggleHealed,
    deleteSoul,
    loading,
    dbError,
    dbReady,
    usingDb,
  };
}
