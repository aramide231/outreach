import { TEAM } from '../data/constants';

function StatusChecks({ soul, onToggleSaved, onToggleFilled }) {
  return (
    <div className="status-checks">
      <label className="check-row">
        <span className="check-label">Saved</span>
        <span className="check">
          <input
            type="checkbox"
            checked={soul.saved}
            onChange={() => onToggleSaved(soul.id)}
          />
          <span />
        </span>
      </label>
      <label className="check-row">
        <span className="check-label">Filled</span>
        <span className="check filled">
          <input
            type="checkbox"
            checked={soul.filled}
            onChange={() => onToggleFilled(soul.id)}
          />
          <span />
        </span>
      </label>
    </div>
  );
}

export default function SoulsTable({
  souls,
  onToggleSaved,
  onToggleFilled,
  onDelete,
}) {
  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <div>
          <h3>Souls Log</h3>
          <p>Record names · mark Saved / Filled</p>
        </div>
        <span className="count-pill">{souls.length} listed</span>
      </div>

      <div className="table-scroll desktop-only">
        <table className="souls-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Reacher</th>
              <th>Date</th>
              <th>Saved</th>
              <th>Filled</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {souls.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  No souls recorded yet. Add the first one below.
                </td>
              </tr>
            ) : (
              souls.map((soul) => {
                const reacher = TEAM.find((t) => t.id === soul.reacherId);
                return (
                  <tr key={soul.id}>
                    <td>
                      <strong>{soul.name}</strong>
                    </td>
                    <td>
                      <span className="reacher-chip">
                        <span className="avatar xs">{reacher?.initials || '?'}</span>
                        {reacher?.name || '—'}
                      </span>
                    </td>
                    <td>{soul.date}</td>
                    <td>
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={soul.saved}
                          onChange={() => onToggleSaved(soul.id)}
                        />
                        <span />
                      </label>
                    </td>
                    <td>
                      <label className="check filled">
                        <input
                          type="checkbox"
                          checked={soul.filled}
                          onChange={() => onToggleFilled(soul.id)}
                        />
                        <span />
                      </label>
                    </td>
                    <td className="notes">{soul.notes || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="text-danger"
                        onClick={() => onDelete(soul.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="souls-cards mobile-only">
        {souls.length === 0 ? (
          <p className="empty">No souls recorded yet. Add the first one above.</p>
        ) : (
          souls.map((soul) => {
            const reacher = TEAM.find((t) => t.id === soul.reacherId);
            return (
              <article className="soul-card" key={soul.id}>
                <div className="soul-card-top">
                  <div>
                    <strong>{soul.name}</strong>
                    <span className="reacher-chip">
                      <span className="avatar xs">{reacher?.initials || '?'}</span>
                      {reacher?.name || '—'} · {soul.date}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-danger"
                    onClick={() => onDelete(soul.id)}
                  >
                    Remove
                  </button>
                </div>
                <StatusChecks
                  soul={soul}
                  onToggleSaved={onToggleSaved}
                  onToggleFilled={onToggleFilled}
                />
                {soul.notes ? <p className="soul-card-notes">{soul.notes}</p> : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
