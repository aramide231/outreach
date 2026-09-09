export default function TeamCards({ byMember, activeMemberId, onSelect }) {
  return (
    <section className="team-row">
      <button
        type="button"
        className={`team-card overview ${activeMemberId === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
      >
        <span className="team-kicker">Overview</span>
        <strong>All Team</strong>
        <span className="team-meta">Combined progress</span>
      </button>

      {byMember.map((member) => (
        <button
          type="button"
          key={member.id}
          className={`team-card ${activeMemberId === member.id ? 'active' : ''}`}
          onClick={() => onSelect(member.id)}
        >
          <span className="team-kicker">{member.initials}</span>
          <strong>{member.name}</strong>
          <span className="team-meta">
            {member.total} souls · {member.thisWeek} this week
          </span>
        </button>
      ))}
    </section>
  );
}
