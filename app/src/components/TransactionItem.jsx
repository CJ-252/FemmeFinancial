import { money } from '../utils.js';

export default function TransactionItem({ tx }) {
  return (
    <li className="tx">
      <div>
        <p className="tx-title">{tx.title}</p>
        <p className="muted small">
          {tx.category} · {tx.date}
        </p>
      </div>
      <span className={tx.amount > 0 ? 'pos' : ''}>
        {tx.amount > 0 ? '+' : ''}
        {money(tx.amount)}
      </span>
    </li>
  );
}
