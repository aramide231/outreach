import { useEffect, useState } from 'react';
import { TEAM } from '../data/constants';

const empty = {
  name: '',
  reacherId: TEAM[0].id,
  date: new Date().toISOString().slice(0, 10),
  saved: false,
  filled: false,
  notes: '',
};

function resolveReacher(defaultReacherId) {
  return defaultReacherId && defaultReacherId !== 'all'
    ? defaultReacherId
    : TEAM[0].id;
}

export default function AddSoulForm({ onAdd, defaultReacherId }) {
  const [form, setForm] = useState({
    ...empty,
    reacherId: resolveReacher(defaultReacherId),
  });
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      reacherId: resolveReacher(defaultReacherId),
    }));
  }, [defaultReacherId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await onAdd(form);
      setForm({
        ...empty,
        reacherId:
          defaultReacherId && defaultReacherId !== 'all'
            ? defaultReacherId
            : form.reacherId,
        date: new Date().toISOString().slice(0, 10),
      });
    } catch {
      // DbBanner shows the error
    }
  }

  return (
    <div className="panel form-panel">
      <div className="panel-head">
        <div>
          <h3>Record a Soul</h3>
          <p>Name + Saved / Filled status</p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      {open ? (
        <form className="soul-form" onSubmit={handleSubmit}>
          <label>
            Soul&apos;s name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </label>

          <label>
            Reacher
            <select
              value={form.reacherId}
              onChange={(e) => setForm({ ...form, reacherId: e.target.value })}
            >
              {TEAM.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date reached
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <div className="status-toggles">
            <label className="toggle-card">
              <input
                type="checkbox"
                checked={form.saved}
                onChange={(e) => setForm({ ...form, saved: e.target.checked })}
              />
              <span>
                <strong>Saved</strong>
                Accepted Christ
              </span>
            </label>
            <label className="toggle-card">
              <input
                type="checkbox"
                checked={form.filled}
                onChange={(e) => setForm({ ...form, filled: e.target.checked })}
              />
              <span>
                <strong>Filled</strong>
                Holy Spirit baptism
              </span>
            </label>
          </div>

          <label className="full">
            Notes (optional)
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Follow-up, location, etc."
            />
          </label>

          <button type="submit" className="primary-btn">
            Add to log
          </button>
        </form>
      ) : null}
    </div>
  );
}
