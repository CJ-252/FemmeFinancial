import { useEffect, useState } from 'react';
import { savingsGoals } from '../data/mock.js';
import { money } from '../utils.js';

const STORAGE_KEY = 'homeSavingsGoals';

function loadSelected() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {
    // fall through to default
  }
  return [savingsGoals[0].id];
}

export default function SavingsGoalsCard() {
  const [selected, setSelected] = useState(loadSelected);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const toggle = (id) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const shown = savingsGoals.filter((g) => selected.includes(g.id));

  return (
    <section className="card savings-card">
      <div className="row-between">
        <h2>Savings goals</h2>
        <button type="button" className="link" onClick={() => setEditing((e) => !e)}>
          {editing ? 'Done' : 'Choose'}
        </button>
      </div>

      {editing ? (
        <ul className="list">
          {savingsGoals.map((g) => (
            <li key={g.id} className="tx">
              <label className="check">
                <input
                  type="checkbox"
                  checked={selected.includes(g.id)}
                  onChange={() => toggle(g.id)}
                />
                {g.name}
              </label>
            </li>
          ))}
        </ul>
      ) : shown.length === 0 ? (
        <p className="muted">No goals selected. Tap Choose to pick some.</p>
      ) : (
        shown.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          return (
            <div className="budget" key={g.id}>
              <div className="row-between">
                <span>{g.name}</span>
                <span className="muted">
                  {money(g.saved)} / {money(g.target)}
                </span>
              </div>
              <div
                className="bar"
                role="progressbar"
                aria-label={g.name}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
