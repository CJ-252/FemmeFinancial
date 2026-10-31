const tabs = [
  { id: 'home', label: 'Home',   icon: '🌳' },
  { id: 'budget', label: 'Budget', icon: '🍃' },
  { id: 'savings', label: 'Savings', icon: '🌱' },
  { id: 'assistant', label: 'Assistant', icon: '💬' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="nav" aria-label="Main">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={t.id === active ? 'active' : ''}
          aria-current={t.id === active ? 'page' : undefined}
          onClick={() => onChange(t.id)}
        >
          <span aria-hidden="true">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
