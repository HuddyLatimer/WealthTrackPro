import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowRight } from 'lucide-react';
import { Card, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { useStore } from '../store/useSupabaseStore';
import {
  formatCurrency,
  formatDate,
  calculateTotalIncome,
  calculateTotalExpenses,
  getMonthlyTrend,
  getBudgetStatus,
} from '../lib/utils';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { accounts, transactions, categories, budgets } = useStore();

  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const thisMonthIncome = calculateTotalIncome(transactions, new Date());
    const thisMonthExpenses = calculateTotalExpenses(transactions, new Date());
    const netBalance = thisMonthIncome - thisMonthExpenses;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthIncome = calculateTotalIncome(transactions, lastMonth);
    const lastMonthExpenses = calculateTotalExpenses(transactions, lastMonth);

    const incomeChange = lastMonthIncome > 0
      ? (((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1)
      : '0';
    const expenseChange = lastMonthExpenses > 0
      ? (((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100).toFixed(1)
      : '0';

    return {
      totalBalance,
      thisMonthIncome,
      thisMonthExpenses,
      netBalance,
      incomeChange: { value: `${Math.abs(Number(incomeChange))}%`, isPositive: Number(incomeChange) >= 0 },
      expenseChange: { value: `${Math.abs(Number(expenseChange))}%`, isPositive: Number(expenseChange) < 0 },
    };
  }, [accounts, transactions]);

  const monthlyTrend = useMemo(() => getMonthlyTrend(transactions, 6), [transactions]);

  const expenseBreakdown = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    return expenseCategories
      .map(category => {
        const total = transactions
          .filter(t => t.categoryId === category.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          name: category.name,
          value: total,
          color: category.color,
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, categories]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const budgetAlerts = useMemo(() => {
    return budgets
      .map(budget => {
        const status = getBudgetStatus(budget, transactions);
        const category = categories.find(c => c.id === budget.categoryId);
        return { budget, status, category };
      })
      .filter(item => item.status.status !== 'good')
      .sort((a, b) => b.status.percentage - a.status.percentage)
      .slice(0, 3);
  }, [budgets, transactions, categories]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={<Wallet className="w-6 h-6 text-white" />}
          color="blue"
        />
        <StatCard
          title="This Month Income"
          value={formatCurrency(stats.thisMonthIncome)}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          trend={stats.incomeChange}
          color="green"
        />
        <StatCard
          title="This Month Expenses"
          value={formatCurrency(stats.thisMonthExpenses)}
          icon={<TrendingDown className="w-6 h-6 text-white" />}
          trend={stats.expenseChange}
          color="red"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(stats.netBalance)}
          icon={<PiggyBank className="w-6 h-6 text-white" />}
          color={stats.netBalance >= 0 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Income vs Expenses (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Expense Breakdown</h3>
          {expenseBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => {
                const account = accounts.find(a => a.id === transaction.accountId);
                const category = categories.find(c => c.id === transaction.categoryId);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category?.color }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-400">
                          {category?.name} • {account?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-400">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Accounts</h3>
            <div className="space-y-3">
              {accounts.map(account => (
                <div key={account.id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white text-sm">{account.name}</p>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(account.balance)}
                  </p>
                  {account.goalAmount && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Goal: {formatCurrency(account.goalAmount)}</span>
                        <span>{((account.balance / account.goalAmount) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            backgroundColor: account.color,
                            width: `${Math.min((account.balance / account.goalAmount) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {budgetAlerts.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Budget Alerts</h3>
              <div className="space-y-3">
                {budgetAlerts.map(({ budget, status, category }) => (
                  <div
                    key={budget.id}
                    className={`p-3 rounded-lg border ${
                      status.status === 'exceeded'
                        ? 'bg-red-900/20 border-red-700'
                        : 'bg-orange-900/20 border-orange-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white text-sm">{category?.name}</p>
                      <span className="text-xs font-bold text-white">
                        {status.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-300">
                      {formatCurrency(status.spent)} of {formatCurrency(budget.amount)}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          status.status === 'exceeded' ? 'bg-red-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
