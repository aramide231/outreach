function shade(hex, amount = -20) {
  const raw = hex.replace('#', '');
  const num = parseInt(raw, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default function TeamCards({ byMember, activeMemberId, onSelect }) {
  return (
    <section className="team-row">
      <button
        type="button"
        className={`team-card overview ${activeMemberId === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
        style={{
          '--card-color': '#0f172a',
          '--card-color-end': '#1f9d63',
        }}
      >
        <span className="team-kicker">Overview</span>
        <strong>All Team</strong>
        <span className="team-meta">Combined progress</span>
      </button>

      {byMember.map((member) => {
        const isActive = activeMemberId === member.id;
        return (
          <button
            type="button"
            key={member.id}
            className={`team-card ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(member.id)}
            style={{
              '--card-color': member.color,
              '--card-color-end': shade(member.color, -28),
            }}
          >
            <span className="team-kicker">{member.initials}</span>
            <strong>{member.name}</strong>
            <span className="team-meta">
              {member.total} souls · {member.thisWeek} this week
            </span>
          </button>
        );
      })}
    </section>
  );
}
