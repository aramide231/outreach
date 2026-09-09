import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GOAL_TOTAL,
  STORAGE_KEY,
  TEAM,
  WEEKLY_TARGET,
} from '../data/constants';
import {
  isSupabaseConfigured,
  mapSoulFromDb,
  mapSoulToDb,
  supabase,
} from '../lib/supabase';

function loadLocalSouls() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
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
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(usingDb);
  const [dbError, setDbError] = useState('');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (!usingDb) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(souls));
    }
  }, [souls, usingDb]);

  useEffect(() => {
    if (!usingDb || !supabase) return undefined;

    let cancelled = false;

    async function fetchSouls() {
      setLoading(true);
      setDbError('');
      const { data, error } = await supabase
        .from('souls')
        .select('*')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        setDbError(error.message);
        setDbReady(false);
        setLoading(false);
        return;
      }

      setSouls((data || []).map(mapSoulFromDb));
      setDbReady(true);
      setLoading(false);

      // One-time: move any old phone-only local souls into the shared DB
      try {
        const local = loadLocalSouls();
        if (local.length && (data || []).length === 0) {
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
        /* ignore migrate issues */
      }
    }

    fetchSouls();

    const channel = supabase
      .channel('souls-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'souls' },
        () => {
          fetchSouls();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [usingDb]);

  const addSoul = useCallback(
    async (payload) => {
      const entry = {
        id: crypto.randomUUID(),
        name: payload.name.trim(),
        reacherId: payload.reacherId,
        saved: Boolean(payload.saved),
        filled: Boolean(payload.filled),
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
        setDbError(error.message);
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
      if ('notes' in patch) dbPatch.notes = patch.notes;
      if ('date' in patch) dbPatch.date = patch.date;

      const { error } = await supabase.from('souls').update(dbPatch).eq('id', id);
      if (error) setDbError(error.message);
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
        TEAM.find((t) => t.id === soul.reacherId)?.name.toLowerCase().includes(q);
      return matchesMember && matchesSearch;
    });
  }, [souls, activeMemberId, search]);

  const stats = useMemo(() => {
    const scoped =
      activeMemberId === 'all'
        ? souls
        : souls.filter((s) => s.reacherId === activeMemberId);

    const total = scoped.length;
    const saved = scoped.filter((s) => s.saved).length;
    const filled = scoped.filter((s) => s.filled).length;
    const pending = scoped.filter((s) => !s.saved && !s.filled).length;
    const both = scoped.filter((s) => s.saved && s.filled).length;

    const thisWeekStart = startOfWeek(new Date());
    const thisWeek = scoped.filter(
      (s) => new Date(s.date) >= thisWeekStart
    ).length;

    const byMember = TEAM.map((member) => {
      const list = souls.filter((s) => s.reacherId === member.id);
      return {
        ...member,
        total: list.length,
        saved: list.filter((s) => s.saved).length,
        filled: list.filter((s) => s.filled).length,
        thisWeek: list.filter((s) => new Date(s.date) >= thisWeekStart).length,
      };
    });

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
    const progressPct = Math.min(100, Math.round((total / GOAL_TOTAL) * 100));
    const remaining = Math.max(0, GOAL_TOTAL - total);
    const weeksLeft = Math.max(
      1,
      Math.ceil((new Date(now.getFullYear(), 11, 31) - now) / (7 * 86400000))
    );
    const neededPerWeek = Math.ceil(remaining / weeksLeft);

    return {
      total,
      saved,
      filled,
      pending,
      both,
      thisWeek,
      byMember,
      weeklySeries,
      progressPct,
      remaining,
      weeksLeft,
      neededPerWeek,
      goal: GOAL_TOTAL,
      weeklyTarget: WEEKLY_TARGET,
    };
  }, [souls, activeMemberId]);

  const recentActivity = useMemo(() => {
    return [...souls]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((soul) => {
        const reacher = TEAM.find((t) => t.id === soul.reacherId);
        return {
          id: soul.id,
          title: soul.name,
          detail: `${reacher?.name || 'Unknown'} recorded a soul`,
          date: soul.date,
          saved: soul.saved,
          filled: soul.filled,
        };
      });
  }, [souls]);

  return {
    souls,
    filteredSouls,
    stats,
    recentActivity,
    activeMemberId,
    setActiveMemberId,
    search,
    setSearch,
    addSoul,
    updateSoul,
    toggleSaved,
    toggleFilled,
    deleteSoul,
    loading,
    dbError,
    dbReady,
    usingDb,
  };
}
