import { TEAM } from '../data/constants';

const NAV = [
  {
    label: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
      { id: 'souls', label: 'Souls Log', icon: 'users' },
      { id: 'analytics', label: 'Analytics', icon: 'chart' },
      { id: 'team', label: 'Team', icon: 'team' },
    ],
  },
  {
    label: 'Outreach',
    items: [
      { id: 'saved', label: 'Saved', icon: 'check' },
      { id: 'filled', label: 'Filled', icon: 'fill' },
      { id: 'healed', label: 'Healed', icon: 'target' },
      { id: 'goals', label: 'Weekly Goals', icon: 'target' },
    ],
  },
];

function Icon({ name }) {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3.5 19c.8-3.2 2.9-5 5.5-5s4.7 1.8 5.5 5" />
        <circle cx="16.5" cy="8.5" r="2.5" />
        <path d="M15 14.2c2 .4 3.5 1.8 4 3.8" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M20 19H3" />
      </>
    ),
    team: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 19c1-3.5 3.5-5.5 7-5.5s6 2 7 5.5" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </>
    ),
    fill: (
      <>
        <path d="M12 4l7 12H5L12 4z" />
        <path d="M12 10v4" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      {paths[name]}
    </svg>
  );
}

export default function Sidebar({
  activeView,
  onNavigate,
  activeMemberId,
  open,
  onClose,
  team = TEAM,
}) {
  const activeMember =
    activeMemberId !== 'all'
      ? team.find((t) => t.id === activeMemberId)
      : null;

  function handleNavigate(id) {
    onNavigate(id);
    onClose?.();
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">OS</div>
            <div>
              <strong>Outreach</strong>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="profile-card">
          <div className="avatar">{activeMember?.initials || 'TM'}</div>
          <div>
            <strong>{activeMember?.name || 'Team View'}</strong>
          </div>
        </div>

        {NAV.map((section) => (
          <div className="nav-section" key={section.label}>
            <p className="nav-label">{section.label}</p>
            <ul>
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={activeView === item.id ? 'active' : ''}
                    onClick={() => handleNavigate(item.id)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sidebar-footer">
          <button type="button" className="ghost">
            <Icon name="settings" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
