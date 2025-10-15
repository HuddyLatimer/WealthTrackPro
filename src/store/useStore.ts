import { create } from 'zustand';
import { db, Account, Category, Transaction, RecurringTransaction, Budget } from '../lib/db';
import { format, startOfMonth } from 'date-fns';

interface AppState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  budgets: Budget[];

  initialized: boolean;
  loading: boolean;

  initialize: () => Promise<void>;

  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  processRecurringTransactions: () => Promise<void>;

  setBudget: (categoryId: string, amount: number, month?: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  seedInitialData: () => Promise<void>;
}

const generateId = () => crypto.randomUUID();

export const useStore = create<AppState>((set, get) => ({
  accounts: [],
  categories: [],
  transactions: [],
  recurringTransactions: [],
  budgets: [],
  initialized: false,
  loading: false,

  initialize: async () => {
    set({ loading: true });
    await db.init();

    const accounts = await db.getAll<Account>('accounts');
    const categories = await db.getAll<Category>('categories');
    const transactions = await db.getAll<Transaction>('transactions');
    const recurringTransactions = await db.getAll<RecurringTransaction>('recurringTransactions');
    const budgets = await db.getAll<Budget>('budgets');

    set({
      accounts,
      categories,
      transactions,
      recurringTransactions,
      budgets,
      initialized: true,
      loading: false
    });

    await get().processRecurringTransactions();
  },

  seedInitialData: async () => {
  },

  addAccount: async (accountData) => {
    const now = new Date().toISOString();
    const account: Account = {
      ...accountData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await db.add('accounts', account);
    set({ accounts: [...get().accounts, account] });
  },

  updateAccount: async (id, updates) => {
    const account = get().accounts.find(a => a.id === id);
    if (!account) return;

    const updated = { ...account, ...updates, updatedAt: new Date().toISOString() };
    await db.update('accounts', updated);
    set({ accounts: get().accounts.map(a => a.id === id ? updated : a) });
  },

  deleteAccount: async (id) => {
    await db.delete('accounts', id);
    set({ accounts: get().accounts.filter(a => a.id !== id) });
  },

  addCategory: async (categoryData) => {
    const category: Category = {
      ...categoryData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    await db.add('categories', category);
    set({ categories: [...get().categories, category] });
  },

  updateCategory: async (id, updates) => {
    const category = get().categories.find(c => c.id === id);
    if (!category) return;

    const updated = { ...category, ...updates };
    await db.update('categories', updated);
    set({ categories: get().categories.map(c => c.id === id ? updated : c) });
  },

  deleteCategory: async (id) => {
    await db.delete('categories', id);
    set({ categories: get().categories.filter(c => c.id !== id) });
  },

  addTransaction: async (transactionData) => {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...transactionData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await db.add('transactions', transaction);

    const account = get().accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      await get().updateAccount(account.id, { balance: account.balance + balanceChange });
    }

    set({ transactions: [...get().transactions, transaction] });
  },

  updateTransaction: async (id, updates) => {
    const oldTransaction = get().transactions.find(t => t.id === id);
    if (!oldTransaction) return;

    const updated = { ...oldTransaction, ...updates, updatedAt: new Date().toISOString() };
    await db.update('transactions', updated);

    if (updates.amount !== undefined || updates.type !== undefined || updates.accountId !== undefined) {
      const oldAccount = get().accounts.find(a => a.id === oldTransaction.accountId);
      const newAccount = get().accounts.find(a => a.id === updated.accountId);

      if (oldAccount) {
        const oldChange = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
        await get().updateAccount(oldAccount.id, { balance: oldAccount.balance + oldChange });
      }

      if (newAccount) {
        const newChange = updated.type === 'income' ? updated.amount : -updated.amount;
        await get().updateAccount(newAccount.id, { balance: newAccount.balance + newChange });
      }
    }

    set({ transactions: get().transactions.map(t => t.id === id ? updated : t) });
  },

  deleteTransaction: async (id) => {
    const transaction = get().transactions.find(t => t.id === id);
    if (!transaction) return;

    const account = get().accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      await get().updateAccount(account.id, { balance: account.balance + balanceChange });
    }

    await db.delete('transactions', id);
    set({ transactions: get().transactions.filter(t => t.id !== id) });
  },

  addRecurringTransaction: async (recurringData) => {
    const now = new Date().toISOString();
    const recurring: RecurringTransaction = {
      ...recurringData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await db.add('recurringTransactions', recurring);
    set({ recurringTransactions: [...get().recurringTransactions, recurring] });
  },

  updateRecurringTransaction: async (id, updates) => {
    const recurring = get().recurringTransactions.find(r => r.id === id);
    if (!recurring) return;

    const updated = { ...recurring, ...updates, updatedAt: new Date().toISOString() };
    await db.update('recurringTransactions', updated);
    set({ recurringTransactions: get().recurringTransactions.map(r => r.id === id ? updated : r) });
  },

  deleteRecurringTransaction: async (id) => {
    await db.delete('recurringTransactions', id);
    set({ recurringTransactions: get().recurringTransactions.filter(r => r.id !== id) });
  },

  processRecurringTransactions: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const recurring = get().recurringTransactions.filter(r => r.active && r.nextDate <= today);

    for (const r of recurring) {
      await get().addTransaction({
        accountId: r.accountId,
        categoryId: r.categoryId,
        amount: r.amount,
        type: r.type,
        description: r.description,
        date: r.nextDate,
        recurringTransactionId: r.id,
      });

      const nextDate = new Date(r.nextDate);
      switch (r.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      await get().updateRecurringTransaction(r.id, { nextDate: format(nextDate, 'yyyy-MM-dd') });
    }
  },

  setBudget: async (categoryId, amount, month) => {
    const budgetMonth = month || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const existing = get().budgets.find(b => b.categoryId === categoryId && b.month === budgetMonth);

    if (existing) {
      const updated = { ...existing, amount, updatedAt: new Date().toISOString() };
      await db.update('budgets', updated);
      set({ budgets: get().budgets.map(b => b.id === existing.id ? updated : b) });
    } else {
      const budget: Budget = {
        id: generateId(),
        categoryId,
        amount,
        month: budgetMonth,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.add('budgets', budget);
      set({ budgets: [...get().budgets, budget] });
    }
  },

  deleteBudget: async (id) => {
    await db.delete('budgets', id);
    set({ budgets: get().budgets.filter(b => b.id !== id) });
  },

  exportData: async () => {
    return db.exportData();
  },

  importData: async (jsonData) => {
    await db.importData(jsonData);
    await get().initialize();
  },
}));
