import { useEffect, useRef, useState } from 'react';

function StatusChecks({ soul, onToggleSaved, onToggleFilled, onToggleHealed }) {
  return (
    <div className="status-checks three">
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
      <label className="check-row">
        <span className="check-label">Healed</span>
        <span className="check healed">
          <input
            type="checkbox"
            checked={soul.healed}
            onChange={() => onToggleHealed(soul.id)}
          />
          <span />
        </span>
      </label>
    </div>
  );
}

function useDeleteMenu(onDelete) {
  const [menu, setMenu] = useState(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return undefined;

    function close() {
      setMenu(null);
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    function onPointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        close();
      }
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menu]);

  function openMenu(soul, clientX, clientY) {
    const pad = 8;
    const x = Math.min(clientX, window.innerWidth - 160);
    const y = Math.min(clientY, window.innerHeight - 80);
    setMenu({
      soulId: soul.id,
      name: soul.name,
      x: Math.max(pad, x),
      y: Math.max(pad, y),
    });
  }

  function onContextMenu(e, soul) {
    e.preventDefault();
    openMenu(soul, e.clientX, e.clientY);
  }

  function onTouchStart(e, soul) {
    longPressTriggered.current = false;
    const touch = e.touches[0];
    if (!touch) return;

    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      openMenu(soul, touch.clientX, touch.clientY);
    }, 550);
  }

  function clearLongPress() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function onTouchEnd(e) {
    clearLongPress();
    if (longPressTriggered.current) {
      e.preventDefault();
    }
  }

  function confirmDelete() {
    if (!menu) return;
    const ok = window.confirm(`Remove "${menu.name}" from the souls log?`);
    if (ok) onDelete(menu.soulId);
    setMenu(null);
  }

  function Menu() {
    if (!menu) return null;
    return (
      <div
        ref={menuRef}
        className="context-menu"
        style={{ top: menu.y, left: menu.x }}
        role="menu"
      >
        <p className="context-menu-label">{menu.name}</p>
        <button type="button" className="context-delete" onClick={confirmDelete}>
          Remove
        </button>
      </div>
    );
  }

  return {
    Menu,
    onContextMenu,
    onTouchStart,
    onTouchMove: clearLongPress,
    onTouchEnd,
    onTouchCancel: clearLongPress,
  };
}

export default function SoulsTable({
  souls,
  team,
  onToggleSaved,
  onToggleFilled,
  onToggleHealed,
  onDelete,
}) {
  const {
    Menu,
    onContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  } = useDeleteMenu(onDelete);

  const pressHandlers = (soul) => ({
    onContextMenu: (e) => onContextMenu(e, soul),
    onTouchStart: (e) => onTouchStart(e, soul),
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  });

  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <div>
          <h3>Souls Log</h3>
          <p>Right-click or long-press a row to remove</p>
        </div>
        <span className="count-pill">{souls.length} listed</span>
      </div>

      <div className="table-scroll desktop-only">
        <table className="souls-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Recorded by</th>
              <th>Date</th>
              <th>Saved</th>
              <th>Filled</th>
              <th>Healed</th>
              <th>Notes</th>
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
                const reacher = team.find((t) => t.id === soul.reacherId);
                return (
                  <tr key={soul.id} className="soul-row" {...pressHandlers(soul)}>
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
                    <td>
                      <label className="check healed">
                        <input
                          type="checkbox"
                          checked={soul.healed}
                          onChange={() => onToggleHealed(soul.id)}
                        />
                        <span />
                      </label>
                    </td>
                    <td className="notes">{soul.notes || '—'}</td>
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
            const reacher = team.find((t) => t.id === soul.reacherId);
            return (
              <article
                className="soul-card"
                key={soul.id}
                {...pressHandlers(soul)}
              >
                <div className="soul-card-top">
                  <div>
                    <strong>{soul.name}</strong>
                    <span className="reacher-chip">
                      <span className="avatar xs">{reacher?.initials || '?'}</span>
                      {reacher?.name || '—'} · {soul.date}
                    </span>
                  </div>
                </div>
                <StatusChecks
                  soul={soul}
                  onToggleSaved={onToggleSaved}
                  onToggleFilled={onToggleFilled}
                  onToggleHealed={onToggleHealed}
                />
                {soul.notes ? <p className="soul-card-notes">{soul.notes}</p> : null}
              </article>
            );
          })
        )}
      </div>

      <Menu />
    </div>
  );
}
