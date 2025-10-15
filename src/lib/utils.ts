import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Transaction, Budget, Category } from './db';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM d, yyyy');
};

export const getMonthKey = (date: Date = new Date()): string => {
  return format(startOfMonth(date), 'yyyy-MM-dd');
};

export const calculateTotalIncome = (transactions: Transaction[], month?: Date): number => {
  return transactions
    .filter(t => t.type === 'income' && (!month || isInMonth(t.date, month)))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateTotalExpenses = (transactions: Transaction[], month?: Date): number => {
  return transactions
    .filter(t => t.type === 'expense' && (!month || isInMonth(t.date, month)))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const isInMonth = (dateStr: string, month: Date): boolean => {
  const date = new Date(dateStr);
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  return date >= start && date <= end;
};

export const getCategorySpending = (
  transactions: Transaction[],
  categoryId: string,
  month?: Date
): number => {
  return transactions
    .filter(t =>
      t.categoryId === categoryId &&
      t.type === 'expense' &&
      (!month || isInMonth(t.date, month))
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getBudgetStatus = (
  budget: Budget,
  transactions: Transaction[]
): { spent: number; remaining: number; percentage: number; status: 'good' | 'warning' | 'exceeded' } => {
  const spent = getCategorySpending(transactions, budget.categoryId, new Date(budget.month));
  const remaining = budget.amount - spent;
  const percentage = (spent / budget.amount) * 100;

  let status: 'good' | 'warning' | 'exceeded' = 'good';
  if (percentage >= 100) status = 'exceeded';
  else if (percentage >= 80) status = 'warning';

  return { spent, remaining, percentage, status };
};

export const getMonthlyTrend = (transactions: Transaction[], months: number = 6) => {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = subMonths(new Date(), i);
    const monthKey = format(month, 'MMM yyyy');
    const income = calculateTotalIncome(transactions, month);
    const expenses = calculateTotalExpenses(transactions, month);

    result.push({
      month: monthKey,
      income,
      expenses,
      net: income - expenses,
    });
  }
  return result;
};

export const getCategoryBreakdown = (
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense',
  month?: Date
) => {
  return categories
    .filter(c => c.type === type)
    .map(category => {
      const total = transactions
        .filter(t =>
          t.categoryId === category.id &&
          t.type === type &&
          (!month || isInMonth(t.date, month))
        )
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: category.name,
        amount: total,
        color: category.color,
      };
    })
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const downloadJSON = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadCSV = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const transactionsToCSV = (
  transactions: Transaction[],
  accounts: { id: string; name: string }[],
  categories: { id: string; name: string }[]
): string => {
  const headers = ['Date', 'Description', 'Account', 'Category', 'Type', 'Amount', 'Notes'];
  const rows = transactions.map(t => [
    t.date,
    t.description,
    accounts.find(a => a.id === t.accountId)?.name || '',
    categories.find(c => c.id === t.categoryId)?.name || '',
    t.type,
    t.amount.toString(),
    t.notes || '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
};
