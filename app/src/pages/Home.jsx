import { user, transactions } from '../data/mock.js';
import PetCard from '../components/PetCard.jsx';
import WeeklyBudgetChart from '../components/WeeklyBudgetChart.jsx';
import SavingsGoalsCard from '../components/SavingsGoalsCard.jsx';
import TransactionItem from '../components/TransactionItem.jsx';

export default function Home() {
  return (
    <>
      <header className="header">
        <p className="muted">Welcome back,</p>
        <h1>{user.name} </h1>
      </header>

      <PetCard />
      <WeeklyBudgetChart />
      <SavingsGoalsCard />

      <section className="card assistant">
        <h2>Ask your AI assistant</h2>
        <p className="muted">Not sure where to start? Get help with your budget.</p>
        <button type="button" className="primary">
          Chat now
        </button>
      </section>

      <section className="card">
        <div className="row-between">
          <h2>Recent activity</h2>
          <button type="button" className="link">See all</button>
        </div>
        <ul className="list">
          {transactions.map((t) => (
            <TransactionItem key={t.id} tx={t} />
          ))}
        </ul>
      </section>
    </>
  );
}
