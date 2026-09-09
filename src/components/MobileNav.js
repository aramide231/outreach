const TABS = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'souls', label: 'Souls', icon: 'users' },
  { id: 'analytics', label: 'Charts', icon: 'chart' },
  { id: 'team', label: 'Team', icon: 'team' },
];

function TabIcon({ name }) {
  const paths = {
    home: (
      <>
        <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c.7-3 2.7-4.7 5.5-4.7s4.8 1.7 5.5 4.7" />
        <circle cx="16.5" cy="8.5" r="2.3" />
        <path d="M15 14.5c1.8.4 3.2 1.7 3.7 3.5" />
      </>
    ),
    chart: (
      <>
        <path d="M5 19V10" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </>
    ),
    team: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 19c1-3.4 3.4-5.2 7-5.2s6 1.8 7 5.2" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {paths[name]}
    </svg>
  );
}

export default function MobileNav({ activeView, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Primary">
      {TABS.map((tab) => {
        const active =
          activeView === tab.id ||
          (tab.id === 'souls' && (activeView === 'saved' || activeView === 'filled')) ||
          (tab.id === 'analytics' && activeView === 'goals');

        return (
          <button
            key={tab.id}
            type="button"
            className={active ? 'active' : ''}
            onClick={() => onNavigate(tab.id)}
          >
            <TabIcon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
