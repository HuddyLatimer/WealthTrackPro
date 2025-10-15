import { useState, useMemo } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal, FormField, Input, Select } from '../components/Modal';
import { useStore } from '../store/useSupabaseStore';
import { formatCurrency, getBudgetStatus, getCategorySpending } from '../lib/utils';
import { format, startOfMonth } from 'date-fns';

export function Budgets() {
  const { budgets, categories, transactions, setBudget, deleteBudget } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
  });

  const currentMonthKey = format(startOfMonth(new Date(selectedMonth)), 'yyyy-MM-dd');
  const expenseCategories = useMemo(
    () => categories.filter(c => c.type === 'expense'),
    [categories]
  );

  const budgetData = useMemo(() => {
    return expenseCategories.map(category => {
      const budget = budgets.find(
        b => b.categoryId === category.id && b.month === currentMonthKey
      );

      if (budget) {
        const status = getBudgetStatus(budget, transactions);
        return {
          category,
          budget,
          ...status,
        };
      }

      const spent = getCategorySpending(transactions, category.id, new Date(selectedMonth));
      return {
        category,
        budget: null,
        spent,
        remaining: 0,
        percentage: 0,
        status: 'good' as const,
      };
    });
  }, [expenseCategories, budgets, transactions, currentMonthKey, selectedMonth]);

  const stats = useMemo(() => {
    const totalBudgeted = budgetData
      .filter(item => item.budget)
      .reduce((sum, item) => sum + item.budget!.amount, 0);

    const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);

    const onTrackCount = budgetData.filter(item => item.status === 'good').length;
    const warningCount = budgetData.filter(item => item.status === 'warning').length;
    const exceededCount = budgetData.filter(item => item.status === 'exceeded').length;

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      onTrackCount,
      warningCount,
      exceededCount,
    };
  }, [budgetData]);

  const handleOpenModal = (categoryId?: string) => {
    setFormData({
      categoryId: categoryId || '',
      amount: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setBudget(formData.categoryId, parseFloat(formData.amount), currentMonthKey);
    setIsModalOpen(false);
  };

  const handleDelete = async (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(budgetId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'exceeded':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Budgets</h2>
          <p className="text-gray-400 mt-1">Set and track spending limits</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-auto"
          />
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Set Budget
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-400 mb-1">Total Budgeted</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalBudgeted)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-blue-500">{formatCurrency(stats.totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400 mb-1">Remaining</p>
          <p
            className={`text-2xl font-bold ${
              stats.totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {formatCurrency(stats.totalRemaining)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400 mb-1">Budget Status</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-green-500">{stats.onTrackCount} on track</span>
            {stats.warningCount > 0 && (
              <span className="text-sm text-orange-500">{stats.warningCount} warning</span>
            )}
            {stats.exceededCount > 0 && (
              <span className="text-sm text-red-500">{stats.exceededCount} exceeded</span>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgetData.map(item => (
          <Card
            key={item.category.id}
            className={
              item.budget && item.status !== 'good'
                ? item.status === 'exceeded'
                  ? 'border-red-600'
                  : 'border-orange-600'
                : ''
            }
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.category.color}20` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{item.category.name}</h3>
                    {item.budget ? (
                      <p className="text-sm text-gray-400">
                        Budget: {formatCurrency(item.budget.amount)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">No budget set</p>
                    )}
                  </div>
                </div>
                {item.budget && getStatusIcon(item.status)}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Spent: {formatCurrency(item.spent)}
                  </span>
                  {item.budget && (
                    <span
                      className={
                        item.status === 'exceeded'
                          ? 'text-red-500 font-bold'
                          : item.status === 'warning'
                          ? 'text-orange-500 font-bold'
                          : 'text-green-500'
                      }
                    >
                      {item.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                {item.budget && (
                  <>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.status === 'exceeded'
                            ? 'bg-red-500'
                            : item.status === 'warning'
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>
                        Remaining: {formatCurrency(Math.max(item.remaining, 0))}
                      </span>
                      {item.status === 'exceeded' && (
                        <span className="text-red-500">
                          Over by {formatCurrency(Math.abs(item.remaining))}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-800">
                {item.budget ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(item.category.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.budget!.id)}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenModal(item.category.id)}
                  >
                    Set Budget
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {budgetData.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Categories Available</h3>
            <p className="text-gray-400">Create expense categories to set budgets</p>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Budget"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Category">
            <Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {expenseCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Budget Amount">
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </FormField>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              This budget will be set for {format(new Date(selectedMonth), 'MMMM yyyy')}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Set Budget</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
