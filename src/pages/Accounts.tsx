import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal, FormField, Input, Select } from '../components/Modal';
import { useStore } from '../store/useSupabaseStore';
import { formatCurrency, formatDate } from '../lib/utils';
import { Account } from '../lib/db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Accounts() {
  const { accounts, transactions, categories, addAccount, updateAccount, deleteAccount } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'emergency_savings',
    balance: '',
    goalAmount: '',
    color: '#3b82f6',
  });

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        goalAmount: account.goalAmount?.toString() || '',
        color: account.color,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: 'checking',
        balance: '0',
        goalAmount: '',
        color: '#3b82f6',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountData = {
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      goalAmount: formData.goalAmount ? parseFloat(formData.goalAmount) : undefined,
      color: formData.color,
    };

    if (editingAccount) {
      await updateAccount(editingAccount.id, accountData);
    } else {
      await addAccount(accountData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account? All associated transactions will remain but be orphaned.')) {
      await deleteAccount(id);
      if (selectedAccount === id) {
        setSelectedAccount(null);
      }
    }
  };

  const accountDetails = useMemo(() => {
    if (!selectedAccount) return null;

    const account = accounts.find(a => a.id === selectedAccount);
    if (!account) return null;

    const accountTransactions = transactions
      .filter(t => t.accountId === selectedAccount)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const balanceHistory = accountTransactions
      .slice()
      .reverse()
      .reduce((acc, t, idx) => {
        const prevBalance = idx === 0 ? account.balance - accountTransactions.reduce((sum, tx) => {
          return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
        }, 0) : acc[idx - 1].balance;

        const change = t.type === 'income' ? t.amount : -t.amount;
        acc.push({
          date: t.date,
          balance: prevBalance + change,
        });
        return acc;
      }, [] as { date: string; balance: number }[])
      .slice(-30);

    return {
      account,
      transactions: accountTransactions,
      balanceHistory,
    };
  }, [selectedAccount, accounts, transactions]);

  const colors = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ef4444', label: 'Red' },
    { value: '#06b6d4', label: 'Cyan' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Accounts</h2>
          <p className="text-gray-400 mt-1">Manage your financial accounts</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <Card
            key={account.id}
            hover
            className={`cursor-pointer ${selectedAccount === account.id ? 'ring-2 ring-blue-600' : ''}`}
            onClick={() => setSelectedAccount(account.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <h3 className="font-bold text-white">{account.name}</h3>
                </div>
                <p className="text-sm text-gray-400 capitalize">
                  {account.type.replace('_', ' ')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(account);
                  }}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(account.id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold text-white">
                {formatCurrency(account.balance)}
              </p>
            </div>

            {account.goalAmount && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Goal: {formatCurrency(account.goalAmount)}</span>
                  <span>{((account.balance / account.goalAmount) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: account.color,
                      width: `${Math.min((account.balance / account.goalAmount) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {accountDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Balance History</h3>
            {accountDetails.balanceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={accountDetails.balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke={accountDetails.account.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No transaction history
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {accountDetails.transactions.length > 0 ? (
                accountDetails.transactions.slice(0, 10).map(transaction => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category?.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <p
                        className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No transactions for this account
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Edit Account' : 'Add Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Account Name">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Checking"
              required
            />
          </FormField>

          <FormField label="Account Type">
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="emergency_savings">Emergency Savings</option>
            </Select>
          </FormField>

          <FormField label="Current Balance">
            <Input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0.00"
              required
            />
          </FormField>

          <FormField label="Savings Goal (Optional)">
            <Input
              type="number"
              step="0.01"
              value={formData.goalAmount}
              onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Color">
            <Select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            >
              {colors.map(color => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAccount ? 'Update' : 'Create'} Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
