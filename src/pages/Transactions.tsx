import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Download } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal, FormField, Input, Select, Textarea } from '../components/Modal';
import { useStore } from '../store/useSupabaseStore';
import { formatCurrency, formatDate, transactionsToCSV, downloadCSV } from '../lib/utils';
import { Transaction } from '../lib/db';

export function Transactions() {
  const {
    transactions,
    accounts,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesAccount = filterAccount === 'all' || t.accountId === filterAccount;
      const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;

      return matchesSearch && matchesType && matchesAccount && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterType, filterAccount, filterCategory, sortBy, sortOrder]);

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        amount: transaction.amount.toString(),
        type: transaction.type,
        description: transaction.description,
        date: transaction.date,
        notes: transaction.notes || '',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        accountId: accounts[0]?.id || '',
        categoryId: categories[0]?.id || '',
        amount: '',
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      accountId: formData.accountId,
      categoryId: formData.categoryId,
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
      date: formData.date,
      notes: formData.notes || undefined,
    };

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleExport = () => {
    const csv = transactionsToCSV(filteredTransactions, accounts, categories);
    downloadCSV(csv, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const availableCategories = useMemo(() => {
    return categories.filter(c => c.type === formData.type);
  }, [categories, formData.type]);

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      total: filteredTransactions.length,
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transactions</h2>
          <p className="text-gray-400 mt-1">Track all your income and expenses</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-5 h-5 mr-2" />
            Export
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-400 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalIncome)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.totalExpenses)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400 mb-1">Net</p>
          <p className={`text-2xl font-bold ${stats.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(stats.net)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="pl-10"
              />
            </div>

            <div className="flex gap-3">
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>

              <Select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
                <option value="all">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </Select>

              <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Sort by:</span>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1 rounded ${sortBy === 'date' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('amount')}
              className={`px-3 py-1 rounded ${sortBy === 'amount' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Amount
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-gray-400 hover:text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Account</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => {
                  const account = accounts.find(a => a.id === transaction.accountId);
                  const category = categories.find(c => c.id === transaction.categoryId);

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{transaction.description}</p>
                          {transaction.notes && (
                            <p className="text-xs text-gray-400 mt-1">{transaction.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: account?.color }}
                          />
                          <span>{account?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {category?.name}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${
                            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(transaction)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Type">
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any, categoryId: '' })}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </FormField>

          <FormField label="Description">
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Grocery shopping"
              required
            />
          </FormField>

          <FormField label="Amount">
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </FormField>

          <FormField label="Date">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Account">
            <Select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
            >
              <option value="">Select an account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Category">
            <Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Notes (Optional)">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              rows={3}
            />
          </FormField>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTransaction ? 'Update' : 'Create'} Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
