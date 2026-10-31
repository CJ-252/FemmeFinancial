import { money } from '../utils.js';

export default function BudgetBar({ item, income }) {
  const limit = income * item.target;
  const pct = Math.min(100, Math.round((item.spent / limit) * 100));
  const over = item.spent > limit && item.key !== 'savings';

  return (
    <div className="budget">
      <div className="row-between">
        <span>
          {item.label} <span className="muted">({item.target * 100}%)</span>
        </span>
        <span className="muted">
          {money(item.spent)} / {money(limit)}
        </span>
      </div>
      <div
        className="bar"
        role="progressbar"
        aria-label={item.label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`bar-fill ${over ? 'over' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
