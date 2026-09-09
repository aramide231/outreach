import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TeamCards from './components/TeamCards';
import AddSoulForm from './components/AddSoulForm';
import SoulsTable from './components/SoulsTable';
import ActivityFeed from './components/ActivityFeed';
import MobileNav from './components/MobileNav';
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
    dashboard: [`${scope} Home`, 'Track & record souls'],
    souls: ['Souls Log', 'Names · Saved · Filled'],
    analytics: ['Analytics', 'Pace toward 100'],
    team: ['Team', 'Each reacher'],
    saved: ['Saved', 'Marked saved'],
    filled: ['Filled', 'Marked filled'],
    goals: ['Weekly Goals', '7 per week'],
  };

  return titles[view] || titles.dashboard;
}

function useIsPhone(maxWidth = 768) {
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= maxWidth : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [maxWidth]);

  return isPhone;
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const isPhone = useIsPhone(768);
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

  const showTeamCards = !isPhone || view === 'dashboard' || view === 'team';
  const showGoal = view === 'dashboard' || view === 'analytics' || view === 'goals' || view === 'team';
  const showCharts =
    view === 'analytics' ||
    view === 'goals' ||
    (!isPhone && (view === 'dashboard' || view === 'team'));
  const showMemberBars =
    view === 'team' || view === 'analytics' || (!isPhone && view === 'dashboard');
  const showActivity = view === 'dashboard' || (!isPhone && view === 'team');
  const showLog =
    view === 'souls' ||
    view === 'saved' ||
    view === 'filled' ||
    (!isPhone && view === 'dashboard') ||
    (isPhone && view === 'dashboard');

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''} ${isPhone ? 'is-phone' : ''}`}>
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

        {showTeamCards ? (
          <TeamCards
            byMember={stats.byMember}
            activeMemberId={activeMemberId}
            onSelect={setActiveMemberId}
          />
        ) : null}

        {showGoal ? <GoalProgress stats={stats} /> : null}

        {isPhone && view === 'dashboard' ? (
          <div className="phone-home-stats">
            <div className="stat-tile">
              <strong>{stats.saved}</strong>
              <span>Saved</span>
            </div>
            <div className="stat-tile">
              <strong>{stats.filled}</strong>
              <span>Filled</span>
            </div>
            <div className="stat-tile">
              <strong>{stats.thisWeek}/{stats.weeklyTarget}</strong>
              <span>This week</span>
            </div>
          </div>
        ) : null}

        {showCharts ? (
          <div className="grid-2">
            <WeeklyChart weeklySeries={stats.weeklySeries} compact={isPhone} />
            <StatusDonut stats={stats} compact={isPhone} />
          </div>
        ) : null}

        {showMemberBars ? (
          <div className={isPhone ? 'stack' : 'grid-2'}>
            <MemberBars byMember={stats.byMember} compact={isPhone} />
            {!isPhone ? <ActivityFeed items={recentActivity} /> : null}
          </div>
        ) : null}

        {isPhone && showActivity ? <ActivityFeed items={recentActivity} /> : null}

        {showLog ? (
          <div className="grid-form-table">
            <AddSoulForm onAdd={addSoul} defaultReacherId={activeMemberId} />
            {(view !== 'dashboard' || !isPhone) ? (
              <SoulsTable
                souls={tableSouls}
                onToggleSaved={toggleSaved}
                onToggleFilled={toggleFilled}
                onDelete={deleteSoul}
              />
            ) : (
              <button
                type="button"
                className="primary-btn full-width"
                onClick={() => setView('souls')}
              >
                View full souls log ({filteredSouls.length})
              </button>
            )}
          </div>
        ) : null}
      </main>

      <MobileNav activeView={view} onNavigate={setView} />
    </div>
  );
}
