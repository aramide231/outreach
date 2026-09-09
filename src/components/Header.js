export default function Header({
  search,
  setSearch,
  title,
  subtitle,
  onMenuOpen,
}) {
  return (
    <header className="topbar">
      <div className="topbar-row">
        <button
          type="button"
          className="icon-btn menu-btn"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="page-heading">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <div className="topbar-user">
          <button type="button" className="bell" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
            <span className="dot" />
          </button>
          <div className="user-chip">
            <div className="avatar sm">AR</div>
            <div className="user-chip-text">
              <strong>Aramide</strong>
              <span>100 souls · 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder="Search souls or reachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </header>
  );
}
