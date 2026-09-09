import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS = {
  saved: '#1f9d63',
  filled: '#1a1a1a',
  pending: '#c5c9d1',
  both: '#4b5563',
};

export function GoalProgress({ stats }) {
  return (
    <div className="goal-strip">
      <div>
        <p className="eyebrow">Year goal</p>
        <h2>
          {stats.total}
          <span> / {stats.goal}</span>
        </h2>
      </div>
      <div className="goal-bar-wrap">
        <div className="goal-bar">
          <div style={{ width: `${stats.progressPct}%` }} />
        </div>
        <div className="goal-meta">
          <span>{stats.progressPct}% complete</span>
          <span>{stats.remaining} remaining · need ~{stats.neededPerWeek}/wk</span>
        </div>
      </div>
      <div className="goal-stats">
        <div>
          <strong>{stats.thisWeek}</strong>
          <span>This week</span>
        </div>
        <div>
          <strong>{stats.weeklyTarget}</strong>
          <span>Weekly target</span>
        </div>
        <div>
          <strong>{stats.weeksLeft}</strong>
          <span>Weeks left</span>
        </div>
      </div>
    </div>
  );
}

export function WeeklyChart({ weeklySeries }) {
  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <h3>Weekly Reach</h3>
          <p>Actual vs 7-per-week projection</p>
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeklySeries} barGap={6}>
            <CartesianGrid vertical={false} stroke="#eceff3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e8ebf0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }}
            />
            <Legend />
            <Bar dataKey="actual" name="Reached" fill="#1a1a1a" radius={[6, 6, 0, 0]} />
            <Bar dataKey="target" name="Target (7)" fill="#d7dbe3" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StatusDonut({ stats }) {
  const data = [
    { name: 'Saved', value: stats.saved, color: STATUS_COLORS.saved },
    { name: 'Filled', value: stats.filled, color: STATUS_COLORS.filled },
    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
  ].filter((d) => d.value > 0);

  const display = data.length
    ? data
    : [{ name: 'No data', value: 1, color: '#e8ebf0' }];

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Status Mix</h3>
          <p>Saved · Filled · Pending</p>
        </div>
      </div>
      <div className="donut-layout">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={display}
                dataKey="value"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={3}
                stroke="none"
              >
                {display.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>{stats.total}</strong>
            <span>souls</span>
          </div>
        </div>
        <ul className="legend-list">
          <li>
            <span className="swatch" style={{ background: STATUS_COLORS.saved }} />
            Saved <strong>{stats.saved}</strong>
          </li>
          <li>
            <span className="swatch" style={{ background: STATUS_COLORS.filled }} />
            Filled <strong>{stats.filled}</strong>
          </li>
          <li>
            <span className="swatch" style={{ background: STATUS_COLORS.pending }} />
            Pending <strong>{stats.pending}</strong>
          </li>
          <li>
            <span className="swatch" style={{ background: STATUS_COLORS.both }} />
            Both <strong>{stats.both}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function MemberBars({ byMember }) {
  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <h3>By Reacher</h3>
          <p>Souls recorded per team member</p>
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byMember} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid horizontal={false} stroke="#eceff3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e8ebf0',
              }}
            />
            <Bar dataKey="total" name="Total" fill="#1a1a1a" radius={[0, 6, 6, 0]} />
            <Bar dataKey="saved" name="Saved" fill="#1f9d63" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
