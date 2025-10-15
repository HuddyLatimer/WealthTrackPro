import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, addDays, addWeeks, addMonths, addYears } from 'date-fns';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'emergency_savings';
  balance: number;
  goalAmount?: number;
  color: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  createdAt: string;
}

interface AppState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  budgets: Budget[];

  initialized: boolean;
  loading: boolean;

  initialize: () => Promise<void>;

  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'createdAt'>) => Promise<void>;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  processRecurringTransactions: () => Promise<void>;

  setBudget: (categoryId: string, amount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

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

    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    const { data: recurringTransactions } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('created_at', { ascending: true });

    const { data: budgets } = await supabase
      .from('budgets')
      .select('*');

    set({
      accounts: (accounts || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type as any,
        balance: Number(a.balance),
        goalAmount: a.goal_amount ? Number(a.goal_amount) : undefined,
        color: a.color,
        createdAt: a.created_at,
      })),
      categories: (categories || []).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as any,
        icon: c.icon,
        color: c.color,
        createdAt: c.created_at,
      })),
      transactions: (transactions || []).map(t => ({
        id: t.id,
        accountId: t.account_id,
        categoryId: t.category_id,
        amount: Number(t.amount),
        type: t.type as any,
        description: t.description,
        date: t.date,
        notes: t.notes || undefined,
        createdAt: t.created_at,
      })),
      recurringTransactions: (recurringTransactions || []).map(r => ({
        id: r.id,
        accountId: r.account_id,
        categoryId: r.category_id,
        amount: Number(r.amount),
        type: r.type as any,
        description: r.description,
        frequency: r.frequency as any,
        nextDate: r.next_date,
        createdAt: r.created_at,
      })),
      budgets: (budgets || []).map(b => ({
        id: b.id,
        categoryId: b.category_id,
        amount: Number(b.amount),
        createdAt: b.created_at,
      })),
      initialized: true,
      loading: false,
    });

    await get().processRecurringTransactions();
  },

  addAccount: async (accountData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance,
        goal_amount: accountData.goalAmount,
        color: accountData.color,
      })
      .select()
      .single();

    if (error) throw error;

    const account: Account = {
      id: data.id,
      name: data.name,
      type: data.type as any,
      balance: Number(data.balance),
      goalAmount: data.goal_amount ? Number(data.goal_amount) : undefined,
      color: data.color,
      createdAt: data.created_at,
    };

    set({ accounts: [...get().accounts, account] });
  },

  updateAccount: async (id, updates) => {
    const { error } = await supabase
      .from('accounts')
      .update({
        name: updates.name,
        type: updates.type,
        balance: updates.balance,
        goal_amount: updates.goalAmount,
        color: updates.color,
      })
      .eq('id', id);

    if (error) throw error;

    set({
      accounts: get().accounts.map(acc =>
        acc.id === id ? { ...acc, ...updates } : acc
      ),
    });
  },

  deleteAccount: async (id) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set({
      accounts: get().accounts.filter(acc => acc.id !== id),
    });
  },

  addCategory: async (categoryData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
        color: categoryData.color,
      })
      .select()
      .single();

    if (error) throw error;

    const category: Category = {
      id: data.id,
      name: data.name,
      type: data.type as any,
      icon: data.icon,
      color: data.color,
      createdAt: data.created_at,
    };

    set({ categories: [...get().categories, category] });
  },

  updateCategory: async (id, updates) => {
    const { error } = await supabase
      .from('categories')
      .update({
        name: updates.name,
        type: updates.type,
        icon: updates.icon,
        color: updates.color,
      })
      .eq('id', id);

    if (error) throw error;

    set({
      categories: get().categories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    });
  },

  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set({
      categories: get().categories.filter(cat => cat.id !== id),
    });
  },

  addTransaction: async (transactionData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: transactionData.accountId,
        category_id: transactionData.categoryId,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        date: transactionData.date,
        notes: transactionData.notes,
      })
      .select()
      .single();

    if (error) throw error;

    const transaction: Transaction = {
      id: data.id,
      accountId: data.account_id,
      categoryId: data.category_id,
      amount: Number(data.amount),
      type: data.type as any,
      description: data.description,
      date: data.date,
      notes: data.notes || undefined,
      createdAt: data.created_at,
    };

    const account = get().accounts.find(a => a.id === transactionData.accountId);
    if (account) {
      const newBalance = transactionData.type === 'income'
        ? account.balance + transactionData.amount
        : account.balance - transactionData.amount;

      await get().updateAccount(account.id, { balance: newBalance });
    }

    set({ transactions: [transaction, ...get().transactions] });
  },

  updateTransaction: async (id, updates) => {
    const oldTransaction = get().transactions.find(t => t.id === id);
    if (!oldTransaction) return;

    const { error } = await supabase
      .from('transactions')
      .update({
        account_id: updates.accountId,
        category_id: updates.categoryId,
        amount: updates.amount,
        type: updates.type,
        description: updates.description,
        date: updates.date,
        notes: updates.notes,
      })
      .eq('id', id);

    if (error) throw error;

    const oldAccount = get().accounts.find(a => a.id === oldTransaction.accountId);
    if (oldAccount) {
      const revertedBalance = oldTransaction.type === 'income'
        ? oldAccount.balance - oldTransaction.amount
        : oldAccount.balance + oldTransaction.amount;
      await get().updateAccount(oldAccount.id, { balance: revertedBalance });
    }

    const newAccountId = updates.accountId || oldTransaction.accountId;
    const newAccount = get().accounts.find(a => a.id === newAccountId);
    const newAmount = updates.amount ?? oldTransaction.amount;
    const newType = updates.type || oldTransaction.type;

    if (newAccount) {
      const newBalance = newType === 'income'
        ? newAccount.balance + newAmount
        : newAccount.balance - newAmount;
      await get().updateAccount(newAccount.id, { balance: newBalance });
    }

    set({
      transactions: get().transactions.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  },

  deleteTransaction: async (id) => {
    const transaction = get().transactions.find(t => t.id === id);
    if (!transaction) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const account = get().accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const newBalance = transaction.type === 'income'
        ? account.balance - transaction.amount
        : account.balance + transaction.amount;
      await get().updateAccount(account.id, { balance: newBalance });
    }

    set({
      transactions: get().transactions.filter(t => t.id !== id),
    });
  },

  addRecurringTransaction: async (recurringData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: user.id,
        account_id: recurringData.accountId,
        category_id: recurringData.categoryId,
        amount: recurringData.amount,
        type: recurringData.type,
        description: recurringData.description,
        frequency: recurringData.frequency,
        next_date: recurringData.nextDate,
      })
      .select()
      .single();

    if (error) throw error;

    const recurring: RecurringTransaction = {
      id: data.id,
      accountId: data.account_id,
      categoryId: data.category_id,
      amount: Number(data.amount),
      type: data.type as any,
      description: data.description,
      frequency: data.frequency as any,
      nextDate: data.next_date,
      createdAt: data.created_at,
    };

    set({ recurringTransactions: [...get().recurringTransactions, recurring] });
  },

  updateRecurringTransaction: async (id, updates) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({
        account_id: updates.accountId,
        category_id: updates.categoryId,
        amount: updates.amount,
        type: updates.type,
        description: updates.description,
        frequency: updates.frequency,
        next_date: updates.nextDate,
      })
      .eq('id', id);

    if (error) throw error;

    set({
      recurringTransactions: get().recurringTransactions.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  },

  deleteRecurringTransaction: async (id) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set({
      recurringTransactions: get().recurringTransactions.filter(r => r.id !== id),
    });
  },

  processRecurringTransactions: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const recurring = get().recurringTransactions.filter(
      r => r.nextDate <= today
    );

    for (const rec of recurring) {
      await get().addTransaction({
        accountId: rec.accountId,
        categoryId: rec.categoryId,
        amount: rec.amount,
        type: rec.type,
        description: rec.description,
        date: rec.nextDate,
      });

      let nextDate = new Date(rec.nextDate);
      switch (rec.frequency) {
        case 'daily':
          nextDate = addDays(nextDate, 1);
          break;
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, 1);
          break;
      }

      await get().updateRecurringTransaction(rec.id, {
        nextDate: format(nextDate, 'yyyy-MM-dd'),
      });
    }
  },

  setBudget: async (categoryId, amount) => {
    const existingBudget = get().budgets.find(b => b.categoryId === categoryId);

    if (existingBudget) {
      const { error } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existingBudget.id);

      if (error) throw error;

      set({
        budgets: get().budgets.map(b =>
          b.id === existingBudget.id ? { ...b, amount } : b
        ),
      });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          amount,
        })
        .select()
        .single();

      if (error) throw error;

      const budget: Budget = {
        id: data.id,
        categoryId: data.category_id,
        amount: Number(data.amount),
        createdAt: data.created_at,
      };

      set({ budgets: [...get().budgets, budget] });
    }
  },

  deleteBudget: async (id) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set({
      budgets: get().budgets.filter(b => b.id !== id),
    });
  },

  exportData: async () => {
    const data = {
      accounts: get().accounts,
      categories: get().categories,
      transactions: get().transactions,
      recurringTransactions: get().recurringTransactions,
      budgets: get().budgets,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData: async (jsonData) => {
    const data = JSON.parse(jsonData);

    for (const account of data.accounts) {
      await get().addAccount(account);
    }

    for (const category of data.categories) {
      await get().addCategory(category);
    }

    for (const transaction of data.transactions) {
      await get().addTransaction(transaction);
    }

    for (const recurring of data.recurringTransactions) {
      await get().addRecurringTransaction(recurring);
    }

    for (const budget of data.budgets) {
      await get().setBudget(budget.categoryId, budget.amount);
    }
  },

  clearAllData: async () => {
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('recurring_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    set({
      accounts: [],
      categories: [],
      transactions: [],
      recurringTransactions: [],
      budgets: [],
    });
  },
}));
