import { weeklyBudget } from '../data/mock.js';
import { money } from '../utils.js';

const RADIUS = 15.9155; // circumference = 100, so dash lengths are percentages

export default function WeeklyBudgetChart() {
  const { needs, wants } = weeklyBudget;
  const total = needs.limit + wants.limit;
  const spent = needs.spent + wants.spent;
  const left = Math.max(0, total - spent);
  const denom = Math.max(total, spent);

  const segments = [
    { key: 'needs', label: 'Needs', value: needs.spent, color: 'var(--needs)' },
    { key: 'wants', label: 'Wants', value: wants.spent, color: 'var(--wants)' },
    { key: 'left', label: 'Left', value: left, color: 'var(--left)' },
  ];

  let offset = 0;
  const arcs = segments.map((s) => {
    const len = (s.value / denom) * 100;
    const arc = { ...s, len, offset };
    offset += len;
    return arc;
  });

  return (
    <section className="card">
      <h2>Weekly Budget</h2>
      <div className="pie-wrap">
        <svg viewBox="0 0 42 42" className="pie" role="img" aria-label={`${money(left)} left this week`}>
          {arcs.map((a) => (
            <circle
              key={a.key}
              cx="21"
              cy="21"
              r={RADIUS}
              fill="none"
              stroke={a.color}
              strokeWidth="8"
              strokeDasharray={`${a.len} ${100 - a.len}`}
              strokeDashoffset={25 - a.offset}
            />
          ))}
        </svg>
        <ul className="legend">
          {segments.map((s) => (
            <li key={s.key}>
              <span className="dot" style={{ background: s.color }} />
              {s.label}
              <strong>{money(s.value)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
