export const user = { name: 'Cheyenne' };

export const summary = {
  balance: 3240.55,
  income: 4200,
  spent: 2310.4,
};

// 50/30/20 rule: needs / wants / savings
export const budget = [
  { key: 'needs', label: 'Needs', target: 0.5, spent: 1480 },
  { key: 'wants', label: 'Wants', target: 0.3, spent: 620 },
  { key: 'savings', label: 'Savings', target: 0.2, spent: 210 },
];

export const transactions = [
  { id: 1, title: 'Groceries', category: 'Needs', amount: -64.2, date: 'Today' },
  { id: 2, title: 'Paycheck', category: 'Income', amount: 2100, date: 'Yesterday' },
  { id: 3, title: 'Coffee', category: 'Wants', amount: -5.75, date: 'Yesterday' },
  { id: 4, title: 'Rent', category: 'Needs', amount: -1200, date: 'Oct 29' },
];

export const pet = { name: 'Audrey', mood: 'Happy', level: 1 };

// Weekly limits come from the 50/30/20 split of the weekly budget
export const weeklyBudget = {
  needs: { spent: 210, limit: 485 },
  wants: { spent: 95, limit: 290 },
};

export const savingsGoals = [
  { id: 'emergency', name: 'Emergency fund', saved: 1200, target: 6900 },
  { id: 'trip', name: 'Beach trip', saved: 340, target: 800 },
  { id: 'laptop', name: 'New laptop', saved: 150, target: 1200 },
];
