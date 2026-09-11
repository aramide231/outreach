export default function ActivityFeed({ items }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Recent Activity</h3>
          <p>Latest souls recorded</p>
        </div>
      </div>

      <ul className="activity-list">
        {items.length === 0 ? (
          <li className="empty-activity">Nothing yet — start recording.</li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <div className="activity-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                  <path d="M10 19a2 2 0 0 0 4 0" />
                </svg>
              </div>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <div className="activity-tags">
                  {item.saved ? <span className="tag green">Saved</span> : null}
                  {item.filled ? <span className="tag dark">Filled</span> : null}
                  {item.healed ? <span className="tag blue">Healed</span> : null}
                  {!item.saved && !item.filled && !item.healed ? (
                    <span className="tag muted">Pending</span>
                  ) : null}
                  <span className="tag muted">{item.date}</span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
