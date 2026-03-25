export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Interest', 'Gift', 'Other'];
export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Rent',
  'Utilities',
  'Transportation',
  'Dining',
  'Entertainment',
  'Health',
  'Travel',
  'Shopping',
  'Education',
  'Other',
];

export const ALL_CATEGORIES = Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]));

