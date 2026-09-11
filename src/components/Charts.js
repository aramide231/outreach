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
  healed: '#2563eb',
  pending: '#c5c9d1',
};

export function GoalProgress({ stats }) {
  return (
    <div className="goal-strip">
      <div>
        <p className="eyebrow">
          {stats.isTeamView
            ? `Team goal (${stats.goalPerPerson} each)`
            : 'Personal goal'}
        </p>
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

export function WeeklyChart({ weeklySeries, compact = false }) {
  const height = compact ? 200 : 260;
  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <h3>Weekly Reach</h3>
          <p>Actual vs 7-per-week projection</p>
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={weeklySeries}
            barGap={compact ? 2 : 6}
            margin={compact ? { top: 4, right: 4, left: -18, bottom: 0 } : undefined}
          >
            <CartesianGrid vertical={false} stroke="#eceff3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={{ fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e8ebf0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }}
            />
            {!compact ? <Legend /> : null}
            <Bar dataKey="actual" name="Reached" fill="#1a1a1a" radius={[6, 6, 0, 0]} />
            <Bar dataKey="target" name="Target (7)" fill="#d7dbe3" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StatusDonut({ stats, compact = false }) {
  const data = [
    { name: 'Saved', value: stats.saved, color: STATUS_COLORS.saved },
    { name: 'Filled', value: stats.filled, color: STATUS_COLORS.filled },
    { name: 'Healed', value: stats.healed, color: STATUS_COLORS.healed },
    { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
  ].filter((d) => d.value > 0);

  const display = data.length
    ? data
    : [{ name: 'No data', value: 1, color: '#e8ebf0' }];

  const chartH = compact ? 150 : 180;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Status Mix</h3>
          <p>Saved · Filled · Healed · Pending</p>
        </div>
      </div>
      <div className="donut-layout">
        <div className="donut-chart" style={{ height: chartH }}>
          <ResponsiveContainer width="100%" height={chartH}>
            <PieChart>
              <Pie
                data={display}
                dataKey="value"
                innerRadius={compact ? 42 : 55}
                outerRadius={compact ? 62 : 78}
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
            <span className="swatch" style={{ background: STATUS_COLORS.healed }} />
            Healed <strong>{stats.healed}</strong>
          </li>
          <li>
            <span className="swatch" style={{ background: STATUS_COLORS.pending }} />
            Pending <strong>{stats.pending}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function MemberBars({ byMember, compact = false }) {
  return (
    <div className="panel chart-panel">
      <div className="panel-head">
        <div>
          <h3>By Reacher</h3>
          <p>Souls recorded per team member</p>
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={compact ? 220 : 240}>
          <BarChart
            data={byMember}
            layout="vertical"
            margin={compact ? { left: 4, right: 8, top: 4, bottom: 4 } : { left: 16 }}
          >
            <CartesianGrid horizontal={false} stroke="#eceff3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={compact ? 64 : 80}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
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
