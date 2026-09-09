import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GOAL_TOTAL,
  STORAGE_KEY,
  TEAM,
  WEEKLY_TARGET,
} from '../data/constants';

function loadSouls() {
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
  const [souls, setSouls] = useState(loadSouls);
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(souls));
  }, [souls]);

  const addSoul = useCallback((payload) => {
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
    setSouls((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const updateSoul = useCallback((id, patch) => {
    setSouls((prev) =>
      prev.map((soul) => (soul.id === id ? { ...soul, ...patch } : soul))
    );
  }, []);

  const toggleSaved = useCallback((id) => {
    setSouls((prev) =>
      prev.map((soul) =>
        soul.id === id ? { ...soul, saved: !soul.saved } : soul
      )
    );
  }, []);

  const toggleFilled = useCallback((id) => {
    setSouls((prev) =>
      prev.map((soul) =>
        soul.id === id ? { ...soul, filled: !soul.filled } : soul
      )
    );
  }, []);

  const deleteSoul = useCallback((id) => {
    setSouls((prev) => prev.filter((soul) => soul.id !== id));
  }, []);

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
  };
}
