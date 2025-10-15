import { useState, useMemo } from 'react';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Modal';
import { useStore } from '../store/useSupabaseStore';
import {
  formatCurrency,
  getMonthlyTrend,
  getCategoryBreakdown,
  transactionsToCSV,
  downloadCSV,
  downloadJSON,
} from '../lib/utils';
import { format, subMonths, startOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function Reports() {
  const { transactions, accounts, categories, exportData } = useStore();
  const [timeRange, setTimeRange] = useState<'3' | '6' | '12'>('6');
  const [reportType, setReportType] = useState<'overview' | 'income' | 'expense'>('overview');

  const months = parseInt(timeRange);

  const filteredTransactions = useMemo(() => {
    const startDate = startOfMonth(subMonths(new Date(), months - 1));
    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, months]);

  const monthlyTrend = useMemo(() => getMonthlyTrend(transactions, months), [transactions, months]);

  const incomeBreakdown = useMemo(
    () => getCategoryBreakdown(filteredTransactions, categories, 'income'),
    [filteredTransactions, categories]
  );

  const expenseBreakdown = useMemo(
    () => getCategoryBreakdown(filteredTransactions, categories, 'expense'),
    [filteredTransactions, categories]
  );

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const avgMonthlyIncome = totalIncome / months;
    const avgMonthlyExpenses = totalExpenses / months;

    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    };
  }, [filteredTransactions, months]);

  const handleExportCSV = () => {
    const csv = transactionsToCSV(filteredTransactions, accounts, categories);
    downloadCSV(csv, `report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const handleExportJSON = async () => {
    const data = await exportData();
    downloadJSON(data, `wealthtrack-export-${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <p className="text-gray-400 mt-1">Analyze your financial data</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
          <Button variant="secondary" onClick={handleExportJSON}>
            <Download className="w-5 h-5 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
        </Select>

        <Select value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
          <option value="overview">Overview</option>
          <option value="income">Income Analysis</option>
          <option value="expense">Expense Analysis</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.totalIncome)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatCurrency(stats.avgMonthlyIncome)}/mo
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(stats.totalExpenses)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatCurrency(stats.avgMonthlyExpenses)}/mo
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Net Savings</p>
              <p
                className={`text-2xl font-bold ${
                  stats.netSavings >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(stats.netSavings)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.netSavings >= 0 ? 'Saved' : 'Overspent'}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Savings Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.savingsRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Of total income</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {reportType === 'overview' && (
        <>
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Income vs Expenses Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrend}>
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
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Income by Category</h3>
              {incomeBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={incomeBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {incomeBreakdown.map((entry, index) => (
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
                  <div className="space-y-2 mt-4">
                    {incomeBreakdown.map(item => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-300">{item.category}</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No income data
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Expenses by Category</h3>
              {expenseBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
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
                  <div className="space-y-2 mt-4">
                    {expenseBreakdown.map(item => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-300">{item.category}</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No expense data
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {reportType === 'income' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Monthly Income Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
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
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Income by Category</h3>
            {incomeBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incomeBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis dataKey="category" type="category" stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                      {incomeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {incomeBreakdown.map(item => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{item.category}</span>
                      <span className="text-sm font-bold text-green-500">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                No income data
              </div>
            )}
          </Card>
        </div>
      )}

      {reportType === 'expense' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Monthly Expense Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
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
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Expenses by Category</h3>
            {expenseBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis dataKey="category" type="category" stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {expenseBreakdown.map(item => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{item.category}</span>
                      <span className="text-sm font-bold text-red-500">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                No expense data
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
