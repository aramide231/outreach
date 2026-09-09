import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TeamCards from './components/TeamCards';
import AddSoulForm from './components/AddSoulForm';
import SoulsTable from './components/SoulsTable';
import ActivityFeed from './components/ActivityFeed';
import {
  GoalProgress,
  MemberBars,
  StatusDonut,
  WeeklyChart,
} from './components/Charts';
import { TEAM } from './data/constants';
import { useSouls } from './hooks/useSouls';

function viewTitle(view, memberId) {
  const member = TEAM.find((t) => t.id === memberId);
  const scope = member ? member.name : 'Team';

  const titles = {
    dashboard: [`${scope} Dashboard`, 'Analytics + soul recording'],
    souls: ['Souls Log', 'Full list with Saved / Filled status'],
    analytics: ['Analytics', 'Weekly pace toward 100 souls'],
    team: ['Team', 'Progress by reacher'],
    saved: ['Saved', 'Souls marked as saved'],
    filled: ['Filled', 'Souls marked as filled'],
    goals: ['Weekly Goals', 'Track the 7-per-week projection'],
  };

  return titles[view] || titles.dashboard;
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    filteredSouls,
    stats,
    recentActivity,
    activeMemberId,
    setActiveMemberId,
    search,
    setSearch,
    addSoul,
    toggleSaved,
    toggleFilled,
    deleteSoul,
  } = useSouls();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const [title, subtitle] = viewTitle(view, activeMemberId);

  const tableSouls = useMemo(() => {
    if (view === 'saved') return filteredSouls.filter((s) => s.saved);
    if (view === 'filled') return filteredSouls.filter((s) => s.filled);
    return filteredSouls;
  }, [filteredSouls, view]);

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`}>
      <Sidebar
        activeView={view}
        onNavigate={setView}
        activeMemberId={activeMemberId}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <main className="main">
        <Header
          search={search}
          setSearch={setSearch}
          title={title}
          subtitle={subtitle}
          onMenuOpen={() => setMenuOpen(true)}
        />

        <TeamCards
          byMember={stats.byMember}
          activeMemberId={activeMemberId}
          onSelect={setActiveMemberId}
        />

        <GoalProgress stats={stats} />

        {(view === 'dashboard' || view === 'analytics' || view === 'goals') && (
          <div className="grid-2">
            <WeeklyChart weeklySeries={stats.weeklySeries} />
            <StatusDonut stats={stats} />
          </div>
        )}

        {(view === 'dashboard' || view === 'team' || view === 'analytics') && (
          <div className="grid-2">
            <MemberBars byMember={stats.byMember} />
            <ActivityFeed items={recentActivity} />
          </div>
        )}

        {(view === 'dashboard' ||
          view === 'souls' ||
          view === 'saved' ||
          view === 'filled') && (
          <div className="grid-form-table">
            <AddSoulForm onAdd={addSoul} defaultReacherId={activeMemberId} />
            <SoulsTable
              souls={tableSouls}
              onToggleSaved={toggleSaved}
              onToggleFilled={toggleFilled}
              onDelete={deleteSoul}
            />
          </div>
        )}
      </main>
    </div>
  );
}
